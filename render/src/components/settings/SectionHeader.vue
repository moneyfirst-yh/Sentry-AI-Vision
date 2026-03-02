<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle: string;
}>();
</script>

<template>
  <div class="pb-3">
    <h3 class="ui-title">{{ props.title }}</h3>
    <p class="text-xs text-primary/60 font-medium mt-1">{{ props.subtitle }}</p>
  </div>
</template>
