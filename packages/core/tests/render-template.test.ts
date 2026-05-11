import { describe, expect, it } from 'vitest';

import { renderTemplate } from '../src/index.js';

describe('renderTemplate', () => {
  it('substitutes known variables', () => {
    const out = renderTemplate('Hello {{name}}!', { name: 'World' });
    expect(out).toBe('Hello World!');
  });

  it('substitutes multiple occurrences', () => {
    const out = renderTemplate('{{a}} + {{a}} = {{b}}', { a: '1', b: '2' });
    expect(out).toBe('1 + 1 = 2');
  });

  it('leaves unknown variables as-is', () => {
    const out = renderTemplate('Hello {{name}} {{unknown}}', { name: 'World' });
    expect(out).toBe('Hello World {{unknown}}');
  });

  it('ignores empty {{}}', () => {
    const out = renderTemplate('a {{}} b', { foo: 'bar' });
    expect(out).toBe('a {{}} b');
  });

  it('handles whitespace inside {{ name }} as the same key', () => {
    const out = renderTemplate('{{ name }}', { name: 'X' });
    expect(out).toBe('X');
  });

  it('returns input unchanged when no variables present', () => {
    const out = renderTemplate('plain text', { name: 'X' });
    expect(out).toBe('plain text');
  });

  it('works with multi-line content', () => {
    const content = '# {{title}}\n\nBy {{author}}\n';
    const out = renderTemplate(content, { title: 'archkit', author: 'Alex' });
    expect(out).toBe('# archkit\n\nBy Alex\n');
  });

  it('treats keys case-sensitively', () => {
    const out = renderTemplate('{{Name}} {{name}}', { name: 'low' });
    expect(out).toBe('{{Name}} low');
  });
});
