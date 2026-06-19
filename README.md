<div align="center">

# dotenv-validator

**Catch missing, extra, empty, and type-invalid env vars before they break production.**

[![License: MIT](https://img.shields.io/badge/license-MIT-0B0A09?style=flat-square)](LICENSE)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-0B0A09?style=flat-square)
![Node >=18](https://img.shields.io/badge/node-%3E%3D18-0B0A09?style=flat-square&logo=node.js&logoColor=white)

</div>

## Install

```bash
npx github:NickCirv/dotenv-validator
```

## Usage

```bash
# Validate .env against .env.example in the current directory
npx github:NickCirv/dotenv-validator

# Strict mode — extra keys become errors; CI-friendly exit code
npx github:NickCirv/dotenv-validator --strict --ci

# Custom file paths
npx github:NickCirv/dotenv-validator --env .env.local --example .env.example

# Validate all .env* files in a directory
npx github:NickCirv/dotenv-validator --dir ./apps

# Generate a .env scaffold from your .env.example
npx github:NickCirv/dotenv-validator --fix
```

| Flag | Description |
|---|---|
| `--env <file>` | Path to `.env` (default: `.env`) |
| `--example <file>` | Path to `.env.example` (default: `.env.example`) |
| `--dir <path>` | Validate all `.env*` files in a directory |
| `--strict` | Treat extra keys as errors instead of warnings |
| `--no-empty-check` | Allow empty values |
| `--ci` | Pipe-delimited output; exit 1 on any warning or error |
| `--json` | JSON output |
| `--fix` | Scaffold a `.env` from `.env.example` with safe placeholders |

## What it does

Compares your `.env` file against `.env.example` and reports missing keys, undocumented extras, empty values, and type/pattern violations. Annotations in `.env.example` (`@required`, `@type url|email|uuid|number|bool|json`, `@pattern`) enable richer checks. Output never includes actual env var values — only key names — so it is safe to run in CI logs.

```
Validating: /your/project/.env

  ✗ Missing required key: DATABASE_URL
  ! Extra key not in example: MY_EXTRA_VAR
  ! Empty value for key: ADMIN_EMAIL
  ✓ OK: API_URL

Summary: 1 error, 2 warnings, 1 ok
```

### GitHub Actions

```yaml
- name: Validate .env
  run: npx github:NickCirv/dotenv-validator --ci --strict
```

---

<sub>Zero dependencies · Node >=18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
