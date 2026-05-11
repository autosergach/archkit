import { ValidationError } from '../domain/errors.js';
import type { User } from '../domain/types.js';
import type { UserRepository } from '../ports/user-repository.js';

export type CreateUserInput = {
  name: string;
  email: string;
};

export type CreateUserDeps = {
  users: UserRepository;
};

export async function createUser(
  input: CreateUserInput,
  { users }: CreateUserDeps,
): Promise<User> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name) {
    throw new ValidationError('Name is required');
  }
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email');
  }

  const existing = await users.findByEmail(email);
  if (existing) {
    throw new ValidationError(`User with email ${email} already exists`);
  }

  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
  };
  await users.save(user);
  return user;
}
