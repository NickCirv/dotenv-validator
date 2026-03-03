# dotenv-validator

Validate `.env` files against `.env.example`. Find missing, extra, empty, and invalid environment variables.

**Zero dependencies** — built-in Node.js modules only.

```
dotenv-validator --strict --ci
```

```
Validating: /your/project/.env

  ✗ Missing required key: DATABASE_URL
  ! Extra key not in example: MY_EXTRA_VAR
  ! Empty value for key: ADMIN_EMAIL
  ✓ OK: API_URL
  ✓ OK: PORT

Summary: 1 error, 2 warnings, 1 ok
```

---

## Install

```bash
# Run without installing (npx)
npx dotenv-validator

# Install globally
npm install -g dotenv-validator

# Or as a dev dependency
npm install --save-dev dotenv-validator
```

---

## Usage

```bash
# Validate .env against .env.example in current directory
dotenv-validator

# Also available as short alias
denv

# Custom file paths
dotenv-validator --env .env.local --example .env.example

# Validate all .env* files in a directory
dotenv-validator --dir ./apps

# Strict mode (extra keys are errors, not warnings)
dotenv-validator --strict

# Allow empty values (skip empty check)
dotenv-validator --no-empty-check

# CI mode (machine-readable pipe-delimited output, exit 1 on any warn/error)
dotenv-validator --ci

# JSON output
dotenv-validator --json

# Generate .env from .env.example with safe placeholder values
dotenv-validator --fix
```

---

## Checks Performed

| Check | Description | Default Level |
|---|---|---|
| **Missing** | Key in `.env.example` but not in `.env` | Warning (Error if `@required`) |
| **Extra** | Key in `.env` but not in `.env.example` | Warning (Error if `--strict`) |
| **Empty** | Key defined but has empty value | Warning (Error if `@required`) |
| **Type** | Value doesn't match declared `@type` | Error |
| **Pattern** | Value doesn't match declared `@pattern` regex | Error |

---

## Annotation Format

Add comment annotations **directly before** a key in `.env.example` to enable richer validation:

```bash
# @required
# @type url
# @description API base URL
API_URL=

# @required
# @type email
# @description Admin contact email
ADMIN_EMAIL=

# @type number
PORT=3000

# @type bool
DEBUG=false

# @type uuid
APP_ID=

# @type json
APP_CONFIG=

# @pattern ^[A-Z]{2,5}$
# @description ISO country code
COUNTRY_CODE=

# Optional — no annotations needed
OPTIONAL_FLAG=
```

### Supported Types

| Type | Validates |
|---|---|
| `url` | Starts with `http://` or `https://` |
| `email` | Basic email format (`user@domain.tld`) |
| `uuid` | UUID v4 format |
| `number` | Parseable as a number |
| `bool` | `true`, `false`, `1`, `0`, `yes`, `no` (case-insensitive) |
| `json` | Valid JSON string |

Multiple types are supported with `|`:

```bash
# @type number|bool
WORKERS=4
```

---

## CI Integration

### GitHub Actions

```yaml
- name: Validate .env
  run: npx dotenv-validator --ci --strict
```

### Exit Codes

| Code | Meaning |
|---|---|
| `0` | All checks passed |
| `1` | One or more errors (or warnings in `--ci` mode) |

---

## JSON Output

```bash
dotenv-validator --json
```

```json
{
  "summary": {
    "errors": 1,
    "warnings": 2,
    "ok": 5
  },
  "results": [
    {
      "file": "/project/.env",
      "errors": [
        { "key": "DATABASE_URL", "code": "MISSING_REQUIRED", "message": "Missing required key: DATABASE_URL" }
      ],
      "warnings": [
        { "key": "EXTRA_VAR", "code": "EXTRA_KEY", "message": "Extra key not in example: EXTRA_VAR" }
      ],
      "ok": [
        { "key": "API_URL", "code": "OK", "message": "OK: API_URL" }
      ]
    }
  ]
}
```

---

## Fix Mode

Generate a `.env` file from your `.env.example` with safe placeholder values. Existing values are preserved.

```bash
dotenv-validator --fix
```

```bash
# .env (generated)
API_URL=https://example.com
ADMIN_EMAIL=user@example.com
APP_ID=00000000-0000-0000-0000-000000000000
PORT=0
DEBUG=false
```

**Note:** Replace placeholder values with real credentials before use. Never commit `.env` to version control.

---

## Privacy & Security

`dotenv-validator` **never outputs actual env var values** — only key names and validation results. Safe to use in CI logs.

---

## License

MIT
