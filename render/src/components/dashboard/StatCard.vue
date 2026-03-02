<script setup lang="ts">
import { computed } from 'vue';
import type { IconName } from '../../types/ui';
import AppIcon from '../common/AppIcon.vue';

const props = defineProps<{
  iconName: IconName;
  title: string;
  subtitle: string;
  value: number;
}>();

const barWidth = computed(() => `${Math.max(0, Math.min(100, props.value))}%`);
</script>

<template>
  <div class="ui-card p-3">
    <div class="flex items-center gap-2 mb-1">
      <AppIcon :name="props.iconName" class="w-4 h-4 text-primary" />
      <div class="flex flex-col">
        <span class="ui-label text-slate-500 leading-none">{{ props.title }}</span>
        <span class="text-[8px] text-slate-500/70 uppercase">{{ props.subtitle }}</span>
      </div>
    </div>
    <p class="text-xl font-bold">{{ props.value.toFixed(0) }}%</p>
    <div class="w-full bg-slate-700 h-1 rounded-full mt-2">
      <div class="bg-primary h-1 rounded-full transition-all duration-500" :style="{ width: barWidth }"></div>
    </div>
  </div>
</template>
