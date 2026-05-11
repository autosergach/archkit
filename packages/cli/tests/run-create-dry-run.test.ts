import { describe, expect, it, vi } from 'vitest';

import { InMemoryFileSystemAdapter } from 'archkit-core';

import { runCreate } from '../src/run-create.js';

async function makeFsWithTemplate(): Promise<InMemoryFileSystemAdapter> {
  const fs = new InMemoryFileSystemAdapter();
  await fs.mkdir('/templates/library-clean', { recursive: true });
  await fs.writeFile('/templates/library-clean/package.json.tmpl', '{"name":"{{packageName}}"}');
  await fs.writeFile('/templates/library-clean/tsconfig.json', '{}');
  return fs;
}

describe('runCreate dry-run', () => {
  it('does not write any files when dryRun: true', async () => {
    const fs = await makeFsWithTemplate();
    const writeSpy = vi.spyOn(fs, 'writeFile');
    const copySpy = vi.spyOn(fs, 'copyFile');
    const mkdirSpy = vi.spyOn(fs, 'mkdir');

    const result = await runCreate(
      {
        projectName: 'my-lib',
        packageName: 'my-lib',
        outDir: '/out',
        dryRun: true,
        install: false,
      },
      {
        fs,
        templateDir: '/templates/library-clean',
        log: () => {},
      },
    );

    expect(result.applied).toBe(false);
    expect(writeSpy).not.toHaveBeenCalled();
    expect(copySpy).not.toHaveBeenCalled();
    const writeMkdirCalls = mkdirSpy.mock.calls.filter(([p]) => String(p).startsWith('/out'));
    expect(writeMkdirCalls).toHaveLength(0);
  });

  it('writes files when dryRun: false', async () => {
    const fs = await makeFsWithTemplate();
    const result = await runCreate(
      {
        projectName: 'my-lib',
        packageName: 'my-lib',
        outDir: '/out',
        dryRun: false,
        install: false,
      },
      {
        fs,
        templateDir: '/templates/library-clean',
        log: () => {},
      },
    );

    expect(result.applied).toBe(true);
    await expect(fs.readFile('/out/my-lib/package.json')).resolves.toBe('{"name":"my-lib"}');
    await expect(fs.readFile('/out/my-lib/tsconfig.json')).resolves.toBe('{}');
  });
});
