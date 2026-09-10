import { spawnSync } from 'child_process';

const passthrough = process.argv.slice(2);

const result = spawnSync(
  'npx',
  ['electron-builder', ...passthrough],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);

process.exit(result.status ?? 1);