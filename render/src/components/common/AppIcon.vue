<script setup lang="ts">
import {
  Bell,
  BellOff,
  Camera,
  ChartNoAxesColumnIncreasing,
  CircleOff,
  Cpu,
  DoorOpen,
  FileText,
  Globe,
  History,
  LayoutDashboard,
  Monitor,
  MonitorCog,
  Search,
  Shield,
  ShieldAlert,
  Terminal,
  UserCheck,
  Users,
  X,
} from 'lucide-vue-next';
import type { IconName } from '../../types/ui';

const props = defineProps<{
  name: IconName;
  class?: string;
}>();
</script>

<template>
  <Bell v-if="props.name === 'bell'" :class="props.class" />
  <BellOff v-else-if="props.name === 'bellOff'" :class="props.class" />
  <Camera v-else-if="props.name === 'camera'" :class="props.class" />
  <UserCheck v-else-if="props.name === 'check'" :class="props.class" />
  <ChartNoAxesColumnIncreasing v-else-if="props.name === 'chart'" :class="props.class" />
  <CircleOff v-else-if="props.name === 'circleOff'" :class="props.class" />
  <X v-else-if="props.name === 'close'" :class="props.class" />
  <Cpu v-else-if="props.name === 'cpu'" :class="props.class" />
  <DoorOpen v-else-if="props.name === 'doorOpen'" :class="props.class" />
  <FileText v-else-if="props.name === 'file'" :class="props.class" />
  <Globe v-else-if="props.name === 'globe'" :class="props.class" />
  <History v-else-if="props.name === 'history'" :class="props.class" />
  <LayoutDashboard v-else-if="props.name === 'layout'" :class="props.class" />
  <Monitor v-else-if="props.name === 'monitor'" :class="props.class" />
  <MonitorCog v-else-if="props.name === 'monitorCog'" :class="props.class" />
  <Search v-else-if="props.name === 'searchPerson'" :class="props.class" />
  <Shield v-else-if="props.name === 'shield'" :class="props.class" />
  <ShieldAlert v-else-if="props.name === 'shieldAlert'" :class="props.class" />
  <Terminal v-else-if="props.name === 'terminal'" :class="props.class" />
  <UserCheck v-else-if="props.name === 'userCheck'" :class="props.class" />
  <Users v-else-if="props.name === 'users'" :class="props.class" />
  <Shield v-else :class="props.class" />
</template>
