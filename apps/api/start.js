#!/usr/bin/env node
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const child = spawn('npx', ['tsx', join(__dirname, 'src/index.ts')], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});
