import type { PlanAction, ProjectPlan } from '../domain/types.js';
import type { FileSystemPort } from '../ports/file-system.js';

export async function executePlan(plan: ProjectPlan, fs: FileSystemPort): Promise<void> {
  for (const action of plan.actions) {
    await applyAction(action, fs);
  }
}

async function applyAction(action: PlanAction, fs: FileSystemPort): Promise<void> {
  switch (action.type) {
    case 'mkdir':
      await fs.mkdir(action.path, { recursive: true });
      return;
    case 'writeFile':
      await fs.writeFile(action.path, action.content);
      return;
    case 'copyFile':
      await fs.copyFile(action.from, action.to);
      return;
  }
}
