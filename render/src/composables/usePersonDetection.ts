import { computed, onBeforeUnmount, ref, type Ref, watch } from 'vue';
import type { PersonBox } from '../types/ui';

type DetectorStatus = 'idle' | 'loading' | 'running' | 'error';

type OrtModule = typeof import('onnxruntime-web/wasm');
type OrtSession = import('onnxruntime-web/wasm').InferenceSession;
type OrtTensor = import('onnxruntime-web/wasm').Tensor;

const resolveRuntimeAssetPath = (assetRelativePath: string) => {
  const normalized = assetRelativePath.replace(/^\.?\/+/, '');
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return `./${normalized}`;
  }

  const base = import.meta.env.BASE_URL || '/';
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  return `${baseWithSlash}${normalized}`;
};

const MODEL_ASSET = resolveRuntimeAssetPath('models/yolo11n.onnx');
const WASM_ASSET = resolveRuntimeAssetPath(
  'onnxruntime/ort-wasm-simd-threaded.wasm',
);
const DETECTOR_INIT_TIMEOUT_MS = 20000;
const INPUT_SIZE = 640;
const PERSON_CLASS_INDEX = 0;
const MAX_DETECTIONS = 8;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number) =>
  new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(
        new Error(`Detector initialization timed out after ${timeoutMs}ms.`),
      );
    }, timeoutMs);
    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        window.clearTimeout(timer);
        reject(err);
      });
  });

interface DetectorHandle {
  ort: OrtModule;
  session: OrtSession;
  inputName: string;
  outputName: string;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  inputBuffer: Float32Array;
}

interface Candidate {
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const iou = (a: Candidate, b: Candidate) => {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);

  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);
  const intersection = width * height;
  if (intersection <= 0) {
    return 0;
  }

  const union = a.width * a.height + b.width * b.height - intersection;
  if (union <= 0) {
    return 0;
  }

  return intersection / union;
};

const nonMaximumSuppression = (
  candidates: Candidate[],
  maxResults: number,
  iouThreshold: number,
) => {
  const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence);
  const picked: Candidate[] = [];

  while (sorted.length > 0 && picked.length < maxResults) {
    const current = sorted.shift();
    if (!current) {
      break;
    }
    picked.push(current);

    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      if (iou(current, sorted[i]) > iouThreshold) {
        sorted.splice(i, 1);
      }
    }
  }

  return picked;
};

const mapModelOutputToCandidates = (
  outputData: Float32Array,
  dims: readonly number[],
  confidenceThreshold: number,
) => {
  if (dims.length !== 3 || dims[0] !== 1) {
    return [] as Candidate[];
  }

  const dim1 = dims[1];
  const dim2 = dims[2];

  let candidateCount = 0;
  let featureCount = 0;
  let channelsFirst = false;

  if ((dim1 === 84 || dim1 === 85) && dim2 > 0) {
    channelsFirst = true;
    featureCount = dim1;
    candidateCount = dim2;
  } else if ((dim2 === 84 || dim2 === 85) && dim1 > 0) {
    channelsFirst = false;
    candidateCount = dim1;
    featureCount = dim2;
  } else {
    return [] as Candidate[];
  }

  if (featureCount < 6) {
    return [] as Candidate[];
  }

  const classStart = featureCount === 85 ? 5 : 4;
  const personIndex = classStart + PERSON_CLASS_INDEX;
  if (personIndex >= featureCount) {
    return [] as Candidate[];
  }

  const readValue = (candidateIndex: number, featureIndex: number) => {
    if (channelsFirst) {
      return outputData[featureIndex * candidateCount + candidateIndex];
    }
    return outputData[candidateIndex * featureCount + featureIndex];
  };

  const mapped: Candidate[] = [];
  for (let index = 0; index < candidateCount; index += 1) {
    const centerX = readValue(index, 0);
    const centerY = readValue(index, 1);
    const width = readValue(index, 2);
    const height = readValue(index, 3);

    if (width <= 0 || height <= 0) {
      continue;
    }

    const objectness = featureCount === 85 ? readValue(index, 4) : 1;
    const classScore = readValue(index, personIndex);
    const confidence = objectness * classScore;

    if (!Number.isFinite(confidence) || confidence < confidenceThreshold) {
      continue;
    }

    mapped.push({
      confidence,
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height,
    });
  }

  return mapped;
};

export function usePersonDetection(
  videoElement: Ref<HTMLVideoElement | null>,
  sensitivity: Ref<number>,
) {
  const status = ref<DetectorStatus>('idle');
  const error = ref<string | null>(null);
  const boxes = ref<PersonBox[]>([]);
  const targetCount = ref(0);
  const proximityScore = ref(0);
  const movementScore = ref(0);
  const inferenceFps = ref(0);

  const isRunning = ref(false);
  let detector: DetectorHandle | null = null;
  let loopId = 0;
  let lastInferAt = 0;
  let lastTopCenter: { x: number; y: number; area: number } | null = null;
  let lastFpsTickAt = performance.now();
  let inferCountSinceTick = 0;

  const minimumConfidence = computed(() => {
    const normalized = clamp(sensitivity.value, 0, 100) / 100;
    return clamp(0.55 - normalized * 0.35, 0.2, 0.55);
  });

  const loadDetector = async () => {
    if (detector) {
      return detector;
    }

    status.value = 'loading';
    error.value = null;

    try {
      const buildDetector = async () => {
        const ort = await import('onnxruntime-web/wasm');
        ort.env.logLevel = 'error';
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.proxy = false;
        ort.env.wasm.wasmPaths = {
          wasm: WASM_ASSET,
        };

        const session = await ort.InferenceSession.create(MODEL_ASSET, {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all',
          logSeverityLevel: 3,
        });

        const canvas = document.createElement('canvas');
        canvas.width = INPUT_SIZE;
        canvas.height = INPUT_SIZE;

        const context = canvas.getContext('2d', {
          willReadFrequently: true,
        });
        if (!context) {
          throw new Error('Unable to create canvas context for detector.');
        }

        return {
          ort,
          session,
          inputName: session.inputNames[0],
          outputName: session.outputNames[0],
          canvas,
          context,
          inputBuffer: new Float32Array(3 * INPUT_SIZE * INPUT_SIZE),
        } as DetectorHandle;
      };

      detector = await withTimeout(buildDetector(), DETECTOR_INIT_TIMEOUT_MS);
      return detector;
    } catch (err) {
      status.value = 'error';
      error.value =
        err instanceof Error
          ? err.message
          : 'Unable to initialize person detector.';
      throw err;
    }
  };

  const resetMetrics = () => {
    boxes.value = [];
    targetCount.value = 0;
    proximityScore.value = 0;
    movementScore.value = 0;
    inferenceFps.value = 0;
    lastTopCenter = null;
  };

  const inferOneFrame = async () => {
    if (!videoElement.value || !detector) {
      return;
    }
    if (videoElement.value.readyState < 2) {
      return;
    }

    const sourceWidth = videoElement.value.videoWidth;
    const sourceHeight = videoElement.value.videoHeight;
    if (!sourceWidth || !sourceHeight) {
      return;
    }

    const scale = Math.min(INPUT_SIZE / sourceWidth, INPUT_SIZE / sourceHeight);
    const scaledWidth = sourceWidth * scale;
    const scaledHeight = sourceHeight * scale;
    const padX = (INPUT_SIZE - scaledWidth) / 2;
    const padY = (INPUT_SIZE - scaledHeight) / 2;

    detector.context.fillStyle = '#000';
    detector.context.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
    detector.context.drawImage(
      videoElement.value,
      padX,
      padY,
      scaledWidth,
      scaledHeight,
    );

    const pixels = detector.context.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data;
    const planeSize = INPUT_SIZE * INPUT_SIZE;
    for (let index = 0, offset = 0; index < planeSize; index += 1, offset += 4) {
      detector.inputBuffer[index] = pixels[offset] / 255;
      detector.inputBuffer[index + planeSize] = pixels[offset + 1] / 255;
      detector.inputBuffer[index + planeSize * 2] = pixels[offset + 2] / 255;
    }

    const inputTensor = new detector.ort.Tensor(
      'float32',
      detector.inputBuffer,
      [1, 3, INPUT_SIZE, INPUT_SIZE],
    ) as OrtTensor;

    const result = await detector.session.run({
      [detector.inputName]: inputTensor,
    });

    const output = result[detector.outputName];
    if (!output || !(output.data instanceof Float32Array)) {
      throw new Error('Detector output format is unsupported.');
    }

    const rawCandidates = mapModelOutputToCandidates(
      output.data,
      output.dims,
      minimumConfidence.value,
    );

    const picked = nonMaximumSuppression(rawCandidates, MAX_DETECTIONS, 0.45);

    const frameArea = sourceWidth * sourceHeight;
    const mapped: PersonBox[] = picked
      .map((item, index) => {
        const left = (item.x - padX) / scale;
        const top = (item.y - padY) / scale;
        const width = item.width / scale;
        const height = item.height / scale;

        const clampedLeft = clamp(left, 0, sourceWidth);
        const clampedTop = clamp(top, 0, sourceHeight);
        const clampedRight = clamp(left + width, 0, sourceWidth);
        const clampedBottom = clamp(top + height, 0, sourceHeight);

        const mappedWidth = Math.max(1, clampedRight - clampedLeft);
        const mappedHeight = Math.max(1, clampedBottom - clampedTop);
        const areaRatio = clamp((mappedWidth * mappedHeight) / frameArea, 0, 1);

        return {
          id: `person-${index}-${Math.round(clampedLeft)}-${Math.round(clampedTop)}`,
          confidence: clamp(item.confidence * 100, 0, 100),
          xPct: clamp((clampedLeft / sourceWidth) * 100, 0, 100),
          yPct: clamp((clampedTop / sourceHeight) * 100, 0, 100),
          widthPct: clamp((mappedWidth / sourceWidth) * 100, 1, 100),
          heightPct: clamp((mappedHeight / sourceHeight) * 100, 1, 100),
          areaRatio,
        };
      })
      .sort((a, b) => b.areaRatio - a.areaRatio);

    boxes.value = mapped;
    targetCount.value = mapped.length;

    const topArea = mapped[0]?.areaRatio ?? 0;
    proximityScore.value = clamp(topArea * 700, 0, 100);

    if (mapped[0]) {
      const current = mapped[0];
      const centerX = current.xPct + current.widthPct / 2;
      const centerY = current.yPct + current.heightPct / 2;
      if (!lastTopCenter) {
        lastTopCenter = { x: centerX, y: centerY, area: current.areaRatio };
      } else {
        const centerSpeed = Math.hypot(
          centerX - lastTopCenter.x,
          centerY - lastTopCenter.y,
        );
        const areaDelta = Math.abs(current.areaRatio - lastTopCenter.area);
        const rawScore = clamp(centerSpeed * 3 + areaDelta * 480, 0, 100);
        movementScore.value = movementScore.value * 0.65 + rawScore * 0.35;
        lastTopCenter = { x: centerX, y: centerY, area: current.areaRatio };
      }
    } else {
      movementScore.value *= 0.75;
      lastTopCenter = null;
    }

    inferCountSinceTick += 1;
    const now = performance.now();
    if (now - lastFpsTickAt >= 1000) {
      const nextFps = (inferCountSinceTick * 1000) / (now - lastFpsTickAt);
      inferenceFps.value = inferenceFps.value * 0.4 + nextFps * 0.6;
      inferCountSinceTick = 0;
      lastFpsTickAt = now;
    }
  };

  const loop = async () => {
    if (!isRunning.value) {
      return;
    }

    const now = performance.now();
    const minInterval = 1000 / 12;
    if (now - lastInferAt >= minInterval) {
      lastInferAt = now;
      try {
        await inferOneFrame();
      } catch (err) {
        status.value = 'error';
        error.value =
          err instanceof Error ? err.message : 'Detection loop failed unexpectedly.';
        isRunning.value = false;
      }
    }

    loopId = window.requestAnimationFrame(() => {
      void loop();
    });
  };

  const start = async () => {
    if (isRunning.value) {
      return true;
    }

    try {
      await loadDetector();
      status.value = 'running';
      isRunning.value = true;
      lastInferAt = 0;
      lastFpsTickAt = performance.now();
      inferCountSinceTick = 0;
      loopId = window.requestAnimationFrame(() => {
        void loop();
      });
      return true;
    } catch {
      isRunning.value = false;
      return false;
    }
  };

  const stop = () => {
    isRunning.value = false;
    status.value = status.value === 'error' ? 'error' : 'idle';
    if (loopId) {
      window.cancelAnimationFrame(loopId);
      loopId = 0;
    }
    resetMetrics();
  };

  watch(
    sensitivity,
    () => {
      // Threshold reacts automatically through minimumConfidence.
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    stop();
    detector = null;
  });

  return {
    boxes,
    error,
    inferenceFps,
    movementScore,
    proximityScore,
    start,
    status,
    stop,
    targetCount,
  };
}
