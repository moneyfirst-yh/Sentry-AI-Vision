<script setup lang="ts">
import type { AppTab, NavItem } from '../../types/ui';
import type { Translator } from '../../composables/useI18n';
import AppIcon from '../common/AppIcon.vue';

const props = defineProps<{
  activeTab: AppTab;
  items: NavItem[];
  t: Translator;
}>();

const emit = defineEmits<{
  (e: 'change-tab', tab: AppTab): void;
}>();
</script>

<template>
  <nav class="fixed bottom-0 w-full bg-background-dark/90 backdrop-blur-lg border-t border-slate-border px-4 pt-2 pb-6 z-50">
    <div class="flex justify-between items-center max-w-md mx-auto">
      <button
        v-for="item in props.items"
        :key="item.id"
        @click="emit('change-tab', item.id)"
        :class="[
          'flex flex-col items-center gap-0.5 transition-all',
          props.activeTab === item.id ? 'text-primary' : 'text-slate-400',
        ]"
      >
        <AppIcon :name="item.iconName" class="w-6 h-6" />
        <span class="ui-label normal-case tracking-normal">
          {{ props.t(`nav.${item.id}`, item.label) }}
        </span>
        <span class="text-[8px] font-bold uppercase tracking-tighter opacity-70 leading-none">
          {{ props.t(`nav.${item.id}.short`, item.shortLabel) }}
        </span>
      </button>
    </div>
  </nav>
</template>
