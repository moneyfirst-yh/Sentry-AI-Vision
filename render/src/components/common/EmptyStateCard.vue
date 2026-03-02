<script setup lang="ts">
import type { IconName } from '../../types/ui';
import AppIcon from './AppIcon.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    iconName?: IconName;
  }>(),
  {
    iconName: 'searchPerson',
  },
);
</script>

<template>
  <div class="ui-card-soft p-5 flex items-center gap-3">
    <div class="size-9 rounded-lg bg-black/25 border border-white/10 flex items-center justify-center shrink-0">
      <AppIcon :name="props.iconName" class="w-4 h-4 text-primary" />
    </div>
    <div>
      <p class="text-sm font-semibold text-slate-200">{{ props.title }}</p>
      <p class="text-xs text-slate-400 mt-0.5">{{ props.description }}</p>
    </div>
  </div>
</template>
