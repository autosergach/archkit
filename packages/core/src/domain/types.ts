export type PlanAction =
  | { type: 'mkdir'; path: string; description: string }
  | { type: 'writeFile'; path: string; content: string; description: string }
  | { type: 'copyFile'; from: string; to: string; description: string };

export type ProjectPlan = {
  actions: PlanAction[];
  summary: string;
};

export type TemplateVariables = Record<string, string>;

export type GeneratorOptions = {
  projectName: string;
  packageName: string;
  template: string;
  outDir: string;
  dryRun?: boolean;
};
