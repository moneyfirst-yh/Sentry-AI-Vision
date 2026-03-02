<script setup lang="ts">
import { computed, ref } from 'vue';
import { X } from 'lucide-vue-next';
import AlarmLogPanel from '../components/dashboard/AlarmLogPanel.vue';
import CameraFeedPanel from '../components/dashboard/CameraFeedPanel.vue';
import CamerasPanel from '../components/dashboard/CamerasPanel.vue';
import EventsPanel from '../components/dashboard/EventsPanel.vue';
import LogsPanel from '../components/dashboard/LogsPanel.vue';
import StatCard from '../components/dashboard/StatCard.vue';
import TimelinePanel from '../components/dashboard/TimelinePanel.vue';
import BottomNav from '../components/layout/BottomNav.vue';
import TopHeader from '../components/layout/TopHeader.vue';
import { navItems } from '../data/mockUi';
import type { Translator } from '../composables/useI18n';
import type {
  AlarmLogItem,
  AppTab,
  PersonBox,
  TimelineBar,
} from '../types/ui';

const props = defineProps<{
  t: Translator;
  fps: number;
  cpuUsage: number;
  gpuUsage: number;
  activeTab: AppTab;
  alarmLogs: AlarmLogItem[];
  timelineBars: TimelineBar[];
  personBoxes: PersonBox[];
  targetCount: number;
  distanceText: string;
  movementText: string;
  sourceMode: 'none' | 'camera' | 'sample';
  cameraStatus: 'idle' | 'starting' | 'running' | 'error';
  detectorStatus: 'idle' | 'loading' | 'running' | 'error';
  cameraError: string | null;
  detectorError: string | null;
  bindVideoElement: (element: HTMLVideoElement | null) => void;
}>();

const emit = defineEmits<{
  (e: 'open-settings'): void;
  (e: 'change-tab', value: AppTab): void;
}>();

const statCards = computed(() => [
  {
    id: 'cpu',
    iconName: 'cpu' as const,
    title: props.t('stats.cpu.title', 'CPU Load'),
    subtitle: props.t('stats.cpu.subtitle', 'CPU Usage'),
    value: props.cpuUsage,
  },
  {
    id: 'gpu',
    iconName: 'monitor' as const,
    title: props.t('stats.gpu.title', 'GPU Load'),
    subtitle: props.t('stats.gpu.subtitle', 'GPU Usage'),
    value: props.gpuUsage,
  },
]);

const previewUrl = ref<string | null>(null);
const openPreview = (url: string) => {
  previewUrl.value = url;
};
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <TopHeader :t="props.t" :fps="props.fps" @open-settings="emit('open-settings')" />

    <main class="flex-1 overflow-y-auto no-scrollbar pb-24">
      <div v-show="props.activeTab === 'dash'">
        <section class="ui-section grid grid-cols-2 gap-3 py-4">
          <StatCard v-for="card in statCards" :key="card.id" :icon-name="card.iconName" :title="card.title"
            :subtitle="card.subtitle" :value="card.value" />
        </section>

        <section class="ui-section pb-4">
          <CameraFeedPanel :bind-video-element="props.bindVideoElement" :boxes="props.personBoxes"
            :target-count="props.targetCount" :distance-text="props.distanceText" :movement-text="props.movementText"
            :t="props.t" :camera-status="props.cameraStatus" :detector-status="props.detectorStatus"
            :camera-error="props.cameraError" :detector-error="props.detectorError" />
        </section>

        <TimelinePanel :bars="props.timelineBars" :t="props.t" />
        <AlarmLogPanel :logs="props.alarmLogs" :t="props.t" @preview-image="openPreview" />
      </div>

      <div v-show="props.activeTab === 'events'">
        <EventsPanel :logs="props.alarmLogs" :t="props.t" @preview-image="openPreview" />
      </div>

      <div v-show="props.activeTab === 'cameras'">
        <CamerasPanel :t="props.t" :source-mode="props.sourceMode" :camera-status="props.cameraStatus"
          :detector-status="props.detectorStatus" :camera-error="props.cameraError"
          :detector-error="props.detectorError" :target-count="props.targetCount" :movement-text="props.movementText"
          :distance-text="props.distanceText" :fps="props.fps" :cpu-usage="props.cpuUsage"
          :gpu-usage="props.gpuUsage" />
      </div>

      <div v-show="props.activeTab === 'logs'">
        <LogsPanel :logs="props.alarmLogs" :t="props.t" @preview-image="openPreview" />
      </div>
    </main>

    <BottomNav :active-tab="props.activeTab" :items="navItems" :t="props.t" @change-tab="emit('change-tab', $event)" />

    <!-- Image Preview Modal -->
    <div v-if="previewUrl" class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-12 cursor-pointer transition-opacity duration-300" @click.self="previewUrl = null">
      <div class="relative max-w-full max-h-full flex items-center justify-center">
        <button type="button" class="absolute -top-12 right-0 lg:-top-4 lg:-right-12 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors" @click="previewUrl = null">
          <X class="w-6 h-6" />
        </button>
        <img :src="previewUrl" class="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" @click.stop />
      </div>
    </div>
  </div>
</template>
