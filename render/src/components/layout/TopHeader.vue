<script setup lang="ts">
import { Settings, Shield } from 'lucide-vue-next';
import type { Language } from '../../types/ui';
import type { Translator } from '../../composables/useI18n';

const props = defineProps<{
  language: Language;
  fps: number;
  t: Translator;
}>();

const emit = defineEmits<{
  (e: 'change-language', value: Language): void;
  (e: 'open-settings'): void;
}>();
</script>

<template>
  <header class="flex items-center justify-between px-4 pt-6 pb-2 border-b border-slate-border">
    <div class="flex items-center gap-2">
      <Shield class="text-primary w-6 h-6" />
      <div class="flex flex-col">
        <h1 class="text-base font-bold tracking-tight leading-none">
          {{ props.t('app.title', 'Sentry AI Vision') }}
        </h1>
        <span class="ui-label text-slate-500 font-medium">
          {{ props.t('app.subtitle', 'Desktop Security Monitor') }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex items-center ui-card rounded-lg p-0.5">
        <button
          @click="emit('change-language', 'zh')"
          :class="[
            'px-2 py-1 text-[10px] font-bold rounded transition-all',
            props.language === 'zh' ? 'bg-primary text-black' : 'text-slate-400',
          ]"
        >
          ZH
        </button>
        <button
          @click="emit('change-language', 'en')"
          :class="[
            'px-2 py-1 text-[10px] font-bold rounded transition-all',
            props.language === 'en' ? 'bg-primary text-black' : 'text-slate-400',
          ]"
        >
          EN
        </button>
      </div>

      <div class="flex flex-col items-end">
        <span class="ui-label text-slate-500 leading-none">
          {{ props.t('header.systemStatus', 'System Status') }}
          <span class="text-[8px] font-normal opacity-60">
            {{ props.t('header.systemStatusValue', 'RUNNING') }}
          </span>
        </span>
        <span class="text-xs text-primary font-medium">
          {{ props.t('header.live', 'Live') }} - {{ props.fps.toFixed(1) }}
          {{ props.t('header.fps', 'FPS') }}
        </span>
      </div>

      <button
        @click="emit('open-settings')"
        class="p-2 rounded-lg ui-card text-slate-300 hover:text-primary transition-colors"
      >
        <Settings class="w-5 h-5" />
      </button>
    </div>
  </header>
</template>
