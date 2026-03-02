<script setup lang="ts">
import { computed } from 'vue';
import EmptyStateCard from '../common/EmptyStateCard.vue';
import type { AppTab } from '../../types/ui';

const props = defineProps<{
  tab: AppTab;
}>();

const config = computed(() => {
  if (props.tab === 'events') {
    return {
      title: 'Events workspace pending',
      description: 'Event filter, grouping and export UI will be plugged in next.',
      iconName: 'bell' as const,
    };
  }
  if (props.tab === 'cameras') {
    return {
      title: 'Cameras workspace pending',
      description: 'Camera grid and multi-channel preview UI are not wired yet.',
      iconName: 'camera' as const,
    };
  }
  return {
    title: 'Logs workspace pending',
    description: 'Structured logs and search panel will be added in next iteration.',
    iconName: 'history' as const,
  };
});
</script>

<template>
  <section class="ui-section py-5">
    <EmptyStateCard
      :title="config.title"
      :description="config.description"
      :icon-name="config.iconName"
    />
  </section>
</template>
