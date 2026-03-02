import { watch, type Ref } from 'vue';
import { nativeApi } from '../services/nativeApi';
import type { Translator } from './useI18n';
import type { ActionSetting, ProcessOption } from '../types/ui';

interface RuleInputRefs {
  masterEnabled: Ref<boolean>;
  proximityThreshold: Ref<number>;
  targetCount: Ref<number>;
  proximityScore: Ref<number>;
  movementScore: Ref<number>;
  selectedProcess: Ref<ProcessOption | null>;
  actionItems: Ref<ActionSetting[]>;
}

interface EventSink {
  onDetected: (payload: { targetCount: number }) => void;
  onApproaching: (payload: {
    proximityScore: number;
    threshold: number;
    targetCount: number;
  }) => void;
  onCleared: () => void;
  onActionTriggered: (payload: { results: string[] }) => void;
  onError: (message: string) => void;
}

export function useRuleEngine(
  input: RuleInputRefs,
  sink: EventSink,
  t?: Translator,
) {
  let seenPresence = false;
  let detectedFrames = 0;
  let approachFrames = 0;
  let clearFrames = 0;
  let actionCooldownUntil = 0;
  let approachEventCooldownUntil = 0;

  const minDetectedFrames = 3;
  const minApproachFrames = 6;
  const minClearFrames = 5;
  const cooldownMs = 15000;

  const triggerActions = async () => {
    const actionMap = new Map(
      input.actionItems.value.map((item) => [item.id, item.enabled]),
    );
    const results: string[] = [];

    if (actionMap.get('desktop-notification')) {
      const result = await nativeApi.notify.send({
        title: t?.('notify.title', 'Sentinel Alert') ?? 'Sentinel Alert',
        body:
          t?.(
            'notify.body',
            'Person approaching detected, response strategy triggered.',
          ) ??
          'Person approaching detected, response strategy triggered.',
      });
      if (result.ok) {
        results.push('desktop-notification');
      }
    }

    if (actionMap.get('auto-kill')) {
      const process = input.selectedProcess.value;
      if (process) {
        const result = await nativeApi.system.killProcess(process.pid);
        if (result.ok) {
          results.push(`auto-kill:${process.name}(${process.pid})`);
        }
      }
    }

    if (actionMap.get('auto-minimize')) {
      const process = input.selectedProcess.value;
      if (process) {
        const result = await nativeApi.system.minimizeProcess(process.pid);
        if (result.ok) {
          results.push(`auto-minimize:${process.name}(${process.pid})`);
        }
      }
    }

    if (actionMap.get('back-to-desktop')) {
      const result = await nativeApi.system.showDesktop();
      if (result.ok) {
        results.push('back-to-desktop');
      }
    }

    sink.onActionTriggered({ results });
  };

  watch(
    [
      input.masterEnabled,
      input.targetCount,
      input.proximityScore,
      input.proximityThreshold,
      input.movementScore,
    ],
    async () => {
      if (!input.masterEnabled.value) {
        detectedFrames = 0;
        approachFrames = 0;
        clearFrames = 0;
        seenPresence = false;
        return;
      }

      const count = input.targetCount.value;
      const proximity = input.proximityScore.value;
      const threshold = input.proximityThreshold.value;

      if (count > 0) {
        detectedFrames += 1;
        clearFrames = 0;
      } else {
        clearFrames += 1;
        detectedFrames = 0;
        approachFrames = 0;
      }

      if (!seenPresence && detectedFrames >= minDetectedFrames) {
        seenPresence = true;
        sink.onDetected({ targetCount: count });
      }

      if (seenPresence && clearFrames >= minClearFrames) {
        seenPresence = false;
        sink.onCleared();
      }

      if (count > 0 && proximity >= threshold) {
        approachFrames += 1;
      } else {
        approachFrames = 0;
      }

      if (approachFrames >= minApproachFrames) {
        const now = Date.now();
        if (now > approachEventCooldownUntil) {
          approachEventCooldownUntil = now + 4000;
          sink.onApproaching({
            proximityScore: proximity,
            threshold,
            targetCount: count,
          });
        }

        if (now > actionCooldownUntil) {
          actionCooldownUntil = now + cooldownMs;
          try {
            await triggerActions();
          } catch (err) {
            sink.onError(
              err instanceof Error ? err.message : 'Action trigger failed.',
            );
          }
        }
        approachFrames = 0;
      }
    },
    {
      flush: 'post',
    },
  );
}
