<script setup lang="ts">
import type { ActionSetting } from '../../types/ui';
import EmptyStateCard from '../common/EmptyStateCard.vue';
import SectionHeader from './SectionHeader.vue';
import SwitchRow from './SwitchRow.vue';
import type { Translator } from '../../composables/useI18n';

const props = defineProps<{
  items: ActionSetting[];
  t: Translator;
}>();

const emit = defineEmits<{
  (e: 'update-action', payload: { id: string; enabled: boolean }): void;
}>();
</script>

<template>
  <section>
    <SectionHeader
      :title="props.t('action.title', 'Action Strategy')"
      :subtitle="props.t('action.subtitle', 'What to do after trigger')"
    />

    <div v-if="props.items.length > 0" class="ui-card-soft overflow-hidden divide-y divide-primary/10">
      <SwitchRow
        v-for="item in props.items"
        :key="item.id"
        :icon-name="item.iconName"
        :title="props.t(`action.${item.id}.title`, item.title)"
        :subtitle="props.t(`action.${item.id}.desc`, item.subtitle)"
        :checked="item.enabled"
        @update:checked="emit('update-action', { id: item.id, enabled: $event })"
      />
    </div>

    <EmptyStateCard
      v-else
      :title="props.t('action.empty.title', 'No strategy configured')"
      :description="props.t('action.empty.desc', 'Add at least one response action to protect your workflow.')"
      icon-name="bell"
    />
  </section>
</template>
