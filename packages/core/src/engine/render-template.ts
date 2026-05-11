import type { TemplateVariables } from '../domain/types.js';

const VAR_PATTERN = /\{\{\s*([a-zA-Z_$][\w$]*)\s*\}\}/g;

export function renderTemplate(content: string, variables: TemplateVariables): string {
  return content.replace(VAR_PATTERN, (match, key: string) => {
    if (key in variables) {
      return variables[key] ?? match;
    }
    return match;
  });
}
