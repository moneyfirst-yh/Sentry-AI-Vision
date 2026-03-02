import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { nativeApi } from '../services/nativeApi';
import type { TelemetrySample } from '../types/ui';
import { useTelemetrySim } from './useTelemetrySim';

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function useTelemetry() {
  const sim = useTelemetrySim();
  const cpuUsage = ref(sim.cpuUsage.value);
  const gpuUsage = ref(sim.gpuUsage.value);
  const fps = ref(sim.fps.value);
  const useFallback = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;

  const applySample = (sample: TelemetrySample, fallback: TelemetrySample) => {
    cpuUsage.value = clamp(sample.cpuUsage);
    gpuUsage.value = clamp(
      typeof sample.gpuUsage === 'number' ? sample.gpuUsage : fallback.gpuUsage ?? 0,
    );
    fps.value =
      typeof sample.fps === 'number' ? sample.fps : fallback.fps ?? fps.value;
  };

  const pollNative = async () => {
    try {
      const sample = await nativeApi.system.telemetry();
      if (sample && Number.isFinite(sample.cpuUsage)) {
        useFallback.value = false;
        applySample(sample, {
          cpuUsage: sim.cpuUsage.value,
          gpuUsage: sim.gpuUsage.value,
          fps: sim.fps.value,
        });
        return;
      }
    } catch {
      // Ignore and fall back to simulated telemetry.
    }
    useFallback.value = true;
    applySample(
      {
        cpuUsage: sim.cpuUsage.value,
        gpuUsage: sim.gpuUsage.value,
        fps: sim.fps.value,
      },
      {
        cpuUsage: sim.cpuUsage.value,
        gpuUsage: sim.gpuUsage.value,
        fps: sim.fps.value,
      },
    );
  };

  onMounted(() => {
    void pollNative();
    timer = setInterval(pollNative, 2000);
  });

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  });

  watch([sim.cpuUsage, sim.gpuUsage, sim.fps], () => {
    if (useFallback.value) {
      applySample(
        {
          cpuUsage: sim.cpuUsage.value,
          gpuUsage: sim.gpuUsage.value,
          fps: sim.fps.value,
        },
        {
          cpuUsage: sim.cpuUsage.value,
          gpuUsage: sim.gpuUsage.value,
          fps: sim.fps.value,
        },
      );
    }
  });

  return {
    cpuUsage,
    gpuUsage,
    fps,
    useFallback,
  };
}
