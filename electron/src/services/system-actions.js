const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const runTaskList = async () => {
  // Use PowerShell to get processes that have a main window title.
  // We format the output as CSV: ProcessName,Id,MainWindowTitle
  const psScript = `
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    Get-Process | Where-Object { $_.MainWindowTitle } | Select-Object Name, Id, MainWindowTitle | ConvertTo-Csv -NoTypeInformation
  `;
  const { stdout } = await execFileAsync(
    'powershell',
    ['-NoProfile', '-Command', psScript],
    { windowsHide: true, encoding: 'utf8' }
  );
  return stdout;
};

const parseTaskList = (csvText) => {
  return csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    // Skip the first header line from ConvertTo-Csv
    .filter((line, index) => line && index > 0)
    .map((line) => {
      // CSV format from PowerShell uses double quotes: "Name","123","Title"
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (!values || values.length < 3) return null;

      const clean = (val) => val.replace(/^"|"$/g, '');
      const imageName = clean(values[0]) || 'Unknown';
      const pid = Number(clean(values[1]));
      const windowTitle = clean(values[2]);

      if (!Number.isFinite(pid)) {
        return null;
      }

      return {
        id: String(pid),
        pid,
        name: imageName,
        description: windowTitle, // Use window title as the displayed description
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

const minimizeProcessByPid = async (pid) => {
  const psScript = `
    $pidToMin = ${pid};
    Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      public class Win32 {
        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
      }
"@
    $proc = Get-Process -Id $pidToMin -ErrorAction SilentlyContinue
    if ($proc -and $proc.MainWindowHandle -ne [System.IntPtr]::Zero) {
      [Win32]::ShowWindow($proc.MainWindowHandle, 6) # SW_MINIMIZE = 6
    }
  `;
  await execFileAsync(
    'powershell',
    ['-NoProfile', '-Command', psScript],
    { windowsHide: true },
  );
};

module.exports = {
  killProcessByPid,
  minimizeProcessByPid,
  parseTaskList,
  runTaskList,
  showDesktop,
};