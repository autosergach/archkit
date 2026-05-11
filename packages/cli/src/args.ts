import { cac } from 'cac';

export type ParsedArgs = {
  command: 'create' | 'help';
  projectName: string | undefined;
  flags: {
    out: string | undefined;
    packageName: string | undefined;
    install: boolean | undefined;
    dryRun: boolean;
  };
};

export function parseArgs(argv: string[]): ParsedArgs {
  const cli = cac('archkit');

  let result: ParsedArgs = {
    command: 'help',
    projectName: undefined,
    flags: { out: undefined, packageName: undefined, install: undefined, dryRun: false },
  };

  cli
    .command('create [project-name]', 'Scaffold a new project from a template')
    .option('--out <dir>', 'Output directory', { default: '.' })
    .option('--package-name <name>', 'npm package name (default: project name)')
    .option('--skip-install', 'Skip pnpm install (will not prompt)')
    .option('--dry-run', 'Print plan without applying changes')
    .action((projectName: string | undefined, options: Record<string, unknown>) => {
      const install = options.skipInstall === true ? false : undefined;
      result = {
        command: 'create',
        projectName,
        flags: {
          out: typeof options.out === 'string' ? options.out : undefined,
          packageName: typeof options.packageName === 'string' ? options.packageName : undefined,
          install,
          dryRun: options.dryRun === true,
        },
      };
    });

  cli.help();
  cli.version('0.0.0');

  try {
    cli.parse(argv, { run: false });
  } catch {
    return {
      command: 'help',
      projectName: undefined,
      flags: { out: undefined, packageName: undefined, install: undefined, dryRun: false },
    };
  }

  if (!cli.matchedCommand) {
    return {
      command: 'help',
      projectName: undefined,
      flags: { out: undefined, packageName: undefined, install: undefined, dryRun: false },
    };
  }

  cli.runMatchedCommand();
  return result;
}
