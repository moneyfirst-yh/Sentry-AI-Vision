<script setup lang="ts">
import { computed, ref } from 'vue';
import { HelpCircle, X } from 'lucide-vue-next';
import ActionStrategySection from '../components/settings/ActionStrategySection.vue';
import GlobalSettingsSection from '../components/settings/GlobalSettingsSection.vue';
import SettingsActionPanel from '../components/settings/SettingsActionPanel.vue';
import WatchTargetSection from '../components/settings/WatchTargetSection.vue';
import type { Translator } from '../composables/useI18n';
import type { ActionSetting, ProcessOption } from '../types/ui';

const props = defineProps<{
  masterEnabled: boolean;
  sensitivity: number;
  proximity: number;
  notificationText: string;
  actionItems: ActionSetting[];
  processOptions: ProcessOption[];
  selectedProcessId: string | null;
  t: Translator;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply'): void;
  (e: 'update:master-enabled', value: boolean): void;
  (e: 'update:sensitivity', value: number): void;
  (e: 'update:proximity', value: number): void;
  (e: 'update:notification-text', value: string): void;
  (e: 'update-action', payload: { id: string; enabled: boolean }): void;
  (e: 'update:selected-process-id', id: string): void;
  (e: 'refresh-processes'): void;
}>();

const selectedProcess = computed(
  () =>
    props.processOptions.find((item) => item.id === props.selectedProcessId) ??
    props.processOptions[0] ??
    null,
);

const showHelp = ref(false);

const closeSettings = () => emit('close');
const applySettings = () => emit('apply');
</script>

<template>
  <div class="flex-1 flex flex-col bg-background-dark overflow-y-auto no-scrollbar">
    <div
      class="flex items-center p-4 pb-2 justify-between sticky top-0 z-20 bg-background-dark border-b border-primary/10">
      <button @click="closeSettings" class="text-slate-100 p-2 hover:bg-white/5 rounded-full transition-all">
        <X class="w-6 h-6" />
      </button>
      <div class="flex-1 text-center">
        <h2 class="text-lg font-bold leading-tight tracking-tight">
          {{ props.t('settings.title', 'Detection Controls') }}
        </h2>
        <p class="ui-label text-slate-500">
          {{ props.t('settings.subtitle', 'Settings Panel') }}
        </p>
      </div>
      <button class="p-2 text-slate-100 hover:bg-white/5 rounded-full transition-all" @click="showHelp = true">
        <HelpCircle class="w-6 h-6" />
      </button>
    </div>

    <div class="flex flex-col gap-6 p-4 pb-12">
      <GlobalSettingsSection :master-enabled="props.masterEnabled" :sensitivity="props.sensitivity"
        :proximity="props.proximity" :t="props.t" @update:master-enabled="emit('update:master-enabled', $event)"
        @update:sensitivity="emit('update:sensitivity', $event)" @update:proximity="emit('update:proximity', $event)" />

      <ActionStrategySection :items="props.actionItems" :notification-text="props.notificationText" :t="props.t"
        @update-action="emit('update-action', $event)"
        @update:notification-text="emit('update:notification-text', $event)" />

      <WatchTargetSection :selected="selectedProcess" :options="props.processOptions" :t="props.t"
        @select-process="emit('update:selected-process-id', $event)" @refresh="emit('refresh-processes')" />

      <SettingsActionPanel :t="props.t" @apply="applySettings" @cancel="closeSettings" />
    </div>

    <div class="mt-auto p-4 border-t border-primary/10 flex justify-center">
      <p class="text-[10px] text-slate-500">
        {{ props.t('settings.version', 'Interface Version: {version}', { version: 'v2.4.0' }) }}
      </p>
    </div>

    <div v-if="showHelp" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      @click.self="showHelp = false">
      <div class="ui-card-soft p-5 max-w-md w-full border border-primary/20">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-bold">
              {{ props.t('settings.help.title', 'Strategy Help') }}
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              {{ props.t('settings.help.subtitle', 'Meaning and operating notes') }}
            </p>
          </div>
          <button type="button" class="text-slate-400 hover:text-primary" @click="showHelp = false">
            <X class="w-5 h-5" />
          </button>
        </div>
        <p class="text-sm text-slate-200 mt-4">
          {{ props.t('settings.help.body', `When master detection is enabled, events are triggered based on sensitivity
          and proximity threshold.Action strategy decides the response behavior after a trigger.Validate outcomes in a
          safe environment first.`) }}
        </p>
        <button type="button" class="mt-5 ui-button-primary w-full h-11" @click="showHelp = false">
          {{ props.t('settings.help.close', 'Close') }}
        </button>
      </div>
    </div>
  </div>
</template>
