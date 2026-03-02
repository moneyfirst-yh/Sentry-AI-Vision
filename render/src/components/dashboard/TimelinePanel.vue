<script setup lang="ts">
import type { TimelineBar } from '../../types/ui';
import type { Translator } from '../../composables/useI18n';
import EmptyStateCard from '../common/EmptyStateCard.vue';

const props = defineProps<{
  bars: TimelineBar[];
  t: Translator;
}>();
</script>

<template>
  <section class="ui-section mb-6">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-baseline gap-2">
        <h3 class="text-sm font-bold uppercase tracking-widest text-slate-500">
          {{ props.t('timeline.title', 'Event Timeline') }}
        </h3>
        <span class="text-[10px] text-slate-500/60 font-bold uppercase">
          {{ props.t('timeline.subtitle', 'Recent Activity') }}
        </span>
      </div>
      <span class="ui-pill text-primary bg-primary/10">
        {{ props.t('timeline.range', 'Last 60 min') }}
      </span>
    </div>

    <div
      v-if="props.bars.length > 0"
      class="h-12 w-full bg-slate-panel rounded-lg border border-slate-border flex items-center px-1 overflow-x-auto no-scrollbar relative"
    >
      <div class="absolute h-full w-[2px] bg-primary left-1/2 z-10 shadow-[0_0_8px_rgba(19,236,91,0.5)]"></div>
      <div class="flex gap-4 items-center min-w-max px-4">
        <div
          v-for="item in props.bars"
          :key="item.id"
          :class="[item.heightClass, 'w-1 rounded-full transition-all', item.colorClass]"
        ></div>
      </div>
    </div>

    <EmptyStateCard
      v-else
      :title="props.t('timeline.empty.title', 'No timeline data')"
      :description="props.t('timeline.empty.desc', 'Time-distributed events will appear once detections start.')"
      icon-name="chart"
    />
  </section>
</template>
