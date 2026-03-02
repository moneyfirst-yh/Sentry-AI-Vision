import { computed, onBeforeUnmount, ref } from 'vue';

type CameraStatus = 'idle' | 'starting' | 'running' | 'error';
type SourceMode = 'none' | 'camera' | 'sample';

const isBenignPlayInterruption = (err: unknown) => {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return true;
  }
  if (!(err instanceof Error)) {
    return false;
  }
  return err.message.includes('interrupted by a new load request');
};

const waitWithTimeout = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const resolveRuntimeAssetPath = (assetRelativePath: string) => {
  const normalized = assetRelativePath.replace(/^\.?\/+/, '');
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return `./${normalized}`;
  }

  const base = import.meta.env.BASE_URL || '/';
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  return `${baseWithSlash}${normalized}`;
};

const SAMPLE_VIDEO_PATH = resolveRuntimeAssetPath('media/person-activity.mp4');

export function useCameraStream() {
  const videoElement = ref<HTMLVideoElement | null>(null);
  const stream = ref<MediaStream | null>(null);
  const sourceMode = ref<SourceMode>('none');
  const status = ref<CameraStatus>('idle');
  const error = ref<string | null>(null);
  let playRequestId = 0;

  const waitForVideoReady = async (video: HTMLVideoElement) => {
    if (video.readyState >= 2) {
      return;
    }
    await new Promise<void>((resolve) => {
      const onReady = () => resolve();
      video.addEventListener('loadedmetadata', onReady, { once: true });
      video.addEventListener('loadeddata', onReady, { once: true });
      video.addEventListener('canplay', onReady, { once: true });
      window.setTimeout(resolve, 800);
    });
  };

  const attachSource = async () => {
    const video = videoElement.value;
    if (!video) {
      return;
    }

    const requestId = ++playRequestId;

    if (sourceMode.value === 'camera' && stream.value) {
      if (video.srcObject !== stream.value) {
        video.srcObject = stream.value;
      }
      if (video.src) {
        video.removeAttribute('src');
      }
      video.loop = false;
    } else if (sourceMode.value === 'sample') {
      if (video.srcObject) {
        video.srcObject = null;
      }
      if (!video.src || !video.src.includes('person-activity.mp4')) {
        video.src = SAMPLE_VIDEO_PATH;
      }
      video.loop = true;
      video.preload = 'auto';
    } else {
      return;
    }

    video.muted = true;
    video.playsInline = true;
    await waitForVideoReady(video);

    try {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        await Promise.race([playPromise, waitWithTimeout(1500)]);
      }
    } catch (err) {
      if (requestId !== playRequestId || isBenignPlayInterruption(err)) {
        return;
      }
      throw err;
    }
  };

  const bindVideoElement = (element: HTMLVideoElement | null) => {
    videoElement.value = element;
    if (element && sourceMode.value !== 'none') {
      void attachSource().catch((err) => {
        status.value = 'error';
        error.value =
          err instanceof Error ? err.message : 'Unable to attach video source.';
      });
    }
  };

  const startFallbackVideo = async () => {
    sourceMode.value = 'sample';
    status.value = 'running';
    error.value = null;
    await attachSource();
  };

  const start = async () => {
    if (status.value === 'running' || status.value === 'starting') {
      return;
    }

    status.value = 'starting';
    error.value = null;

    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
          frameRate: { ideal: 24, max: 30 },
        },
      });
      sourceMode.value = 'camera';
      status.value = 'running';
      await attachSource();
      return;
    } catch {
      stream.value = null;
      sourceMode.value = 'none';
    }

    try {
      await startFallbackVideo();
    } catch (err) {
      status.value = 'error';
      error.value =
        err instanceof Error
          ? err.message
          : 'Unable to access camera stream or fallback video.';
    }
  };

  const stop = () => {
    playRequestId += 1;
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop());
      stream.value = null;
    }
    sourceMode.value = 'none';
    if (videoElement.value) {
      videoElement.value.pause();
      videoElement.value.srcObject = null;
      videoElement.value.removeAttribute('src');
      videoElement.value.load();
    }
    status.value = 'idle';
    error.value = null;
  };

  onBeforeUnmount(() => {
    stop();
  });

  return {
    bindVideoElement,
    error,
    hasStream: computed(() => Boolean(stream.value)),
    isRunning: computed(() => status.value === 'running'),
    sourceMode: computed(() => sourceMode.value),
    start,
    status,
    stop,
    videoElement,
  };
}
