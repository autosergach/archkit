import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'tsup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  target: 'node20',
  platform: 'node',
  noExternal: ['archkit-core'],
  splitting: false,
  async onSuccess() {
    const templatesSrc = path.join(REPO_ROOT, 'templates');
    const templatesDst = path.join(__dirname, 'templates');
    if (existsSync(templatesDst)) {
      rmSync(templatesDst, { recursive: true });
    }
    mkdirSync(templatesDst, { recursive: true });
    cpSync(templatesSrc, templatesDst, { recursive: true });

    const rootLicense = path.join(REPO_ROOT, 'LICENSE');
    const rootReadme = path.join(REPO_ROOT, 'README.md');
    if (existsSync(rootLicense)) {
      copyFileSync(rootLicense, path.join(__dirname, 'LICENSE'));
    }
    if (existsSync(rootReadme)) {
      copyFileSync(rootReadme, path.join(__dirname, 'README.md'));
    }
  },
});
