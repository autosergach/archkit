import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { execa } from 'execa';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { NodeFileSystemAdapter } from '../../packages/cli/src/adapters/node-file-system.js';
import { runCreate } from '../../packages/cli/src/run-create.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TEMPLATE_DIR = path.join(REPO_ROOT, 'templates', 'library-clean');

describe('archkit create — end-to-end', () => {
  let tmpRoot: string;
  let generatedDir: string;

  beforeAll(async () => {
    tmpRoot = await mkdtemp(path.join(tmpdir(), 'archkit-e2e-'));
    generatedDir = path.join(tmpRoot, 'fixture-lib');

    await runCreate(
      {
        projectName: 'fixture-lib',
        packageName: 'fixture-lib',
        outDir: tmpRoot,
        dryRun: false,
        install: false,
      },
      {
        fs: new NodeFileSystemAdapter(),
        templateDir: TEMPLATE_DIR,
        log: () => {},
      },
    );
  }, 60_000);

  afterAll(async () => {
    await rm(tmpRoot, { recursive: true, force: true });
  });

  it('creates the expected files', async () => {
    const pkgRaw = await readFile(path.join(generatedDir, 'package.json'), 'utf8');
    const pkg = JSON.parse(pkgRaw) as { name: string; type?: string };
    expect(pkg.name).toBe('fixture-lib');
    expect(pkg.type).toBe('module');

    await readFile(path.join(generatedDir, 'tsconfig.json'), 'utf8');
    await readFile(path.join(generatedDir, 'src', 'index.ts'), 'utf8');
    await readFile(path.join(generatedDir, 'tests', 'create-user.test.ts'), 'utf8');
  });

  it('renders {{packageName}} in package.json (no leftover placeholders)', async () => {
    const pkgRaw = await readFile(path.join(generatedDir, 'package.json'), 'utf8');
    expect(pkgRaw).not.toMatch(/\{\{[^}]+\}\}/);
  });

  it('runs pnpm install + pnpm test successfully', async () => {
    const installResult = await execa('pnpm', ['install'], {
      cwd: generatedDir,
      timeout: 90_000,
      reject: false,
    });
    expect(installResult.exitCode).toBe(0);

    const testResult = await execa('pnpm', ['test'], {
      cwd: generatedDir,
      timeout: 60_000,
      reject: false,
    });
    expect(testResult.exitCode).toBe(0);
    const output = testResult.stdout + testResult.stderr;
    expect(output).toMatch(/create-user\.test\.ts/);
    expect(output).toMatch(/5 passed/);
  }, 180_000);
});
