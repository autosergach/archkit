import { promises as fsPromises } from 'node:fs';
import path from 'node:path';

import { FsError } from 'archkit-core';
import type { FileSystemPort, FileSystemStat, MkdirOptions } from 'archkit-core';

export class NodeFileSystemAdapter implements FileSystemPort {
  async readFile(filePath: string): Promise<string> {
    try {
      return await fsPromises.readFile(filePath, 'utf8');
    } catch (err) {
      throw wrapFsError(`Failed to read file: ${filePath}`, err);
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
      await fsPromises.writeFile(filePath, content, 'utf8');
    } catch (err) {
      throw wrapFsError(`Failed to write file: ${filePath}`, err);
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fsPromises.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async mkdir(dirPath: string, options?: MkdirOptions): Promise<void> {
    try {
      await fsPromises.mkdir(dirPath, { recursive: options?.recursive ?? false });
    } catch (err) {
      throw wrapFsError(`Failed to create directory: ${dirPath}`, err);
    }
  }

  async copyFile(from: string, to: string): Promise<void> {
    try {
      await fsPromises.mkdir(path.dirname(to), { recursive: true });
      await fsPromises.copyFile(from, to);
    } catch (err) {
      throw wrapFsError(`Failed to copy file: ${from} -> ${to}`, err);
    }
  }

  async list(dirPath: string): Promise<string[]> {
    try {
      return await fsPromises.readdir(dirPath);
    } catch (err) {
      throw wrapFsError(`Failed to list directory: ${dirPath}`, err);
    }
  }

  async stat(targetPath: string): Promise<FileSystemStat> {
    try {
      const s = await fsPromises.stat(targetPath);
      return { isFile: s.isFile(), isDirectory: s.isDirectory() };
    } catch (err) {
      throw wrapFsError(`Failed to stat path: ${targetPath}`, err);
    }
  }
}

function wrapFsError(message: string, cause: unknown): FsError {
  const detail = cause instanceof Error ? `: ${cause.message}` : '';
  return new FsError(message + detail);
}
