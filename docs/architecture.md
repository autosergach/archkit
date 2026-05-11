# archkit Architecture

## Overview

archkit is a TypeScript monorepo with two packages:

- **`archkit-core`** (private) — domain logic. Pure TS, no Node-specific APIs except `node:path` for path normalization. Side effects abstracted behind `FileSystemPort`.
- **`archkit`** (public, published to npm) — CLI binary. Provides `NodeFileSystem` adapter, arg parsing via `cac`, interactive prompts via `@inquirer/prompts`, and the `runCreate` use case.

## Build

`tsup` bundles `archkit-core` into `archkit/dist/index.js` via `noExternal: ['archkit-core']`. Final npm package ships a single self-contained JS file plus types.

## Templates

Lives in `templates/<template-name>/`. Files with `.tmpl` suffix are rendered with `{{var}}` substitution. Files without `.tmpl` are copied as-is.

For v0.1.0: only `library-clean` template (TypeScript library with Clean Architecture + example `createUser` use case).

## Testing

- **Unit:** in `packages/*/tests/`, run with `pnpm test`. Core uses `InMemoryFileSystem` — no real disk I/O, completes in <1s.
- **E2E:** in `tests/e2e/`, run with `pnpm test:e2e`. Generates a real project in `os.tmpdir()`, runs `pnpm install && pnpm test` on it.

CI runs unit and e2e as separate parallel jobs.

## ADRs

See [`adr/`](adr/) for architectural decision records (added as decisions are made).
