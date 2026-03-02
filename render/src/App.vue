<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useActivityLog } from './composables/useActivityLog';
import { useCameraStream } from './composables/useCameraStream';
import { useI18n } from './composables/useI18n';
import { usePersonDetection } from './composables/usePersonDetection';
import { useRuleEngine } from './composables/useRuleEngine';
import { useRuleUiState } from './composables/useRuleUiState';
import { useTelemetry } from './composables/useTelemetry';
import { nativeApi } from './services/nativeApi';
import DashboardPage from './pages/DashboardPage.vue';
import SettingsPage from './pages/SettingsPage.vue';
import type { AppTab, Language, SettingsSnapshot } from './types/ui';

const showSettings = ref(false);
const activeTab = ref<AppTab>('dash');

const { t } = useI18n();

const { cpuUsage, gpuUsage, fps } = useTelemetry();
const {
  actionItems,
  hydrate,
  masterEnabled,
  processOptions,
  proximity,
  selectedProcess,
  selectedProcessId,
  sensitivity,
  snapshot,
  setActionEnabled,
  setMasterEnabled,
  setProcessOptions,
  setProximity,
  setSelectedProcessId,
  setSensitivity,
  setNotificationText,
  notificationText,
} = useRuleUiState();

const {
  alarmLogs,
  appendEvent,
  eventIcons,
  pushMotionScore,
  timelineBars,
} = useActivityLog();

const camera = useCameraStream();
const detector = usePersonDetection(camera.videoElement, sensitivity);

useRuleEngine(
  {
    masterEnabled,
    proximityThreshold: proximity,
    targetCount: detector.targetCount,
    proximityScore: detector.proximityScore,
    movementScore: detector.movementScore,
    selectedProcess,
    notificationText,
    actionItems,
  },
  {
    onDetected: ({ targetCount }) => {
      appendEvent({
        title: t('event.detected.title', 'Person Detected'),
        subtitle: t('event.detected.subtitle', 'Presence'),
        detail: t(
          'event.detected.detail',
          'Detected {count} target(s) in camera frame.',
          { count: targetCount },
        ),
        iconName: eventIcons.detected,
      });
    },
    onApproaching: ({ proximityScore, threshold }) => {
      appendEvent({
        title: t('event.approaching.title', 'Person Approaching'),
        subtitle: t('event.approaching.subtitle', 'Threshold Hit'),
        detail: t(
          'event.approaching.detail',
          'Proximity score {score} crossed threshold {threshold}.',
          {
            score: proximityScore.toFixed(0),
            threshold: threshold.toFixed(0),
          },
        ),
        iconName: eventIcons.approaching,
      });
    },
    onCleared: () => {
      appendEvent({
        title: t('event.cleared.title', 'Scene Cleared'),
        subtitle: t('event.cleared.subtitle', 'No Target'),
        detail: t(
          'event.cleared.detail',
          'No person observed for several frames.',
        ),
        level: 'muted',
        iconName: eventIcons.cleared,
      });
    },
    onActionTriggered: ({ results }) => {
      const formatted = results.map((result) => {
        if (result.startsWith('auto-kill:')) {
          const name = result.replace('auto-kill:', '');
          return t('action.result.auto-kill', 'Terminate {name}', { name });
        }
        if (result === 'desktop-notification') {
          return t(
            'action.result.desktop-notification',
            'Desktop notification',
          );
        }
        if (result === 'back-to-desktop') {
          return t('action.result.back-to-desktop', 'Back to desktop');
        }
        return result;
      });
      appendEvent({
        title: t('event.action.title', 'Auto Action Triggered'),
        subtitle: t('event.action.subtitle', 'Rule Engine'),
        detail:
          results.length > 0
            ? t('event.action.actions', 'Actions: {actions}', {
              actions: formatted.join(', '),
            })
            : t(
              'event.action.none',
              'Rules reached threshold but no action was enabled.',
            ),
        level: 'alert',
        iconName: eventIcons.triggered,
      });
    },
    onError: (message) => {
      appendEvent({
        title: t('event.error.title', 'Action Error'),
        subtitle: t('event.error.subtitle', 'Runtime'),
        detail: message,
        level: 'alert',
      });
    },
  },
  t,
);

const dashboardFps = computed(() =>
  detector.inferenceFps.value > 0 ? detector.inferenceFps.value : fps.value,
);

const distanceText = computed(() => {
  const meters = Math.max(0.4, 3.2 - detector.proximityScore.value / 38);
  return `${meters.toFixed(1)}m`;
});

const movementText = computed(() => {
  const score = detector.movementScore.value;
  if (score >= 70) {
    return t('movement.high', 'High Movement');
  }
  if (score >= 35) {
    return t('movement.medium', 'Medium Movement');
  }
  return t('movement.low', 'Low Movement');
});

const cameraStatus = computed(() => {
  if (camera.status.value === 'error') {
    return 'error' as const;
  }
  if (camera.status.value === 'starting' && !camera.hasStream.value) {
    return 'starting' as const;
  }
  if (camera.hasStream.value || camera.isRunning.value) {
    return 'running' as const;
  }
  return 'idle' as const;
});

const cameraError = computed(() => camera.error.value ?? null);
const detectorError = computed(() => detector.error.value ?? null);

const settingsSnapshot = ref<SettingsSnapshot | null>(null);
const captureSettingsSnapshot = () => {
  settingsSnapshot.value = JSON.parse(JSON.stringify(snapshot.value));
};

const refreshProcessList = async () => {
  try {
    const list = await nativeApi.system.listProcesses();
    setProcessOptions(list);
  } catch (err) {
    appendEvent({
      title: t('event.processFetch.title', 'Process Fetch Failed'),
      subtitle: t('event.processFetch.subtitle', 'Runtime'),
      detail:
        err instanceof Error
          ? err.message
          : t('event.processFetch.detailFallback', 'Failed to list processes.'),
      level: 'alert',
    });
  }
};

const loadPersistedSettings = async () => {
  try {
    const settings = await nativeApi.settings.get();
    hydrate(settings);
  } catch (err) {
    appendEvent({
      title: t('event.settingsLoad.title', 'Settings Load Failed'),
      subtitle: t('event.settingsLoad.subtitle', 'Storage'),
      detail:
        err instanceof Error
          ? err.message
          : t(
            'event.settingsLoad.detailFallback',
            'Unable to load persisted settings.',
          ),
      level: 'alert',
    });
  }
};

const startRuntime = async () => {
  await camera.start();
  if (!camera.isRunning.value) {
    appendEvent({
      title: t('event.cameraNotRunning.title', 'Camera Not Running'),
      subtitle: t('event.cameraNotRunning.subtitle', 'Device'),
      detail:
        camera.error.value ??
        t('event.cameraNotRunning.detailFallback', 'Camera stream unavailable.'),
      level: 'alert',
    });
    return;
  }

  if (masterEnabled.value) {
    const started = await detector.start();
    if (started) {
      appendEvent({
        title: t('event.monitoringOnline.title', 'Monitoring Online'),
        subtitle: t('event.monitoringOnline.subtitle', 'Startup'),
        detail:
          camera.sourceMode.value === 'sample'
            ? t(
              'event.monitoringOnline.sample',
              'Camera unavailable, sample video fallback is active.',
            )
            : t(
              'event.monitoringOnline.camera',
              'Camera stream and detector are active.',
            ),
      });
    } else {
      appendEvent({
        title: t('event.detectorOffline.title', 'Detector Offline'),
        subtitle: t('event.detectorOffline.subtitle', 'Startup'),
        detail:
          detector.error.value ??
          t(
            'event.detectorOffline.detailFallback',
            'Detector initialization failed.',
          ),
        level: 'alert',
      });
    }
  } else {
    appendEvent({
      title: t('event.cameraOnline.title', 'Camera Online'),
      subtitle: t('event.cameraOnline.subtitle', 'Paused'),
      detail: t(
        'event.cameraOnline.detail',
        'Camera is active, detection is paused by master switch.',
      ),
      level: 'muted',
    });
  }
};

const openSettings = async () => {
  captureSettingsSnapshot();
  await refreshProcessList();
  showSettings.value = true;
};

const closeSettings = () => {
  if (settingsSnapshot.value) {
    hydrate(settingsSnapshot.value);
  }
  settingsSnapshot.value = null;
  showSettings.value = false;
};
const setActiveTab = (nextTab: AppTab) => {
  activeTab.value = nextTab;
};

const applySettings = async () => {
  try {
    await nativeApi.settings.set(snapshot.value);
    settingsSnapshot.value = null;
    showSettings.value = false;
    appendEvent({
      title: t('event.settingsApplied.title', 'Settings Applied'),
      subtitle: t('event.settingsApplied.subtitle', 'Configuration'),
      detail: t(
        'event.settingsApplied.detail',
        'Rule configuration persisted successfully.',
      ),
    });
  } catch (err) {
    appendEvent({
      title: t('event.settingsSaveFailed.title', 'Settings Save Failed'),
      subtitle: t('event.settingsSaveFailed.subtitle', 'Storage'),
      detail:
        err instanceof Error
          ? err.message
          : t(
            'event.settingsSaveFailed.detailFallback',
            'Unable to persist settings.',
          ),
      level: 'alert',
    });
  }
};

let timelineTimer: number | null = null;

onMounted(async () => {
  await loadPersistedSettings();
  await refreshProcessList();
  await startRuntime();

  timelineTimer = window.setInterval(() => {
    pushMotionScore(detector.movementScore.value);
  }, 1000);
});

watch(masterEnabled, async (enabled) => {
  if (!enabled) {
    detector.stop();
    appendEvent({
      title: t('event.detectionPaused.title', 'Detection Paused'),
      subtitle: t('event.detectionPaused.subtitle', 'Master Switch'),
      detail: t(
        'event.detectionPaused.detail',
        'Monitoring detection loop has been paused.',
      ),
      level: 'muted',
    });
    return;
  }

  if (camera.isRunning.value) {
    const started = await detector.start();
    appendEvent({
      title: started
        ? t('event.detectionResumed.title', 'Detection Resumed')
        : t('event.detectorOffline.title', 'Detector Offline'),
      subtitle: started
        ? t('event.detectionResumed.subtitle', 'Master Switch')
        : t('event.detectorOffline.subtitle', 'Startup'),
      detail: started
        ? t('event.detectionResumed.detail', 'Monitoring detection loop resumed.')
        : detector.error.value ??
        t(
          'event.detectorOffline.detailFallback',
          'Detector initialization failed.',
        ),
      level: started ? 'default' : 'alert',
    });
  } else {
    await startRuntime();
  }
});

onBeforeUnmount(() => {
  if (timelineTimer) {
    window.clearInterval(timelineTimer);
    timelineTimer = null;
  }
  detector.stop();
  camera.stop();
});
</script>

<template>
  <div class="bg-background-dark text-slate-100 min-h-screen flex flex-col overflow-hidden selection:bg-primary/30">
    <DashboardPage v-if="!showSettings" key="dashboard" :t="t" :fps="dashboardFps" :cpu-usage="cpuUsage"
      :gpu-usage="gpuUsage" :active-tab="activeTab" :alarm-logs="alarmLogs" :timeline-bars="timelineBars"
      :person-boxes="detector.boxes.value" :target-count="detector.targetCount.value" :distance-text="distanceText"
      :movement-text="movementText" :source-mode="camera.sourceMode.value" :camera-status="cameraStatus"
      :detector-status="detector.status.value" :camera-error="cameraError" :detector-error="detectorError"
      :bind-video-element="camera.bindVideoElement" @open-settings="openSettings" @change-tab="setActiveTab" />

    <SettingsPage v-else key="settings" :t="t" :master-enabled="masterEnabled" :sensitivity="sensitivity"
      :proximity="proximity" :notification-text="notificationText" :action-items="actionItems"
      :process-options="processOptions" :selected-process-id="selectedProcessId"
      @update:master-enabled="setMasterEnabled" @update:sensitivity="setSensitivity" @update:proximity="setProximity"
      @update:notification-text="setNotificationText" @update-action="setActionEnabled($event.id, $event.enabled)"
      @update:selected-process-id="setSelectedProcessId" @refresh-processes="refreshProcessList" @apply="applySettings"
      @close="closeSettings" />
  </div>
</template>
