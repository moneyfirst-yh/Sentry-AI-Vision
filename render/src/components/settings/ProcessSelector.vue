<script setup lang="ts">
import { Check, ChevronDown } from 'lucide-vue-next';
import { ref } from 'vue';
import type { ProcessOption } from '../../types/ui';
import AppIcon from '../common/AppIcon.vue';
import EmptyStateCard from '../common/EmptyStateCard.vue';
import type { Translator } from '../../composables/useI18n';

const props = defineProps<{
  selected: ProcessOption;
  options: ProcessOption[];
  t: Translator;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();

const isExpanded = ref(false);

const toggleExpanded = () => {
  if (props.options.length === 0) {
    return;
  }
  isExpanded.value = !isExpanded.value;
};

const selectOption = (id: string) => {
  emit('select', id);
  isExpanded.value = false;
};
</script>

<template>
  <div class="space-y-2">
    <button
      type="button"
      class="ui-card-soft w-full flex items-center justify-between p-4 hover:bg-primary/10 transition-all"
      @click="toggleExpanded"
      :aria-expanded="isExpanded"
    >
      <div class="flex items-center gap-3 text-left">
        <div class="size-9 rounded bg-slate-800 flex items-center justify-center border border-primary/10">
          <AppIcon :name="props.selected.iconName" class="w-5 h-5" :class="props.selected.iconColorClass" />
        </div>
        <div>
          <p class="font-bold text-sm">{{ props.selected.name }}</p>
          <p class="text-slate-400 text-[10px] italic">
            {{ props.t('process.pid', 'PID') }}: {{ props.selected.pid }}
          </p>
        </div>
      </div>
      <ChevronDown class="w-5 h-5 text-slate-400 transition-transform" :class="isExpanded ? 'rotate-180' : ''" />
    </button>

    <div
      v-if="props.options.length > 0 && isExpanded"
      class="ui-card-soft overflow-hidden divide-y divide-primary/10"
    >
      <button
        v-for="option in props.options"
        :key="option.id"
        type="button"
        class="w-full p-3 flex items-center gap-3 hover:bg-primary/10 cursor-pointer text-left"
        @click="selectOption(option.id)"
      >
        <div class="size-8 rounded bg-slate-800 flex items-center justify-center">
          <AppIcon :name="option.iconName" class="w-4 h-4" :class="option.iconColorClass" />
        </div>
        <div>
          <p class="text-sm font-bold">{{ option.name }}</p>
          <p class="text-[10px] text-slate-500">{{ option.description }}</p>
        </div>
        <Check v-if="option.id === props.selected.id" class="w-4 h-4 text-primary ml-auto shrink-0" />
      </button>
    </div>

    <EmptyStateCard
      v-if="props.options.length === 0"
      :title="props.t('process.empty.title', 'No process found')"
      :description="props.t('process.empty.desc', 'No running process detected from current source.')"
    />
  </div>
</template>
