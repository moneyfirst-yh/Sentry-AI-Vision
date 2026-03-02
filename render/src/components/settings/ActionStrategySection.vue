<script setup lang="ts">
import type { ActionSetting } from '../../types/ui';
import EmptyStateCard from '../common/EmptyStateCard.vue';
import SectionHeader from './SectionHeader.vue';
import SwitchRow from './SwitchRow.vue';
import type { Translator } from '../../composables/useI18n';

const props = defineProps<{
  items: ActionSetting[];
  notificationText: string;
  t: Translator;
}>();

const emit = defineEmits<{
  (e: 'update-action', payload: { id: string; enabled: boolean }): void;
  (e: 'update:notification-text', value: string): void;
}>();
</script>

<template>
  <section>
    <SectionHeader :title="props.t('action.title', 'Action Strategy')"
      :subtitle="props.t('action.subtitle', 'What to do after trigger')" />

    <div v-if="props.items.length > 0" class="flex flex-col gap-4">
      <div class="ui-card-soft overflow-hidden divide-y divide-primary/10">
        <SwitchRow v-for="item in props.items" :key="item.id" :icon-name="item.iconName"
          :title="props.t(`action.${item.id}.title`, item.title)"
          :subtitle="props.t(`action.${item.id}.desc`, item.subtitle)" :checked="item.enabled"
          @update:checked="emit('update-action', { id: item.id, enabled: $event })" />
      </div>

      <div class="ui-card-soft p-4 flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-200">
          自定义系统通知 (Notification Text)
        </label>
        <input type="text" :value="props.notificationText"
          @input="emit('update:notification-text', ($event.target as HTMLInputElement).value)"
          class="bg-background-dark/50 border border-primary/20 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
          placeholder="警告：检测到未授权人员靠近！" />
      </div>
    </div>

    <EmptyStateCard v-else :title="props.t('action.empty.title', 'No strategy configured')"
      :description="props.t('action.empty.desc', 'Add at least one response action to protect your workflow.')"
      icon-name="bell" />
  </section>
</template>
