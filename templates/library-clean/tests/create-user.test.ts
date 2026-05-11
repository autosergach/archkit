import { describe, expect, it } from 'vitest';

import { createUser } from '../src/application/create-user.js';
import { ValidationError } from '../src/domain/errors.js';
import type { User } from '../src/domain/types.js';
import type { UserRepository } from '../src/ports/user-repository.js';

class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.users.set(user.email, user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.get(email) ?? null;
  }
}

describe('createUser', () => {
  it('creates a user with valid input', async () => {
    const users = new InMemoryUserRepository();
    const user = await createUser({ name: 'Ada', email: 'ada@example.com' }, { users });

    expect(user.name).toBe('Ada');
    expect(user.email).toBe('ada@example.com');
    expect(user.id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('lowercases the email before saving', async () => {
    const users = new InMemoryUserRepository();
    const user = await createUser({ name: 'Ada', email: 'Ada@Example.COM' }, { users });
    expect(user.email).toBe('ada@example.com');
  });

  it('throws ValidationError on empty name', async () => {
    const users = new InMemoryUserRepository();
    await expect(
      createUser({ name: '  ', email: 'ada@example.com' }, { users }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws ValidationError on invalid email', async () => {
    const users = new InMemoryUserRepository();
    await expect(
      createUser({ name: 'Ada', email: 'not-an-email' }, { users }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws ValidationError when user already exists', async () => {
    const users = new InMemoryUserRepository();
    await createUser({ name: 'Ada', email: 'ada@example.com' }, { users });
    await expect(
      createUser({ name: 'Ada 2', email: 'ada@example.com' }, { users }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
