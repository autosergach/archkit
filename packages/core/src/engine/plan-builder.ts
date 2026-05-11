import path from 'node:path';

import { ValidationError } from '../domain/errors.js';
import type { GeneratorOptions, PlanAction, ProjectPlan } from '../domain/types.js';
import type { FileSystemPort } from '../ports/file-system.js';

type InitPlanInput = {
  options: GeneratorOptions;
  templateDir: string;
  fs: FileSystemPort;
};

type TemplateEntry = {
  kind: 'file' | 'dir';
  absolutePath: string;
  relativePath: string;
};

export async function buildInitPlan({
  options,
  templateDir,
  fs,
}: InitPlanInput): Promise<ProjectPlan> {
  validateInitOptions(options, templateDir);

  const normalizedTemplateDir = normalizeToPosix(templateDir);
  if (!(await fs.exists(normalizedTemplateDir))) {
    throw new ValidationError(`Template directory not found: ${templateDir}`);
  }
  const templateStat = await fs.stat(normalizedTemplateDir);
  if (!templateStat.isDirectory) {
    throw new ValidationError(`Template path is not a directory: ${templateDir}`);
  }

  const projectRoot = joinPath(options.outDir, options.projectName);
  const templateEntries = await collectTemplateEntries(fs, normalizedTemplateDir, '');

  const actions: PlanAction[] = [
    {
      type: 'mkdir',
      path: projectRoot,
      description: `Create project directory ${projectRoot}`,
    },
  ];

  for (const entry of templateEntries) {
    const targetPath = joinPath(projectRoot, entry.relativePath);
    if (entry.kind === 'dir') {
      actions.push({
        type: 'mkdir',
        path: targetPath,
        description: `Create directory ${entry.relativePath}`,
      });
      continue;
    }
    actions.push({
      type: 'copyFile',
      from: entry.absolutePath,
      to: targetPath,
      description: `Copy template file ${entry.relativePath}`,
    });
  }

  return {
    actions,
    summary: `Init ${options.projectName} from template ${options.template}`,
  };
}

function validateInitOptions(options: GeneratorOptions, templateDir: string): void {
  if (!options.projectName.trim()) throw new ValidationError('projectName is required');
  if (!options.packageName.trim()) throw new ValidationError('packageName is required');
  if (!options.template.trim()) throw new ValidationError('template is required');
  if (!options.outDir.trim()) throw new ValidationError('outDir is required');
  if (!templateDir.trim()) throw new ValidationError('templateDir is required');
}

async function collectTemplateEntries(
  fs: FileSystemPort,
  currentDir: string,
  relativeDir: string,
): Promise<TemplateEntry[]> {
  const names = (await fs.list(currentDir)).sort();
  const entries: TemplateEntry[] = [];
  for (const name of names) {
    const absolutePath = joinPath(currentDir, name);
    const relativePath = relativeDir ? joinPath(relativeDir, name) : name;
    const stat = await fs.stat(absolutePath);
    if (stat.isDirectory) {
      entries.push({ kind: 'dir', absolutePath, relativePath });
      entries.push(...(await collectTemplateEntries(fs, absolutePath, relativePath)));
      continue;
    }
    if (stat.isFile) {
      entries.push({ kind: 'file', absolutePath, relativePath });
    }
  }
  return entries;
}

function normalizeToPosix(value: string): string {
  return value.replace(/\\/g, '/');
}

function joinPath(...parts: string[]): string {
  return path.posix.join(...parts.map(normalizeToPosix));
}
