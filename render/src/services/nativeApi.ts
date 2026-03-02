import type { NativeProcessInfo, SettingsSnapshot, TelemetrySample } from '../types/ui';

interface NotificationPayload {
  title: string;
  body: string;
}

interface SentinelNativeApi {
  settings: {
    get: () => Promise<SettingsSnapshot>;
    set: (payload: SettingsSnapshot) => Promise<SettingsSnapshot>;
  };
  system: {
    listProcesses: () => Promise<NativeProcessInfo[]>;
    killProcess: (pid: number) => Promise<{ ok: boolean }>;
    showDesktop: () => Promise<{ ok: boolean }>;
    telemetry: () => Promise<TelemetrySample>;
  };
  notify: {
    send: (payload: NotificationPayload) => Promise<{ ok: boolean }>;
  };
}

let cachedSettings: SettingsSnapshot = {
  masterEnabled: true,
  sensitivity: 75,
  proximity: 45,
  selectedProcessId: null,
  actionStates: [
    { id: 'desktop-notification', enabled: true },
    { id: 'auto-kill', enabled: false },
    { id: 'back-to-desktop', enabled: true },
  ],
};

const fallbackApi: SentinelNativeApi = {
  settings: {
    get: async () => cachedSettings,
    set: async (payload) => {
      cachedSettings = payload;
      return cachedSettings;
    },
  },
  system: {
    listProcesses: async () => [],
    killProcess: async () => ({ ok: false }),
    showDesktop: async () => ({ ok: false }),
    telemetry: async () => ({ cpuUsage: 0, gpuUsage: null, fps: null }),
  },
  notify: {
    send: async ({ title, body }) => {
      // Browser mode fallback: keep signal visible while not in Electron.
      console.info('[notify:mock]', title, body);
      return { ok: true };
    },
  },
};

export const nativeApi: SentinelNativeApi =
  window.sentinelApi ?? fallbackApi;

export type { SentinelNativeApi, NotificationPayload };
