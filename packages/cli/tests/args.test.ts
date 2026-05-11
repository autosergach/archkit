import { describe, expect, it } from 'vitest';

import { parseArgs } from '../src/args.js';

describe('parseArgs', () => {
  it('parses create command with project name', () => {
    const result = parseArgs(['node', 'archkit', 'create', 'my-lib']);
    expect(result.command).toBe('create');
    expect(result.projectName).toBe('my-lib');
    expect(result.flags.dryRun).toBeFalsy();
    expect(result.flags.install).toBeUndefined();
  });

  it('parses --out flag', () => {
    const result = parseArgs(['node', 'archkit', 'create', 'lib', '--out', '/tmp/proj']);
    expect(result.flags.out).toBe('/tmp/proj');
  });

  it('parses --package-name flag', () => {
    const result = parseArgs(['node', 'archkit', 'create', 'lib', '--package-name', '@scope/lib']);
    expect(result.flags.packageName).toBe('@scope/lib');
  });

  it('parses --dry-run flag', () => {
    const result = parseArgs(['node', 'archkit', 'create', 'lib', '--dry-run']);
    expect(result.flags.dryRun).toBe(true);
  });

  it('parses --skip-install flag as install: false', () => {
    const result = parseArgs(['node', 'archkit', 'create', 'lib', '--skip-install']);
    expect(result.flags.install).toBe(false);
  });

  it('returns help command when --help is passed', () => {
    const result = parseArgs(['node', 'archkit', '--help']);
    expect(result.command).toBe('help');
  });

  it('returns help command when no command provided', () => {
    const result = parseArgs(['node', 'archkit']);
    expect(result.command).toBe('help');
  });
});
