import { describe, expect, it } from 'vitest';

import { InMemoryFileSystemAdapter, ValidationError, buildInitPlan } from '../src/index.js';

async function makeFsWithTemplate(): Promise<InMemoryFileSystemAdapter> {
  const fs = new InMemoryFileSystemAdapter();
  await fs.mkdir('/templates/lib', { recursive: true });
  await fs.writeFile('/templates/lib/package.json.tmpl', '{"name":"{{packageName}}"}');
  await fs.writeFile('/templates/lib/tsconfig.json', '{}');
  await fs.mkdir('/templates/lib/src', { recursive: true });
  await fs.writeFile('/templates/lib/src/index.ts', 'export {};');
  return fs;
}

describe('buildInitPlan', () => {
  it('builds plan with mkdir + copyFile actions for each template entry', async () => {
    const fs = await makeFsWithTemplate();
    const plan = await buildInitPlan({
      options: {
        projectName: 'my-lib',
        packageName: 'my-lib',
        template: 'lib',
        outDir: '/out',
      },
      templateDir: '/templates/lib',
      fs,
    });

    expect(plan.summary).toMatch(/my-lib/);
    expect(plan.actions[0]).toEqual({
      type: 'mkdir',
      path: '/out/my-lib',
      description: expect.any(String),
    });
    const types = plan.actions.map((a) => a.type);
    expect(types).toContain('mkdir');
    expect(types).toContain('copyFile');

    const copyFiles = plan.actions.filter((a) => a.type === 'copyFile') as Array<{
      type: 'copyFile';
      from: string;
      to: string;
    }>;
    expect(copyFiles.map((a) => a.to)).toEqual(
      expect.arrayContaining([
        '/out/my-lib/package.json.tmpl',
        '/out/my-lib/tsconfig.json',
        '/out/my-lib/src/index.ts',
      ]),
    );
  });

  it('throws ValidationError when template dir not found', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await expect(
      buildInitPlan({
        options: { projectName: 'x', packageName: 'x', template: 'lib', outDir: '/out' },
        templateDir: '/no-such-dir',
        fs,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws ValidationError when projectName is empty', async () => {
    const fs = await makeFsWithTemplate();
    await expect(
      buildInitPlan({
        options: { projectName: '', packageName: 'x', template: 'lib', outDir: '/out' },
        templateDir: '/templates/lib',
        fs,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws ValidationError when packageName is empty', async () => {
    const fs = await makeFsWithTemplate();
    await expect(
      buildInitPlan({
        options: { projectName: 'x', packageName: '', template: 'lib', outDir: '/out' },
        templateDir: '/templates/lib',
        fs,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
