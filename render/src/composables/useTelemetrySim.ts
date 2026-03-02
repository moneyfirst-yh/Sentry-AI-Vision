import { onBeforeUnmount, onMounted, ref } from 'vue';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function useTelemetrySim() {
  const cpuUsage = ref(42);
  const gpuUsage = ref(68);
  const fps = ref(30);
  let timer: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    timer = setInterval(() => {
      cpuUsage.value = clamp(cpuUsage.value + (Math.random() * 4 - 2), 30, 60);
      gpuUsage.value = clamp(gpuUsage.value + (Math.random() * 6 - 3), 50, 85);
      fps.value = clamp(fps.value + (Math.random() * 2 - 1), 28, 32);
    }, 2000);
  });

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  });

  return {
    cpuUsage,
    gpuUsage,
    fps,
  };
}
