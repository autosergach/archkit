import { describe, expect, it } from 'vitest';

import {
  DomainError,
  FsError,
  TemplateError,
  UserInputError,
  ValidationError,
} from '../src/index.js';

describe('domain errors', () => {
  it('all errors extend DomainError', () => {
    expect(new ValidationError('x')).toBeInstanceOf(DomainError);
    expect(new TemplateError('x')).toBeInstanceOf(DomainError);
    expect(new FsError('x')).toBeInstanceOf(DomainError);
    expect(new UserInputError('x')).toBeInstanceOf(DomainError);
  });

  it('DomainError is an Error', () => {
    expect(new ValidationError('x')).toBeInstanceOf(Error);
  });

  it('each error keeps its own constructor name', () => {
    expect(new ValidationError('m').name).toBe('ValidationError');
    expect(new TemplateError('m').name).toBe('TemplateError');
    expect(new FsError('m').name).toBe('FsError');
    expect(new UserInputError('m').name).toBe('UserInputError');
  });

  it('preserves message', () => {
    expect(new ValidationError('bad input').message).toBe('bad input');
  });
});
