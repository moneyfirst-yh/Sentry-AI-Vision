<script setup lang="ts">
import { computed } from 'vue';
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
  Language,
  PersonBox,
  TimelineBar,
} from '../types/ui';

const props = defineProps<{
  language: Language;
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
  (e: 'change-language', value: Language): void;
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
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <TopHeader
      :language="props.language"
      :t="props.t"
      :fps="props.fps"
      @change-language="emit('change-language', $event)"
      @open-settings="emit('open-settings')"
    />

    <main class="flex-1 overflow-y-auto no-scrollbar pb-24">
      <div v-show="props.activeTab === 'dash'">
        <section class="ui-section grid grid-cols-2 gap-3 py-4">
          <StatCard
            v-for="card in statCards"
            :key="card.id"
            :icon-name="card.iconName"
            :title="card.title"
            :subtitle="card.subtitle"
            :value="card.value"
          />
        </section>

        <section class="ui-section pb-4">
          <CameraFeedPanel
            :bind-video-element="props.bindVideoElement"
            :boxes="props.personBoxes"
            :target-count="props.targetCount"
            :distance-text="props.distanceText"
            :movement-text="props.movementText"
            :t="props.t"
            :camera-status="props.cameraStatus"
            :detector-status="props.detectorStatus"
            :camera-error="props.cameraError"
            :detector-error="props.detectorError"
          />
        </section>

        <TimelinePanel :bars="props.timelineBars" :t="props.t" />
        <AlarmLogPanel :logs="props.alarmLogs" :t="props.t" />
      </div>

      <div v-show="props.activeTab === 'events'">
        <EventsPanel :logs="props.alarmLogs" :t="props.t" />
      </div>

      <div v-show="props.activeTab === 'cameras'">
        <CamerasPanel
          :t="props.t"
          :source-mode="props.sourceMode"
          :camera-status="props.cameraStatus"
          :detector-status="props.detectorStatus"
          :camera-error="props.cameraError"
          :detector-error="props.detectorError"
          :target-count="props.targetCount"
          :movement-text="props.movementText"
          :distance-text="props.distanceText"
          :fps="props.fps"
          :cpu-usage="props.cpuUsage"
          :gpu-usage="props.gpuUsage"
        />
      </div>

      <div v-show="props.activeTab === 'logs'">
        <LogsPanel :logs="props.alarmLogs" :t="props.t" />
      </div>
    </main>

    <BottomNav
      :active-tab="props.activeTab"
      :items="navItems"
      :t="props.t"
      @change-tab="emit('change-tab', $event)"
    />
  </div>
</template>
