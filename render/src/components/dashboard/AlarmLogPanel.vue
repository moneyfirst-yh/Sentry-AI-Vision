<script setup lang="ts">
import type { AlarmLevel, AlarmLogItem } from '../../types/ui';
import type { Translator } from '../../composables/useI18n';
import AppIcon from '../common/AppIcon.vue';
import EmptyStateCard from '../common/EmptyStateCard.vue';

const props = defineProps<{
  logs: AlarmLogItem[];
  t: Translator;
}>();

const rowClass = (level: AlarmLevel) => {
  if (level === 'alert') {
    return 'border-primary/30 bg-primary/5';
  }
  return 'bg-slate-panel border-slate-border';
};

const iconClass = (level: AlarmLevel) => {
  if (level === 'alert') {
    return 'bg-primary text-black';
  }
  if (level === 'muted') {
    return 'bg-slate-700 text-slate-400';
  }
  return 'bg-primary/20 text-primary';
};

const titleClass = (level: AlarmLevel) =>
  level === 'alert' ? 'text-primary' : 'text-slate-100';

const subtitleClass = (level: AlarmLevel) =>
  level === 'alert' ? 'text-primary/70' : 'text-slate-500/80';

const timeClass = (level: AlarmLevel) =>
  level === 'alert' ? 'text-primary/70' : 'text-slate-500';
</script>

<template>
  <section class="ui-section">
    <div class="flex items-baseline gap-2 mb-3">
      <h3 class="text-sm font-bold uppercase tracking-widest text-slate-500">
        {{ props.t('alarm.title', 'Alarm Log') }}
      </h3>
      <span class="text-[10px] text-slate-500/60 font-bold uppercase">
        {{ props.t('alarm.subtitle', 'Realtime Signals') }}
      </span>
    </div>

    <div v-if="props.logs.length > 0" class="space-y-3">
      <div
        v-for="log in props.logs"
        :key="log.id"
        :class="['flex gap-4 p-3 rounded-xl border transition-all duration-300', rowClass(log.level)]"
      >
        <div :class="['size-10 rounded-lg flex items-center justify-center shrink-0', iconClass(log.level)]">
          <AppIcon :name="log.iconName" class="w-5 h-5" />
        </div>

        <div class="flex-1">
          <div class="flex justify-between items-start">
            <div class="flex flex-col">
              <h4 :class="['text-sm font-bold leading-tight', titleClass(log.level)]">{{ log.title }}</h4>
              <span :class="['text-[9px] uppercase font-bold', subtitleClass(log.level)]">{{ log.subtitle }}</span>
            </div>
            <span :class="['text-[10px]', timeClass(log.level)]">{{ log.time }}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">{{ log.detail }}</p>
        </div>
      </div>
    </div>

    <EmptyStateCard
      v-else
      :title="props.t('alarm.empty.title', 'No alarm records yet')"
      :description="props.t('alarm.empty.desc', 'Events will show up here after monitoring starts.')"
      icon-name="bellOff"
    />
  </section>
</template>
