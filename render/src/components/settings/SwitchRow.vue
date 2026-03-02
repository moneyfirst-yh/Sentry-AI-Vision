<script setup lang="ts">
import type { IconName } from '../../types/ui';
import AppIcon from '../common/AppIcon.vue';

const props = defineProps<{
  iconName: IconName;
  title: string;
  subtitle: string;
  checked: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:checked', value: boolean): void;
}>();

const toggle = () => {
  emit('update:checked', !props.checked);
};
</script>

<template>
  <button
    type="button"
    class="w-full flex items-center justify-between p-4 min-h-[74px] text-left"
    @click="toggle"
    :aria-pressed="props.checked"
  >
    <div class="flex items-center gap-3">
      <AppIcon :name="props.iconName" class="w-5 h-5 text-slate-400" />
      <div>
        <span class="font-bold text-sm block leading-none">{{ props.title }}</span>
        <span class="text-[10px] text-slate-400">{{ props.subtitle }}</span>
      </div>
    </div>

    <div
      :class="[
        'relative h-6 w-11 rounded-full transition-colors',
        props.checked ? 'bg-primary' : 'bg-slate-700',
      ]"
    >
      <div
        :class="[
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
          props.checked ? 'translate-x-5' : '',
        ]"
      ></div>
    </div>
  </button>
</template>
