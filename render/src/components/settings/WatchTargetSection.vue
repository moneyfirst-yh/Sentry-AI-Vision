<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next';
import type { ProcessOption } from '../../types/ui';
import EmptyStateCard from '../common/EmptyStateCard.vue';
import ProcessSelector from './ProcessSelector.vue';
import type { Translator } from '../../composables/useI18n';

const props = defineProps<{
  selected: ProcessOption | null;
  options: ProcessOption[];
  t: Translator;
}>();

const emit = defineEmits<{
  (e: 'select-process', id: string): void;
  (e: 'refresh'): void;
}>();
</script>

<template>
  <section>
    <div class="flex items-start justify-between gap-3 pb-3">
      <div>
        <h3 class="ui-title">{{ props.t('watch.title', 'Watch Target') }}</h3>
        <p class="text-xs text-primary/60 font-medium mt-1">
          {{ props.t('watch.subtitle', 'Process to protect when risk rises') }}
        </p>
      </div>
      <button
        type="button"
        class="ui-button-secondary h-9 px-3 text-xs flex items-center gap-1.5"
        @click="emit('refresh')"
      >
        <RefreshCw class="w-4 h-4" />
        {{ props.t('watch.refresh', 'Refresh') }}
      </button>
    </div>

    <ProcessSelector
      v-if="props.selected"
      :selected="props.selected"
      :options="props.options"
      :t="props.t"
      @select="emit('select-process', $event)"
    />

    <EmptyStateCard
      v-else
      :title="props.t('watch.empty.title', 'No active process available')"
      :description="props.t('watch.empty.desc', 'Process list will appear after runtime bridge is connected.')"
      icon-name="monitorCog"
    />
  </section>
</template>
