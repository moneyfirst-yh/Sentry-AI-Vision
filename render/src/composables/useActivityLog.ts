import { computed, shallowRef, type Ref } from 'vue';
import type { AlarmLevel, AlarmLogItem, IconName, TimelineBar } from '../types/ui';
import type { Language } from '../types/ui';

interface EventPayload {
  title: string;
  subtitle: string;
  detail: string;
  level?: AlarmLevel;
  iconName?: IconName;
}

const resolveLocale = () => {
  return 'zh-CN';
};

const mapScoreToBar = (id: number, score: number): TimelineBar => {
  if (score >= 70) {
    return { id, heightClass: 'h-10', colorClass: 'bg-primary' };
  }
  if (score >= 50) {
    return { id, heightClass: 'h-8', colorClass: 'bg-primary/80' };
  }
  if (score >= 30) {
    return { id, heightClass: 'h-6', colorClass: 'bg-primary/40' };
  }
  if (score >= 15) {
    return { id, heightClass: 'h-5', colorClass: 'bg-slate-600' };
  }
  return { id, heightClass: 'h-4', colorClass: 'bg-slate-700' };
};

export function useActivityLog() {
  const logs = shallowRef<AlarmLogItem[]>([]);
  const barSeed = shallowRef(
    Array.from({ length: 16 }, (_, index) =>
      mapScoreToBar(index + 1, index % 3 === 0 ? 35 : 8),
    ),
  );
  let barCursor = barSeed.value.length + 1;
  let logCursor = 1;

  const appendEvent = (payload: EventPayload) => {
    const locale = resolveLocale();
    const item: AlarmLogItem = {
      id: logCursor++,
      title: payload.title,
      subtitle: payload.subtitle,
      detail: payload.detail,
      time: new Date().toLocaleTimeString(locale, {
        hour12: false,
      }),
      iconName: payload.iconName ?? 'bell',
      level: payload.level ?? 'default',
    };
    logs.value = [item, ...logs.value].slice(0, 80);
  };

  const pushMotionScore = (score: number) => {
    const next = mapScoreToBar(barCursor++, score);
    barSeed.value = [...barSeed.value.slice(1), next];
  };

  const clearLogs = () => {
    logs.value = [];
  };

  return {
    alarmLogs: computed(() => logs.value),
    appendEvent,
    clearLogs,
    eventIcons: {
      approaching: 'userCheck' as const,
      detected: 'searchPerson' as const,
      cleared: 'doorOpen' as const,
      triggered: 'shieldAlert' as const,
    },
    pushMotionScore,
    timelineBars: computed(() => barSeed.value),
  };
}
