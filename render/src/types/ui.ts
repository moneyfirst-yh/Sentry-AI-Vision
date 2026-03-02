export type Language = 'zh' | 'en';
export type AppTab = 'dash' | 'events' | 'cameras' | 'logs';
export type AlarmLevel = 'default' | 'alert' | 'muted';
export type IconName =
  | 'bell'
  | 'bellOff'
  | 'camera'
  | 'check'
  | 'chart'
  | 'circleOff'
  | 'close'
  | 'cpu'
  | 'doorOpen'
  | 'file'
  | 'globe'
  | 'history'
  | 'layout'
  | 'monitor'
  | 'monitorCog'
  | 'searchPerson'
  | 'shield'
  | 'shieldAlert'
  | 'terminal'
  | 'userCheck'
  | 'users';

export interface TimelineBar {
  id: number;
  heightClass: string;
  colorClass: string;
}

export interface AlarmLogItem {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  detail: string;
  level: AlarmLevel;
  iconName: IconName;
}

export interface NavItem {
  id: AppTab;
  label: string;
  shortLabel: string;
  iconName: IconName;
}

export interface ActionSetting {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  iconName: IconName;
}

export interface ProcessOption {
  id: string;
  name: string;
  pid: number;
  description: string;
  iconName: IconName;
  iconColorClass: string;
}

export interface SettingsSnapshot {
  masterEnabled: boolean;
  sensitivity: number;
  proximity: number;
  selectedProcessId: string | null;
  actionStates: Array<{
    id: string;
    enabled: boolean;
  }>;
}

export interface PersonBox {
  id: string;
  confidence: number;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  areaRatio: number;
}

export interface DetectorMetrics {
  inferenceFps: number;
  targetCount: number;
  proximityScore: number;
  movementScore: number;
}

export interface NativeProcessInfo {
  id: string;
  pid: number;
  name: string;
}

export interface TelemetrySample {
  cpuUsage: number;
  gpuUsage?: number | null;
  fps?: number | null;
}
