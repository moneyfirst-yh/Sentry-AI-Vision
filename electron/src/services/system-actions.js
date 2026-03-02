const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const runTaskList = async () => {
  const { stdout } = await execFileAsync('tasklist', ['/FO', 'CSV', '/NH'], {
    windowsHide: true,
  });
  return stdout;
};

const parseTaskList = (csvText) => {
  return csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const values = line.replace(/^"|"$/g, '').split('","');
      const imageName = values[0] || 'Unknown';
      const pid = Number(values[1]);
      if (!Number.isFinite(pid)) {
        return null;
      }

      return {
        id: String(pid),
        pid,
        name: imageName,
      };
    })
    .filter(Boolean);
};

const killProcessByPid = async (pid) => {
  await execFileAsync('taskkill', ['/PID', String(pid), '/F'], {
    windowsHide: true,
  });
};

const showDesktop = async () => {
  await execFileAsync(
    'powershell',
    ['-NoProfile', '-Command', '(New-Object -ComObject Shell.Application).MinimizeAll()'],
    { windowsHide: true },
  );
};

module.exports = {
  killProcessByPid,
  parseTaskList,
  runTaskList,
  showDesktop,
};