const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('node:path');
const os = require('node:os');
const ElectronStore = require('electron-store');
const { z } = require('zod');
const {
  parseTaskList,
  runTaskList,
  killProcessByPid,
  showDesktop,
} = require('./services/system-actions');
const Store = ElectronStore.default ?? ElectronStore;

if (process.env.ELECTRON_RENDERER_URL) {
  app.commandLine.appendSwitch('disable-http-cache');
}

const settingsSchema = z.object({
  masterEnabled: z.boolean(),
  sensitivity: z.number().min(0).max(100),
  proximity: z.number().min(0).max(100),
  selectedProcessId: z.string().nullable(),
  actionStates: z.array(
    z.object({
      id: z.string(),
      enabled: z.boolean(),
    }),
  ),
});

const notifySchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCpuTimes = () => {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  cpus.forEach((cpu) => {
    const times = cpu.times;
    idle += times.idle;
    total += times.user + times.nice + times.sys + times.idle + times.irq;
  });
  return { idle, total };
};

const sampleCpuUsage = async () => {
  const start = getCpuTimes();
  await sleep(200);
  const end = getCpuTimes();
  const idle = end.idle - start.idle;
  const total = end.total - start.total;
  if (total <= 0) {
    return 0;
  }
  const usage = (1 - idle / total) * 100;
  return Math.max(0, Math.min(100, Math.round(usage)));
};

const defaultSettings = {
  masterEnabled: true,
  sensitivity: 75,
  proximity: 45,
  selectedProcessId: null,
  actionStates: [
    { id: 'desktop-notification', enabled: true },
    { id: 'auto-kill', enabled: false },
    { id: 'auto-minimize', enabled: false },
    { id: 'back-to-desktop', enabled: true },
  ],
};

const store = new Store({
  name: 'sentinel-settings',
  defaults: {
    ruleSettings: defaultSettings,
  },
});

let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 375,
    height: 812,
    minWidth: 360,
    minHeight: 640,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (rendererUrl) {
    mainWindow.webContents.session.clearCache().catch(() => { });
    mainWindow.loadURL(rendererUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../render/dist/index.html'));
  }
};

const registerIpc = () => {
  ipcMain.handle('settings:get', async () => {
    const data = store.get('ruleSettings');
    return settingsSchema.parse(data);
  });

  ipcMain.handle('settings:set', async (_event, payload) => {
    const parsed = settingsSchema.parse(payload);
    store.set('ruleSettings', parsed);
    return parsed;
  });

  ipcMain.handle('system:list-processes', async () => {
    const raw = await runTaskList();
    const processes = parseTaskList(raw)
      .filter((item) => item.pid > 0)
      .sort((a, b) => {
        // Sort by App Name (from MainWindowTitle which we mapped to description)
        const nameA = a.description || a.name || '';
        const nameB = b.description || b.name || '';
        const nameDiff = nameA.localeCompare(nameB);
        if (nameDiff !== 0) {
          return nameDiff;
        }
        return a.pid - b.pid;
      })
      .slice(0, 300);

    return processes;
  });

  ipcMain.handle('system:kill-process', async (_event, pid) => {
    const parsedPid = z.number().int().positive().parse(pid);
    await killProcessByPid(parsedPid);
    return { ok: true };
  });

  ipcMain.handle('system:minimize-process', async (_event, pid) => {
    const parsedPid = z.number().int().positive().parse(pid);
    const { minimizeProcessByPid } = require('./services/system-actions');
    await minimizeProcessByPid(parsedPid);
    return { ok: true };
  });

  ipcMain.handle('system:show-desktop', async () => {
    await showDesktop();
    return { ok: true };
  });

  ipcMain.handle('system:telemetry', async () => {
    const cpuUsage = await sampleCpuUsage();
    return {
      cpuUsage,
      gpuUsage: null,
      fps: null,
    };
  });

  ipcMain.handle('notify:send', async (_event, payload) => {
    const parsed = notifySchema.parse(payload);
    if (Notification.isSupported()) {
      new Notification({
        title: parsed.title,
        body: parsed.body,
      }).show();
    }
    return { ok: true };
  });
};

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.sentinel.desktop');
  }
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
