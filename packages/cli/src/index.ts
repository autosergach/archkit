#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { UserInputError } from 'archkit-core';

import { NodeFileSystemAdapter } from './adapters/node-file-system.js';
import { parseArgs } from './args.js';
import { collectAnswers } from './prompts.js';
import { runCreate } from './run-create.js';

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv);

  if (parsed.command !== 'create') {
    process.exit(0);
  }

  const answers = await collectAnswers({
    projectName: parsed.projectName,
    packageName: parsed.flags.packageName,
    install: parsed.flags.install,
  });

  const outDir = path.resolve(parsed.flags.out ?? '.');
  const templateDir = resolveBundledTemplateDir('library-clean');

  await runCreate(
    {
      projectName: answers.projectName,
      packageName: answers.packageName,
      outDir,
      dryRun: parsed.flags.dryRun === true,
      install: answers.install,
    },
    {
      fs: new NodeFileSystemAdapter(),
      templateDir,
      log: (msg) => console.log(msg),
    },
  );
}

function resolveBundledTemplateDir(name: string): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '..', 'templates', name);
}

main().catch((err: unknown) => {
  if (err instanceof UserInputError) {
    console.error(`Input error: ${err.message}`);
    process.exit(1);
  }
  if (err instanceof Error) {
    console.error(err.message);
    process.exit(1);
  }
  console.error('Unknown error');
  process.exit(1);
});
