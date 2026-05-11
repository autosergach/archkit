# archkit

> Clean Architecture project generator for TypeScript. Scaffold libraries (v0.1) and full-stack apps (v0.2+) with sensible defaults, working tests, and AI-friendly structure.

[![npm](https://img.shields.io/npm/v/archkit.svg)](https://www.npmjs.com/package/archkit)
[![CI](https://github.com/autosergach/archkit/actions/workflows/ci.yml/badge.svg)](https://github.com/autosergach/archkit/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/archkit.svg)](LICENSE)

## Quick start

```bash
npx archkit create my-lib
cd my-lib
pnpm install
pnpm test
```

You get a TypeScript library with:

- ES2022, NodeNext modules, strict TypeScript
- `vitest` for tests
- `eslint` flat config with `typescript-eslint`
- Clean Architecture skeleton: `domain/`, `application/`, `ports/`
- A working example use case (`createUser`) with passing tests

## Commands

```bash
archkit create [project-name]      # scaffold a new project
archkit create my-lib --dry-run    # preview without writing files
archkit create my-lib --out ./libs # custom output directory
archkit --help
archkit --version
```

### Options

| Flag                    | Default                     | Description                                 |
| ----------------------- | --------------------------- | ------------------------------------------- |
| `--out <dir>`           | `.`                         | Where to create the project directory       |
| `--package-name <name>` | (project name, kebab-cased) | npm `name` field                            |
| `--skip-install`        | —                           | Skip the "run pnpm install?" prompt         |
| `--dry-run`             | —                           | Print planned actions without writing files |

## Templates

### `library-clean` (default in v0.1)

TypeScript library with Clean Architecture layout:

```
my-lib/
├── src/
│   ├── domain/        # entities, value objects, errors
│   ├── application/   # use cases (depend on ports)
│   ├── ports/         # interfaces for external dependencies
│   └── index.ts       # public API barrel
├── tests/             # vitest unit tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── eslint.config.js
```

## Roadmap

- ✅ v0.1.0 — `library-clean` template, `archkit create` command, `--dry-run`
- 🚧 v0.2.0 — NestJS+React fullstack template, `--ai-ready` flag (autogen `CLAUDE.md`, `.claude/settings.json`, `agents.md`)
- 🚧 v0.3.0 — Plugin system for custom templates

## Contributing

See [`docs/architecture.md`](docs/architecture.md) for how the codebase is organized.

```bash
git clone https://github.com/autosergach/archkit.git
cd archkit
pnpm install
pnpm -r build
pnpm -r test
pnpm test:e2e
```

## License

MIT © [Alex Rogov](https://github.com/autosergach)
