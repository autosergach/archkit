import { describe, expect, it } from 'vitest';

import {
  FsError,
  InMemoryFileSystemAdapter,
  executePlan,
  type PlanAction,
  type ProjectPlan,
} from '../src/index.js';

function plan(actions: PlanAction[]): ProjectPlan {
  return { actions, summary: 'test' };
}

describe('executePlan', () => {
  it('applies mkdir + writeFile actions', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await executePlan(
      plan([
        { type: 'mkdir', path: '/out', description: 'd' },
        { type: 'mkdir', path: '/out/src', description: 'd' },
        { type: 'writeFile', path: '/out/src/index.ts', content: 'export {};', description: 'd' },
      ]),
      fs,
    );

    await expect(fs.readFile('/out/src/index.ts')).resolves.toBe('export {};');
  });

  it('applies copyFile actions', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await fs.mkdir('/src', { recursive: true });
    await fs.writeFile('/src/a.txt', 'payload');

    await executePlan(
      plan([
        { type: 'mkdir', path: '/dst', description: 'd' },
        { type: 'copyFile', from: '/src/a.txt', to: '/dst/a.txt', description: 'd' },
      ]),
      fs,
    );

    await expect(fs.readFile('/dst/a.txt')).resolves.toBe('payload');
  });

  it('mkdir is idempotent (no error if directory already exists)', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await executePlan(
      plan([
        { type: 'mkdir', path: '/out', description: 'd' },
        { type: 'mkdir', path: '/out', description: 'd' },
      ]),
      fs,
    );
    await expect(fs.stat('/out')).resolves.toEqual({ isFile: false, isDirectory: true });
  });

  it('uses recursive mkdir for nested paths', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await executePlan(plan([{ type: 'mkdir', path: '/a/b/c', description: 'd' }]), fs);
    await expect(fs.stat('/a/b/c')).resolves.toEqual({ isFile: false, isDirectory: true });
  });

  it('propagates FsError when copy source missing', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await expect(
      executePlan(
        plan([
          { type: 'mkdir', path: '/dst', description: 'd' },
          { type: 'copyFile', from: '/no-such', to: '/dst/x', description: 'd' },
        ]),
        fs,
      ),
    ).rejects.toBeInstanceOf(FsError);
  });
});
