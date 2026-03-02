<script setup lang="ts">
import { computed, ref } from 'vue';
import type { AlarmLogItem } from '../../types/ui';
import type { Translator } from '../../composables/useI18n';
import AppIcon from '../common/AppIcon.vue';
import EmptyStateCard from '../common/EmptyStateCard.vue';

const props = defineProps<{
  logs: AlarmLogItem[];
  t: Translator;
}>();

const emit = defineEmits<{
  (e: 'preview-image', url: string): void;
}>();

const query = ref('');

const filteredLogs = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) {
    return props.logs;
  }
  return props.logs.filter((log) => {
    const haystack = `${log.title} ${log.subtitle} ${log.detail}`.toLowerCase();
    return haystack.includes(term);
  });
});
</script>

<template>
  <section class="ui-section">
    <div class="flex items-baseline justify-between gap-3 mb-3">
      <div>
        <h3 class="text-sm font-bold uppercase tracking-widest text-slate-500">
          {{ props.t('logs.title', 'Structured Logs') }}
        </h3>
        <span class="text-[10px] text-slate-500/60 font-bold uppercase">
          {{ props.t('logs.subtitle', 'Keyword search') }}
        </span>
      </div>
      <span class="ui-pill text-primary bg-primary/10">
        {{ props.t('logs.results', '{count} matches', { count: filteredLogs.length }) }}
      </span>
    </div>

    <div class="ui-card-soft p-3 flex items-center gap-3 mb-4">
      <span class="text-[10px] uppercase font-bold text-slate-400">
        {{ props.t('logs.search.label', 'Search') }}
      </span>
      <input
        v-model="query"
        type="text"
        class="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        :placeholder="props.t('logs.search.placeholder', 'Search title, zone, or detail')"
      />
    </div>

    <div v-if="filteredLogs.length > 0" class="space-y-3">
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="ui-card-soft p-3 flex gap-3 items-start"
      >
        <div class="size-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
          <AppIcon :name="log.iconName" class="w-4 h-4 text-primary" />
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-100">{{ log.title }}</p>
              <p class="text-[10px] uppercase font-bold text-slate-500 mt-1">{{ log.subtitle }}</p>
            </div>
            <span class="text-[10px] text-slate-500">{{ log.time }}</span>
          </div>
          <p class="text-xs text-slate-400 mt-2">{{ log.detail }}</p>
          <div v-if="log.imageUrl" class="mt-3 rounded overflow-hidden max-h-32 inline-block border border-slate-700/50 cursor-pointer hover:border-primary/50 transition-colors" @click="emit('preview-image', log.imageUrl)">
            <img :src="log.imageUrl" class="object-cover h-32 w-auto" :alt="props.t('logs.image.alt', 'Captured frame')" />
          </div>
        </div>
      </div>
    </div>

    <EmptyStateCard
      v-else
      :title="props.t('logs.empty.title', 'No logs yet')"
      :description="props.t('logs.empty.desc', 'Structured logs will appear after events trigger.')"
      icon-name="history"
    />
  </section>
</template>
