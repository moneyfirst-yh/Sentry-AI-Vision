import * as lucide from 'lucide-vue-next';

const usedIcons = [
  'HelpCircle', 'X', 'Bell', 'BellOff', 'Camera', 'ChartNoAxesColumnIncreasing',
  'CircleOff', 'Cpu', 'DoorOpen', 'FileText', 'Globe', 'History', 'LayoutDashboard',
  'Monitor', 'MonitorCog', 'Search', 'Shield', 'ShieldAlert', 'Terminal', 'UserCheck',
  'Users', 'Settings', 'Save', 'RotateCcw', 'ChevronDown', 'ShieldCheck', 'Maximize2', 'Minimize2',
  'Play', 'Pause', 'AlertCircle', 'AlertTriangle', 'CheckCircle2', 'Info'
];

const missing = [];
for (const key of Object.keys(lucide)) {
  // just log if some things are not there
}

const explicitlyMissing = usedIcons.filter(icon => !lucide[icon]);
console.log('Explicitly checked missing icons:', explicitlyMissing);

// Also let's check the files to see exactly what they import
import fs from 'fs';
import path from 'path';

const srcDir = './src';
function findImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findImports(fullPath);
    } else if (fullPath.endsWith('.vue') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const match = content.match(/from\s+['"]lucide-vue-next['"]/g);
      if (match) {
        const importBlock = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-vue-next['"]/);
        if (importBlock) {
          const imports = importBlock[1].split(',').map(s => s.trim()).filter(Boolean);
          const localMissing = imports.filter(i => {
              const name = i.split(' as ')[0].trim();
              return !lucide[name];
          });
          if (localMissing.length > 0) {
            console.log(`File ${fullPath} has missing imports:`, localMissing);
          }
        }
      }
    }
  }
}

findImports(srcDir);
