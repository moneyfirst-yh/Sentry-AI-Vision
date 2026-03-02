<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next';
import RangeSliderCard from './RangeSliderCard.vue';
import SectionHeader from './SectionHeader.vue';
import type { Translator } from '../../composables/useI18n';

const props = defineProps<{
  masterEnabled: boolean;
  saveFrameOnTrigger: boolean;
  sensitivity: number;
  proximity: number;
  t: Translator;
}>();

const emit = defineEmits<{
  (e: 'update:master-enabled', value: boolean): void;
  (e: 'update:save-frame-on-trigger', value: boolean): void;
  (e: 'update:sensitivity', value: number): void;
  (e: 'update:proximity', value: number): void;
}>();

const toggleMaster = () => {
  emit('update:master-enabled', !props.masterEnabled);
};
</script>

<template>
  <section>
    <SectionHeader
      :title="props.t('global.title', 'Global Settings')"
      :subtitle="props.t('global.subtitle', 'Core detection behavior')"
    />

    <div class="ui-card-soft flex items-center gap-4 px-4 min-h-[76px] justify-between">
      <div class="flex items-center gap-4">
        <div class="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
          <ShieldAlert class="w-6 h-6" />
        </div>
        <div>
          <p class="text-base font-semibold leading-tight">
            {{ props.t('global.master.title', 'Master Detection') }}
          </p>
          <p class="text-slate-400 text-[11px] mt-0.5 italic">
            {{ props.t('global.master.desc', 'Enable or disable whole monitoring pipeline') }}
          </p>
        </div>
      </div>

      <button
        type="button"
        :class="[
          'relative h-6 w-11 rounded-full transition-colors',
          props.masterEnabled ? 'bg-primary' : 'bg-slate-700',
        ]"
        @click="toggleMaster"
        :aria-pressed="props.masterEnabled"
      >
        <div
          :class="[
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            props.masterEnabled ? 'translate-x-5' : '',
          ]"
        ></div>
      </button>
    </div>

    <div class="ui-card-soft flex items-center gap-4 px-4 min-h-[76px] justify-between mt-3">
      <div class="flex items-center gap-4">
        <div class="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
          <ShieldAlert class="w-6 h-6" />
        </div>
        <div>
          <p class="text-base font-semibold leading-tight">
            {{ props.t('global.saveFrame.title', '触发时捕获视频帧') }}
          </p>
          <p class="text-slate-400 text-[11px] mt-0.5 italic">
            {{ props.t('global.saveFrame.desc', '触发时捕获视频帧') }}
          </p>
        </div>
      </div>

      <button
        type="button"
        :class="[
          'relative h-6 w-11 rounded-full transition-colors',
          props.saveFrameOnTrigger ? 'bg-primary' : 'bg-slate-700',
        ]"
        @click="emit('update:save-frame-on-trigger', !props.saveFrameOnTrigger)"
        :aria-pressed="props.saveFrameOnTrigger"
      >
        <div
          :class="[
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            props.saveFrameOnTrigger ? 'translate-x-5' : '',
          ]"
        ></div>
      </button>
    </div>

    <div class="mt-4 space-y-3">
      <RangeSliderCard
        :title="props.t('global.sensitivity.title', 'Detection Sensitivity')"
        :subtitle="props.t('global.sensitivity.desc', 'How aggressively to treat movements as risk')"
        :value="props.sensitivity"
        @update:value="emit('update:sensitivity', $event)"
      />
      <RangeSliderCard
        :title="props.t('global.proximity.title', 'Proximity Threshold')"
        :subtitle="props.t('global.proximity.desc', 'How close a person can approach before action')"
        :value="props.proximity"
        unit="%"
        @update:value="emit('update:proximity', $event)"
      />
    </div>
  </section>
</template>
