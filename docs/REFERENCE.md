# dotenv-validator — command reference

[Overview](../README.md) · [Research record](RESEARCH.md)

Describes revision `07cb4cd6256f60196b0efa9706986e1b2fa84f13`. Commands are source-inspected; no execution results are asserted.

## Workflow

Supports @required, @type and @pattern metadata in the example, directory scans, strict extra-key handling and JSON output. --fix rewrites the environment file from the example while retaining existing matching values.

Validation reads environment files locally. Review @type and @pattern annotations before relying on them.

```bash
node index.js --env ../your-project/.env --example ../your-project/.env.example --json
```

## Commands and controls

| Control | Behavior in the inspected implementation |
| --- | --- |
| `--env PATH` | Choose the environment file |
| `--example PATH` | Read annotated requirements |
| `--strict` | Treat extra keys as errors |
| `--ci` | Use machine-oriented lines and fail warnings |
| `--fix` | Rewrite environment content from the example |

## Interpretation and side effects

An unknown type is accepted by the inspected validator and a malformed pattern definition becomes a warning. --ci fails warnings as well as errors. --fix may drop keys absent from the example; save a copy before using it.

## Implementation reference

- [package.json](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/package.json)
- [index.js](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/index.js)
- [test/smoke.test.js](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/test/smoke.test.js)
