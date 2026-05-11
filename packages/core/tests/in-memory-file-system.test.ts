import { describe, expect, it } from 'vitest';

import { FsError, InMemoryFileSystemAdapter } from '../src/index.js';

describe('InMemoryFileSystemAdapter', () => {
  it('writes and reads files', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await fs.mkdir('src', { recursive: true });
    await fs.writeFile('src/hello.txt', 'hello');
    await expect(fs.readFile('src/hello.txt')).resolves.toBe('hello');
  });

  it('lists direct children (files and directories)', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await fs.mkdir('/data', { recursive: true });
    await fs.writeFile('/data/a.txt', 'a');
    await fs.writeFile('/data/b.txt', 'b');
    await fs.mkdir('/data/nested', { recursive: true });

    const entries = (await fs.list('/data')).sort();
    expect(entries).toEqual(['a.txt', 'b.txt', 'nested']);
  });

  it('copies files', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await fs.mkdir('assets', { recursive: true });
    await fs.writeFile('assets/source.txt', 'payload');
    await fs.copyFile('assets/source.txt', 'assets/copy.txt');
    await expect(fs.readFile('assets/copy.txt')).resolves.toBe('payload');
  });

  it('returns stats for files and directories', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await fs.mkdir('configs', { recursive: true });
    await fs.writeFile('configs/app.json', '{"ok":true}');

    await expect(fs.stat('configs')).resolves.toEqual({ isFile: false, isDirectory: true });
    await expect(fs.stat('configs/app.json')).resolves.toEqual({
      isFile: true,
      isDirectory: false,
    });
  });

  it('throws FsError when reading missing files', async () => {
    const fs = new InMemoryFileSystemAdapter();
    await expect(fs.readFile('missing.txt')).rejects.toBeInstanceOf(FsError);
  });
});
