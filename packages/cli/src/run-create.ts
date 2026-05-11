import {
  buildInitPlan,
  executePlan,
  renderTemplate,
  type FileSystemPort,
  type PlanAction,
  type ProjectPlan,
} from 'archkit-core';

export type RunCreateOptions = {
  projectName: string;
  packageName: string;
  outDir: string;
  dryRun: boolean;
  install: boolean;
};

export type RunCreateDeps = {
  fs: FileSystemPort;
  templateDir: string;
  log: (message: string) => void;
};

export type RunCreateResult = {
  applied: boolean;
  projectRoot: string;
  actionCount: number;
};

const TMPL_SUFFIX = '.tmpl';

export async function runCreate(
  options: RunCreateOptions,
  deps: RunCreateDeps,
): Promise<RunCreateResult> {
  const { fs, templateDir, log } = deps;
  const projectRoot = `${stripTrailingSlash(options.outDir)}/${options.projectName}`;

  const rawPlan = await buildInitPlan({
    options: {
      projectName: options.projectName,
      packageName: options.packageName,
      template: 'library-clean',
      outDir: options.outDir,
    },
    templateDir,
    fs,
  });

  const renderedPlan = await renderTemplateActions(rawPlan, fs, {
    projectName: options.projectName,
    packageName: options.packageName,
    year: String(new Date().getFullYear()),
  });

  if (options.dryRun) {
    log(`Dry run — ${renderedPlan.actions.length} actions planned:`);
    for (const action of renderedPlan.actions) {
      log(`  - ${action.description}`);
    }
    return { applied: false, projectRoot, actionCount: renderedPlan.actions.length };
  }

  await executePlan(renderedPlan, fs);
  log(`✓ Created ${options.projectName} at ${projectRoot}`);
  log('');
  log('Next steps:');
  log(`  cd ${projectRoot}`);
  if (options.install) {
    log('  pnpm install');
  }
  log('  pnpm test');

  return { applied: true, projectRoot, actionCount: renderedPlan.actions.length };
}

async function renderTemplateActions(
  plan: ProjectPlan,
  fs: FileSystemPort,
  vars: Record<string, string>,
): Promise<ProjectPlan> {
  const actions: PlanAction[] = [];
  for (const action of plan.actions) {
    if (action.type === 'copyFile' && action.from.endsWith(TMPL_SUFFIX)) {
      const content = await fs.readFile(action.from);
      const rendered = renderTemplate(content, vars);
      const targetPath = action.to.slice(0, -TMPL_SUFFIX.length);
      actions.push({
        type: 'writeFile',
        path: targetPath,
        content: rendered,
        description: `Render template ${action.from} → ${targetPath}`,
      });
      continue;
    }
    actions.push(action);
  }
  return { ...plan, actions };
}

function stripTrailingSlash(value: string): string {
  return value.endsWith('/') && value.length > 1 ? value.slice(0, -1) : value;
}
