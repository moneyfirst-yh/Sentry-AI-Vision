import { computed, ref, shallowRef } from 'vue';
import { actionSettings, processOptions as mockProcessOptions } from '../data/mockUi';
import type {
  ActionSetting,
  NativeProcessInfo,
  ProcessOption,
  SettingsSnapshot,
} from '../types/ui';

const clampRange = (value: number) => Math.max(0, Math.min(100, value));

const normalizeProcessPresentation = (
  process: NativeProcessInfo,
): ProcessOption => {
  const name = process.name.toLowerCase();
  const desc = process.description ?? '';

  // Browsers
  if (name.includes('chrome') || name.includes('edge') || name.includes('firefox')) {
    return {
      id: process.id,
      pid: process.pid,
      name: desc || process.name,
      description: '浏览器 (Browser)',
      iconName: 'globe',
      iconColorClass: 'text-blue-500',
    };
  }

  // Dev Tools
  if (
    name.includes('code') ||
    name.includes('idea') ||
    name.includes('devenv') ||
    name.includes('wechatwebdevtools')
  ) {
    return {
      id: process.id,
      pid: process.pid,
      name: desc || process.name,
      description: '开发工具 (Dev Tool)',
      iconName: 'terminal',
      iconColorClass: 'text-primary',
    };
  }

  // Communication
  if (name.includes('wechat') || name.includes('qq') || name.includes('feishu') || name.includes('dingtalk')) {
    return {
      id: process.id,
      pid: process.pid,
      name: desc || process.name,
      description: '通讯软件 (Communication)',
      iconName: 'users',
      iconColorClass: 'text-green-500',
    };
  }

  // Workspaces
  if (name.includes('notion') || name.includes('obsidian') || name.includes('winword') || name.includes('excel')) {
    return {
      id: process.id,
      pid: process.pid,
      name: desc || process.name,
      description: '办公应用 (Workspace)',
      iconName: 'file',
      iconColorClass: 'text-orange-500',
    };
  }

  // Fallback
  return {
    id: process.id,
    pid: process.pid,
    name: desc || process.name,
    description: '运行中程序 (Running App)',
    iconName: 'monitorCog',
    iconColorClass: 'text-slate-300',
  };
};

export function useRuleUiState() {
  const masterEnabled = ref(true);
  const saveFrameOnTrigger = ref(true);
  const sensitivity = ref(75);
  const proximity = ref(45);
  const notificationText = ref('警告：检测到未授权人员靠近！');
  const processOptions = shallowRef<ProcessOption[]>([...mockProcessOptions]);
  const selectedProcessId = ref<string | null>(
    processOptions.value[0]?.id ?? null,
  );
  const actionItems = shallowRef<ActionSetting[]>([...actionSettings]);

  const selectedProcess = computed(
    () =>
      processOptions.value.find((option) => option.id === selectedProcessId.value) ??
      null,
  );

  const snapshot = computed<SettingsSnapshot>(() => ({
    masterEnabled: masterEnabled.value,
    saveFrameOnTrigger: saveFrameOnTrigger.value,
    sensitivity: sensitivity.value,
    proximity: proximity.value,
    selectedProcessId: selectedProcessId.value,
    notificationText: notificationText.value,
    actionStates: actionItems.value.map((item) => ({
      id: item.id,
      enabled: item.enabled,
    })),
  }));

  const setMasterEnabled = (nextValue: boolean) => {
    masterEnabled.value = nextValue;
  };

  const setSaveFrameOnTrigger = (nextValue: boolean) => {
    saveFrameOnTrigger.value = nextValue;
  };

  const setSensitivity = (nextValue: number) => {
    sensitivity.value = clampRange(nextValue);
  };

  const setProximity = (nextValue: number) => {
    proximity.value = clampRange(nextValue);
  };

  const setNotificationText = (text: string) => {
    notificationText.value = text;
  };

  const setActionEnabled = (id: string, enabled: boolean) => {
    actionItems.value = actionItems.value.map((item) =>
      item.id === id ? { ...item, enabled } : item,
    );
  };

  const setSelectedProcessId = (id: string) => {
    const exists = processOptions.value.some((option) => option.id === id);
    selectedProcessId.value = exists ? id : selectedProcessId.value;
  };

  const setProcessOptions = (items: NativeProcessInfo[]) => {
    processOptions.value = items.map(normalizeProcessPresentation);
    if (!processOptions.value.some((item) => item.id === selectedProcessId.value)) {
      selectedProcessId.value = processOptions.value[0]?.id ?? null;
    }
  };

  const hydrate = (state: SettingsSnapshot | null) => {
    if (!state) {
      return;
    }
    masterEnabled.value = state.masterEnabled;
    if (state.saveFrameOnTrigger !== undefined) {
      saveFrameOnTrigger.value = state.saveFrameOnTrigger;
    }
    sensitivity.value = clampRange(state.sensitivity);
    proximity.value = clampRange(state.proximity);
    selectedProcessId.value = state.selectedProcessId;
    if (state.notificationText !== undefined) {
      notificationText.value = state.notificationText;
    }

    const stateMap = new Map(state.actionStates.map((item) => [item.id, item.enabled]));
    actionItems.value = actionItems.value.map((item) => ({
      ...item,
      enabled: stateMap.get(item.id) ?? item.enabled,
    }));
  };

  return {
    actionItems,
    hydrate,
    masterEnabled,
    notificationText,
    processOptions,
    proximity,
    saveFrameOnTrigger,
    selectedProcess,
    selectedProcessId,
    sensitivity,
    snapshot,
    setActionEnabled,
    setMasterEnabled,
    setSaveFrameOnTrigger,
    setNotificationText,
    setProcessOptions,
    setProximity,
    setSelectedProcessId,
    setSensitivity,
  };
}
