/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  sentinelApi?: {
    settings: {
      get: () => Promise<import('./types/ui').SettingsSnapshot>;
      set: (
        payload: import('./types/ui').SettingsSnapshot,
      ) => Promise<import('./types/ui').SettingsSnapshot>;
    };
    system: {
      listProcesses: () => Promise<import('./types/ui').NativeProcessInfo[]>;
      killProcess: (pid: number) => Promise<{ ok: boolean }>;
      minimizeProcess: (pid: number) => Promise<{ ok: boolean }>;
      showDesktop: () => Promise<{ ok: boolean }>;
      telemetry: () => Promise<import('./types/ui').TelemetrySample>;
    };
    notify: {
      send: (payload: { title: string; body: string }) => Promise<{ ok: boolean }>;
    };
  };
}
