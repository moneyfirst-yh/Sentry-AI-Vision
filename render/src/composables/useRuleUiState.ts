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
  if (name.includes('chrome') || name.includes('edge') || name.includes('firefox')) {
    return {
      id: process.id,
      pid: process.pid,
      name: process.name,
      description: 'Browser',
      iconName: 'globe',
      iconColorClass: 'text-blue-500',
    };
  }
  if (
    name.includes('code') ||
    name.includes('idea') ||
    name.includes('devenv')
  ) {
    return {
      id: process.id,
      pid: process.pid,
      name: process.name,
      description: 'Development tool',
      iconName: 'terminal',
      iconColorClass: 'text-primary',
    };
  }
  if (name.includes('notion') || name.includes('obsidian')) {
    return {
      id: process.id,
      pid: process.pid,
      name: process.name,
      description: 'Workspace',
      iconName: 'file',
      iconColorClass: 'text-orange-500',
    };
  }
  return {
    id: process.id,
    pid: process.pid,
    name: process.name,
    description: 'Running process',
    iconName: 'monitorCog',
    iconColorClass: 'text-slate-300',
  };
};

export function useRuleUiState() {
  const masterEnabled = ref(true);
  const sensitivity = ref(75);
  const proximity = ref(45);
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
    sensitivity: sensitivity.value,
    proximity: proximity.value,
    selectedProcessId: selectedProcessId.value,
    actionStates: actionItems.value.map((item) => ({
      id: item.id,
      enabled: item.enabled,
    })),
  }));

  const setMasterEnabled = (nextValue: boolean) => {
    masterEnabled.value = nextValue;
  };

  const setSensitivity = (nextValue: number) => {
    sensitivity.value = clampRange(nextValue);
  };

  const setProximity = (nextValue: number) => {
    proximity.value = clampRange(nextValue);
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
    sensitivity.value = clampRange(state.sensitivity);
    proximity.value = clampRange(state.proximity);
    selectedProcessId.value = state.selectedProcessId;

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
  };
}
