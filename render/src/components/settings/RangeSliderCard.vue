<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    value: number;
    unit?: string;
  }>(),
  {
    unit: '%',
  },
);

const emit = defineEmits<{
  (e: 'update:value', value: number): void;
}>();

const onInput = (event: Event) => {
  const nextValue = Number((event.target as HTMLInputElement).value);
  emit('update:value', Number.isFinite(nextValue) ? nextValue : props.value);
};
</script>

<template>
  <div class="ui-card-soft p-4">
    <div class="flex items-center justify-between mb-3">
      <div>
        <p class="text-sm font-bold uppercase tracking-wider">{{ props.title }}</p>
        <p class="text-[10px] text-slate-400 font-medium mt-1">{{ props.subtitle }}</p>
      </div>
      <p class="text-primary text-sm font-bold">{{ props.value }}{{ props.unit }}</p>
    </div>
    <input
      type="range"
      :value="props.value"
      min="0"
      max="100"
      class="w-full h-1.5 bg-primary/20 rounded-full appearance-none cursor-pointer accent-primary"
      @input="onInput"
    />
  </div>
</template>
