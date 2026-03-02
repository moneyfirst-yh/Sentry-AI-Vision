<script setup lang="ts">
import { computed, ref } from 'vue';
import type { AlarmLevel, AlarmLogItem } from '../../types/ui';
import type { Translator } from '../../composables/useI18n';
import AppIcon from '../common/AppIcon.vue';
import EmptyStateCard from '../common/EmptyStateCard.vue';

const props = defineProps<{
  logs: AlarmLogItem[];
  t: Translator;
}>();

type FilterLevel = 'all' | AlarmLevel;

const selectedLevel = ref<FilterLevel>('all');

const filters = computed(() => [
  { id: 'all' as const, label: props.t('events.filter.all', 'All') },
  { id: 'default' as const, label: props.t('events.filter.default', 'Default') },
  { id: 'alert' as const, label: props.t('events.filter.alert', 'Alert') },
  { id: 'muted' as const, label: props.t('events.filter.muted', 'Muted') },
]);

const filteredLogs = computed(() =>
  selectedLevel.value === 'all'
    ? props.logs
    : props.logs.filter((log) => log.level === selectedLevel.value),
);

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

const levelLabel = (level: AlarmLevel) =>
  props.t(`level.${level}`, level);
</script>

<template>
  <section class="ui-section">
    <div class="flex items-baseline justify-between gap-3 mb-3">
      <div>
        <h3 class="text-sm font-bold uppercase tracking-widest text-slate-500">
          {{ props.t('events.title', 'Event Stream') }}
        </h3>
        <span class="text-[10px] text-slate-500/60 font-bold uppercase">
          {{ props.t('events.subtitle', 'Filter by severity') }}
        </span>
      </div>
      <span class="ui-pill text-primary bg-primary/10">
        {{ props.t('events.count', '{count} total', { count: filteredLogs.length }) }}
      </span>
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="filter in filters"
        :key="filter.id"
        type="button"
        class="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all border"
        :class="
          selectedLevel === filter.id
            ? 'bg-primary text-black border-primary'
            : 'bg-slate-panel text-slate-400 border-slate-border'
        "
        @click="selectedLevel = filter.id"
      >
        {{ filter.label }}
      </button>
    </div>

    <div v-if="filteredLogs.length > 0" class="space-y-3">
      <div
        v-for="log in filteredLogs"
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
              <span :class="['text-[9px] uppercase font-bold', subtitleClass(log.level)]">
                {{ log.subtitle }} · {{ levelLabel(log.level) }}
              </span>
            </div>
            <span :class="['text-[10px]', timeClass(log.level)]">{{ log.time }}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">{{ log.detail }}</p>
        </div>
      </div>
    </div>

    <EmptyStateCard
      v-else
      :title="props.t('events.empty.title', 'No events yet')"
      :description="props.t('events.empty.desc', 'Events will appear after detections start.')"
      icon-name="bellOff"
    />
  </section>
</template>
