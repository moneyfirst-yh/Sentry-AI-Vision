import type {
  ActionSetting,
  AlarmLogItem,
  NavItem,
  ProcessOption,
  TimelineBar,
} from '../types/ui';

export const navItems: NavItem[] = [
  { id: 'dash', label: 'Dashboard', shortLabel: 'Dash', iconName: 'layout' },
  { id: 'events', label: 'Events', shortLabel: 'Events', iconName: 'bell' },
  { id: 'cameras', label: 'Cameras', shortLabel: 'Cameras', iconName: 'camera' },
  { id: 'logs', label: 'Logs', shortLabel: 'Logs', iconName: 'history' },
];

export const timelineBars: TimelineBar[] = [
  { id: 1, heightClass: 'h-6', colorClass: 'bg-slate-700' },
  { id: 2, heightClass: 'h-8', colorClass: 'bg-primary' },
  { id: 3, heightClass: 'h-4', colorClass: 'bg-slate-700' },
  { id: 4, heightClass: 'h-6', colorClass: 'bg-slate-700' },
  { id: 5, heightClass: 'h-4', colorClass: 'bg-slate-700' },
  { id: 6, heightClass: 'h-10', colorClass: 'bg-primary/40' },
  { id: 7, heightClass: 'h-6', colorClass: 'bg-slate-700' },
  { id: 8, heightClass: 'h-8', colorClass: 'bg-primary' },
  { id: 9, heightClass: 'h-4', colorClass: 'bg-slate-700' },
  { id: 10, heightClass: 'h-4', colorClass: 'bg-slate-700' },
  { id: 11, heightClass: 'h-10', colorClass: 'bg-primary' },
  { id: 12, heightClass: 'h-6', colorClass: 'bg-slate-700' },
  { id: 13, heightClass: 'h-4', colorClass: 'bg-slate-700' },
];

export const alarmLogs: AlarmLogItem[] = [
  {
    id: 1,
    title: 'Person Detected',
    subtitle: 'Zone A',
    time: '14:02:45',
    detail: 'Desk workspace activity detected.',
    iconName: 'searchPerson',
    level: 'default',
  },
  {
    id: 2,
    title: 'Person Approaching',
    subtitle: 'Distance Trigger',
    time: '14:01:22',
    detail: 'Distance dropped below 1.2 meters.',
    iconName: 'userCheck',
    level: 'default',
  },
  {
    id: 3,
    title: 'Auto Action Triggered',
    subtitle: 'Response Mode',
    time: '13:58:04',
    detail: 'Privacy lock action has been applied.',
    iconName: 'shieldAlert',
    level: 'alert',
  },
  {
    id: 4,
    title: 'Scene Cleared',
    subtitle: 'No Targets',
    time: '13:55:10',
    detail: 'Target count returned to zero.',
    iconName: 'doorOpen',
    level: 'muted',
  },
];

export const actionSettings: ActionSetting[] = [
  {
    id: 'desktop-notification',
    title: 'Desktop Notification',
    subtitle: 'Show system-level alert toast',
    enabled: true,
    iconName: 'bell',
  },
  {
    id: 'auto-kill',
    title: 'Auto-kill Process',
    subtitle: 'Terminate selected process at threshold',
    enabled: false,
    iconName: 'circleOff',
  },
  {
    id: 'back-to-desktop',
    title: 'Auto-return to Desktop',
    subtitle: 'Switch to desktop when risk level is high',
    enabled: true,
    iconName: 'monitor',
  },
  {
    id: 'auto-minimize',
    title: 'Auto-minimize Process',
    subtitle: 'Minimize selected process without killing',
    enabled: false,
    iconName: 'monitorCog',
  },
];

export const processOptions: ProcessOption[] = [
  {
    id: 'chrome',
    name: 'Google Chrome',
    pid: 12840,
    description: 'Primary browser',
    iconName: 'globe',
    iconColorClass: 'text-blue-500',
  },
  {
    id: 'code',
    name: 'Visual Studio Code',
    pid: 10422,
    description: 'Code editor',
    iconName: 'terminal',
    iconColorClass: 'text-primary',
  },
  {
    id: 'notion',
    name: 'Notion.exe',
    pid: 9631,
    description: 'Knowledge workspace',
    iconName: 'file',
    iconColorClass: 'text-orange-500',
  },
];
