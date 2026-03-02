const { contextBridge, ipcRenderer } = require('electron');

const api = {
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (payload) => ipcRenderer.invoke('settings:set', payload),
  },
  system: {
    listProcesses: () => ipcRenderer.invoke('system:list-processes'),
    killProcess: (pid) => ipcRenderer.invoke('system:kill-process', pid),
    minimizeProcess: (pid) => ipcRenderer.invoke('system:minimize-process', pid),
    showDesktop: () => ipcRenderer.invoke('system:show-desktop'),
    telemetry: () => ipcRenderer.invoke('system:telemetry'),
  },
  notify: {
    send: (payload) => ipcRenderer.invoke('notify:send', payload),
  },
};

contextBridge.exposeInMainWorld('sentinelApi', api);
