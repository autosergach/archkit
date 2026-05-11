import path from 'node:path';

import { FsError } from '../domain/errors.js';
import type { FileSystemPort, FileSystemStat, MkdirOptions } from '../ports/file-system.js';

type Entry = { type: 'file'; content: string } | { type: 'dir' };

export class InMemoryFileSystemAdapter implements FileSystemPort {
  private entries = new Map<string, Entry>();

  constructor() {
    this.entries.set('/', { type: 'dir' });
  }

  async readFile(filePath: string): Promise<string> {
    const normalized = this.normalizePath(filePath);
    const entry = this.entries.get(normalized);
    if (!entry || entry.type !== 'file') {
      throw new FsError(`File not found: ${filePath}`);
    }
    return entry.content;
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const normalized = this.normalizePath(filePath);
    const parent = path.posix.dirname(normalized);
    this.ensureDirExists(parent);
    this.entries.set(normalized, { type: 'file', content });
  }

  async exists(filePath: string): Promise<boolean> {
    return this.entries.has(this.normalizePath(filePath));
  }

  async mkdir(dirPath: string, options?: MkdirOptions): Promise<void> {
    const normalized = this.normalizePath(dirPath);
    if (this.entries.has(normalized)) {
      const existing = this.entries.get(normalized);
      if (existing?.type !== 'dir') {
        throw new FsError(`Path exists and is not a directory: ${dirPath}`);
      }
      return;
    }
    const parent = path.posix.dirname(normalized);
    if (parent !== normalized && !this.entries.has(parent)) {
      if (options?.recursive) {
        await this.mkdir(parent, options);
      } else {
        throw new FsError(`Parent directory does not exist: ${parent}`);
      }
    }
    this.entries.set(normalized, { type: 'dir' });
  }

  async copyFile(from: string, to: string): Promise<void> {
    const source = this.normalizePath(from);
    const entry = this.entries.get(source);
    if (!entry || entry.type !== 'file') {
      throw new FsError(`Source file not found: ${from}`);
    }
    await this.writeFile(to, entry.content);
  }

  async list(dirPath: string): Promise<string[]> {
    const normalized = this.normalizePath(dirPath);
    const entry = this.entries.get(normalized);
    if (!entry || entry.type !== 'dir') {
      throw new FsError(`Directory not found: ${dirPath}`);
    }
    const results = new Set<string>();
    for (const key of this.entries.keys()) {
      if (key === normalized) continue;
      const parent = path.posix.dirname(key);
      if (parent === normalized) {
        results.add(path.posix.basename(key));
      }
    }
    return Array.from(results);
  }

  async stat(targetPath: string): Promise<FileSystemStat> {
    const normalized = this.normalizePath(targetPath);
    const entry = this.entries.get(normalized);
    if (!entry) {
      throw new FsError(`Path not found: ${targetPath}`);
    }
    return {
      isFile: entry.type === 'file',
      isDirectory: entry.type === 'dir',
    };
  }

  private ensureDirExists(dirPath: string): void {
    const entry = this.entries.get(dirPath);
    if (!entry || entry.type !== 'dir') {
      throw new FsError(`Directory not found: ${dirPath}`);
    }
  }

  private normalizePath(input: string): string {
    if (!input) return '/';
    const normalized = path.posix.normalize(input);
    const withLeading = normalized.startsWith('/') ? normalized : `/${normalized}`;
    if (withLeading.length > 1 && withLeading.endsWith('/')) {
      return withLeading.slice(0, -1);
    }
    return withLeading;
  }
}
