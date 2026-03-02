<script setup lang="ts">
import { computed } from 'vue';
import type { Translator } from '../../composables/useI18n';

const props = defineProps<{
  t: Translator;
  sourceMode: 'none' | 'camera' | 'sample';
  cameraStatus: 'idle' | 'starting' | 'running' | 'error';
  detectorStatus: 'idle' | 'loading' | 'running' | 'error';
  cameraError: string | null;
  detectorError: string | null;
  targetCount: number;
  movementText: string;
  distanceText: string;
  fps: number;
  cpuUsage: number;
  gpuUsage: number;
}>();

const resolveStatusLabel = (status: string) => {
  if (status === 'loading') {
    return props.t('status.starting', 'Starting');
  }
  return props.t(`status.${status}`, status);
};

const resolveStatusClass = (status: string) => {
  if (status === 'error') {
    return 'text-red-300 bg-red-500/10 border-red-500/30';
  }
  if (status === 'running') {
    return 'text-primary bg-primary/10 border-primary/30';
  }
  if (status === 'loading' || status === 'starting') {
    return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
  }
  return 'text-slate-400 bg-slate-700/30 border-slate-700';
};

const sourceLabel = computed(() => {
  if (props.sourceMode === 'camera') {
    return props.t('cameras.source.camera', 'Camera');
  }
  if (props.sourceMode === 'sample') {
    return props.t('cameras.source.sample', 'Sample Video');
  }
  return props.t('cameras.source.none', 'Disconnected');
});
</script>

<template>
  <section class="ui-section">
    <div class="flex items-baseline gap-2 mb-3">
      <h3 class="text-sm font-bold uppercase tracking-widest text-slate-500">
        {{ props.t('cameras.title', 'Camera Health') }}
      </h3>
      <span class="text-[10px] text-slate-500/60 font-bold uppercase">
        {{ props.t('cameras.subtitle', 'Runtime and detector status') }}
      </span>
    </div>

    <div class="grid grid-cols-1 gap-3">
      <div class="ui-card-soft p-4 grid grid-cols-1 gap-3">
        <div class="flex items-center justify-between">
          <p class="text-xs text-slate-400 font-semibold uppercase">
            {{ props.t('cameras.sourceMode', 'Source Mode') }}
          </p>
          <span class="ui-pill text-primary bg-primary/10">{{ sourceLabel }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="border rounded-lg p-3" :class="resolveStatusClass(props.cameraStatus)">
            <p class="text-[10px] uppercase font-bold">
              {{ props.t('cameras.cameraStatus', 'Camera Status') }}
            </p>
            <p class="text-sm font-semibold mt-1">
              {{ resolveStatusLabel(props.cameraStatus) }}
            </p>
          </div>
          <div class="border rounded-lg p-3" :class="resolveStatusClass(props.detectorStatus)">
            <p class="text-[10px] uppercase font-bold">
              {{ props.t('cameras.detectorStatus', 'Detector Status') }}
            </p>
            <p class="text-sm font-semibold mt-1">
              {{ resolveStatusLabel(props.detectorStatus) }}
            </p>
          </div>
        </div>

        <div v-if="props.cameraError || props.detectorError" class="grid grid-cols-1 gap-2">
          <div v-if="props.cameraError" class="ui-card-soft border border-red-500/20 p-3">
            <p class="text-[10px] uppercase font-bold text-red-300">
              {{ props.t('cameras.cameraError', 'Camera Error') }}
            </p>
            <p class="text-xs text-slate-200 mt-1">{{ props.cameraError }}</p>
          </div>
          <div v-if="props.detectorError" class="ui-card-soft border border-red-500/20 p-3">
            <p class="text-[10px] uppercase font-bold text-red-300">
              {{ props.t('cameras.detectorError', 'Detector Error') }}
            </p>
            <p class="text-xs text-slate-200 mt-1">{{ props.detectorError }}</p>
          </div>
        </div>
      </div>

      <div class="ui-card-soft p-4">
        <div class="flex items-baseline justify-between mb-3">
          <div>
            <p class="text-xs text-slate-400 font-semibold uppercase">
              {{ props.t('cameras.metrics.title', 'Key Metrics') }}
            </p>
            <p class="text-[10px] text-slate-500 mt-1">
              {{ props.t('cameras.metrics.subtitle', 'Runtime performance and detection') }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="ui-card p-3">
            <p class="text-[10px] uppercase font-bold text-slate-500">
              {{ props.t('cameras.metric.targets', 'Targets') }}
            </p>
            <p class="text-lg font-semibold mt-1">{{ props.targetCount }}</p>
          </div>
          <div class="ui-card p-3">
            <p class="text-[10px] uppercase font-bold text-slate-500">
              {{ props.t('cameras.metric.movement', 'Movement') }}
            </p>
            <p class="text-sm font-semibold mt-1">{{ props.movementText }}</p>
          </div>
          <div class="ui-card p-3">
            <p class="text-[10px] uppercase font-bold text-slate-500">
              {{ props.t('cameras.metric.distance', 'Distance') }}
            </p>
            <p class="text-sm font-semibold mt-1">{{ props.distanceText }}</p>
          </div>
          <div class="ui-card p-3">
            <p class="text-[10px] uppercase font-bold text-slate-500">
              {{ props.t('cameras.metric.fps', 'Inference FPS') }}
            </p>
            <p class="text-sm font-semibold mt-1">{{ props.fps.toFixed(1) }}</p>
          </div>
          <div class="ui-card p-3">
            <p class="text-[10px] uppercase font-bold text-slate-500">
              {{ props.t('cameras.metric.cpu', 'CPU Usage') }}
            </p>
            <p class="text-sm font-semibold mt-1">{{ props.cpuUsage.toFixed(0) }}%</p>
          </div>
          <div class="ui-card p-3">
            <p class="text-[10px] uppercase font-bold text-slate-500">
              {{ props.t('cameras.metric.gpu', 'GPU Usage') }}
            </p>
            <p class="text-sm font-semibold mt-1">{{ props.gpuUsage.toFixed(0) }}%</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
