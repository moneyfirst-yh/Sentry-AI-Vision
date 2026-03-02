<script setup lang="ts">
import { CircleAlert, Ruler, Users, Video } from 'lucide-vue-next';
import type { PersonBox } from '../../types/ui';
import type { Translator } from '../../composables/useI18n';

const props = withDefaults(
  defineProps<{
    bindVideoElement: (element: HTMLVideoElement | null) => void;
    boxes: PersonBox[];
    targetCount: number;
    distanceText: string;
    movementText: string;
    t: Translator;
    cameraStatus: 'idle' | 'starting' | 'running' | 'error';
    detectorStatus: 'idle' | 'loading' | 'running' | 'error';
    cameraError?: string | null;
    detectorError?: string | null;
  }>(),
  {
    cameraError: null,
    detectorError: null,
  },
);
</script>

<template>
  <div class="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/20 bg-black group shadow-2xl">
    <video
      :ref="props.bindVideoElement"
      autoplay
      muted
      playsinline
      class="absolute inset-0 w-full h-full object-cover"
    ></video>

    <template v-if="props.cameraStatus === 'running'">
      <div
        v-for="box in props.boxes"
        :key="box.id"
        class="absolute border-2 rounded shadow-[0_0_15px_rgba(19,236,91,0.35)] border-primary"
        :style="{
          left: `${box.xPct}%`,
          top: `${box.yPct}%`,
          width: `${box.widthPct}%`,
          height: `${box.heightPct}%`,
        }"
      >
        <span class="absolute -top-6 left-0 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex gap-1 items-center whitespace-nowrap">
          {{ props.t('camera.label.person', 'PERSON') }}
          <span class="opacity-70">{{ box.confidence.toFixed(0) }}%</span>
        </span>
      </div>
    </template>

    <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
      <div class="flex flex-col gap-1.5">
        <div class="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
          <Users class="w-3.5 h-3.5 text-primary" />
          <div class="flex flex-col leading-tight">
            <span class="text-[10px] font-bold text-white">
              {{ props.t('camera.targetCount', 'Target Count {count}', { count: props.targetCount }) }}
            </span>
            <span class="text-[8px] text-white/60 uppercase">
              {{ props.t('camera.visibleTargets', 'Visible Targets') }}
            </span>
          </div>
        </div>
        <div class="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
          <Ruler class="w-3.5 h-3.5 text-primary" />
          <div class="flex flex-col leading-tight">
            <span class="text-[10px] font-bold text-white">
              {{ props.t('camera.distance', 'Distance {distance}', { distance: props.distanceText }) }}
            </span>
            <span class="text-[8px] text-white/60 uppercase">
              {{ props.t('camera.estimatedProximity', 'Estimated Proximity') }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-primary/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/40 flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <div class="flex flex-col leading-tight">
          <span class="text-[10px] font-bold text-primary uppercase">{{ props.movementText }}</span>
          <span class="text-[8px] text-primary/70 uppercase font-bold">
            {{ props.t('camera.motionClassification', 'Motion Classification') }}
          </span>
        </div>
      </div>
    </div>

    <div class="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1" :class="props.cameraStatus === 'running' ? 'bg-red-600' : 'bg-slate-700'">
      <Video class="w-3 h-3" />
      {{
        props.cameraStatus === 'running'
          ? props.t('camera.status.rec', 'REC')
          : props.t('camera.status.standby', 'STANDBY')
      }}
    </div>

    <div
      v-if="props.cameraStatus === 'starting'"
      class="absolute inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center"
    >
      <div class="text-center">
        <p class="text-sm font-semibold text-primary">
          {{ props.t('camera.initializing.title', 'Camera Initializing...') }}
        </p>
        <p class="text-xs text-slate-300 mt-1">
          {{ props.t('camera.initializing.desc', 'Requesting media stream') }}
        </p>
      </div>
    </div>

    <div
      v-if="props.cameraStatus === 'error'"
      class="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
    >
      <div class="ui-card-soft p-4 w-full max-w-sm flex gap-3 items-start">
        <CircleAlert class="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
        <div>
          <p class="text-sm font-semibold text-red-300">
            {{ props.t('camera.error.title', 'Camera Error') }}
          </p>
          <p class="text-xs text-slate-200 mt-1">
            {{ props.cameraError || props.t('camera.error.desc', 'Unable to open camera stream.') }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="props.cameraStatus === 'running' && props.detectorStatus === 'loading'"
      class="absolute top-4 left-4 bg-black/60 border border-primary/30 rounded px-2 py-1.5"
    >
      <p class="text-[10px] font-bold text-primary">
        {{ props.t('camera.modelLoading.title', 'AI Model Loading...') }}
      </p>
      <p class="text-[9px] text-slate-300 mt-0.5">
        {{ props.t('camera.modelLoading.desc', 'Video is ready, detector is initializing') }}
      </p>
    </div>

    <div
      v-if="props.cameraStatus === 'running' && props.detectorStatus === 'error'"
      class="absolute top-4 left-4 bg-black/70 border border-red-400/40 rounded px-2 py-1.5 max-w-[70%]"
    >
      <p class="text-[10px] font-bold text-red-300">
        {{ props.t('camera.detectorError.title', 'Detector Error') }}
      </p>
      <p class="text-[9px] text-slate-200 mt-0.5 truncate">
        {{ props.detectorError || props.t('camera.detectorError.desc', 'Unable to initialize detector.') }}
      </p>
    </div>
  </div>
</template>
