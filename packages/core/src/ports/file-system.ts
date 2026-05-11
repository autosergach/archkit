export type FileSystemStat = {
  isFile: boolean;
  isDirectory: boolean;
};

export type MkdirOptions = {
  recursive?: boolean;
};

export interface FileSystemPort {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, options?: MkdirOptions): Promise<void>;
  copyFile(from: string, to: string): Promise<void>;
  list(path: string): Promise<string[]>;
  stat(path: string): Promise<FileSystemStat>;
}
