<script setup lang="ts">
import { Zap } from 'lucide-vue-next';
import type { Translator } from '../../composables/useI18n';

const props = defineProps<{
  t: Translator;
}>();

const emit = defineEmits<{
  (e: 'apply'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <div class="mt-4 space-y-3">
    <button
      @click="emit('apply')"
      class="ui-button-primary w-full h-14 flex flex-col items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all"
    >
      <span class="flex items-center gap-2 font-bold leading-none">
        <Zap class="w-5 h-5" />
        {{ props.t('settings.apply.title', 'Apply Rule Configuration') }}
      </span>
      <span class="text-[10px] font-bold mt-1 opacity-80">
        {{ props.t('settings.apply.desc', 'Save and activate strategy') }}
      </span>
    </button>

    <button
      @click="emit('cancel')"
      class="ui-button-secondary w-full h-14 bg-transparent text-slate-400 font-semibold flex flex-col items-center justify-center active:bg-white/5 transition-all"
    >
      <span class="leading-none">{{ props.t('settings.cancel.title', 'Cancel Changes') }}</span>
      <span class="text-[10px] mt-0.5 opacity-70">
        {{ props.t('settings.cancel.desc', 'Back to dashboard') }}
      </span>
    </button>
  </div>
</template>
