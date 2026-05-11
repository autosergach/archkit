import { confirm, input } from '@inquirer/prompts';

import { UserInputError } from 'archkit-core';

const PROJECT_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const PACKAGE_NAME_PATTERN = /^(@[a-z0-9-_]+\/)?[a-z0-9][a-z0-9._-]*$/;

export type CollectedAnswers = {
  projectName: string;
  packageName: string;
  install: boolean;
};

export type PromptDefaults = {
  projectName: string | undefined;
  packageName: string | undefined;
  install: boolean | undefined;
};

export function normalizePackageName(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-');
}

export async function collectAnswers(defaults: PromptDefaults): Promise<CollectedAnswers> {
  const projectName = await input({
    message: 'Project name:',
    ...(defaults.projectName !== undefined ? { default: defaults.projectName } : {}),
    required: true,
    validate: (value: string) => {
      if (!PROJECT_NAME_PATTERN.test(value)) {
        return 'Use letters, digits, dot, underscore, dash (must start with letter/digit).';
      }
      return true;
    },
  });

  const packageDefault = defaults.packageName ?? normalizePackageName(projectName);
  const packageName = await input({
    message: 'npm package name:',
    default: packageDefault,
    required: true,
    validate: (value: string) => {
      if (!PACKAGE_NAME_PATTERN.test(value)) {
        return 'Invalid npm name. Use lowercase letters, digits, dots, dashes; optional @scope/.';
      }
      return true;
    },
  });

  const install =
    defaults.install ??
    (await confirm({
      message: 'Run pnpm install after generation?',
      default: true,
    }));

  return { projectName, packageName, install };
}

export function assertValidPackageName(name: string): void {
  if (!PACKAGE_NAME_PATTERN.test(name)) {
    throw new UserInputError(`Invalid package name: ${name}`);
  }
}
