![dotenv-validator — Nicholas Ashkar repository collection](assets/nicholas-ashkar/banner.png)

# dotenv-validator

Validate environment keys and annotated value constraints against .env.example.



<a id="usage"></a>

<a id="github-actions"></a>

## What it does

Supports @required, @type and @pattern metadata in the example, directory scans, strict extra-key handling and JSON output. --fix rewrites the environment file from the example while retaining existing matching values. See the pinned [implementation](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/index.js).


<a id="install"></a>

## Quickstart

Node requirement from the inspected manifest: **`>=20`**. Validation reads environment files locally. Review @type and @pattern annotations before relying on them.

The following example is **source-inspected, not executed**. It uses a pinned checkout; npm package publication is not assumed. Replace project paths or provide the stated input fixtures before running it.

```bash
git clone https://github.com/NickCirv/dotenv-validator.git
cd dotenv-validator
git checkout 07cb4cd6256f60196b0efa9706986e1b2fa84f13
npm install --ignore-scripts
node index.js --env ../your-project/.env --example ../your-project/.env.example --json
```

Dependencies are installed with lifecycle scripts disabled in this recipe. Read the package scripts before enabling any lifecycle step required by your environment.

## Usage and reference

`dotenv-validator` | `denv` are the executable names declared by the package. [Command reference](docs/REFERENCE.md) covers source-backed options and entry points.

| Control | Behavior in the inspected implementation |
| --- | --- |
| `--env PATH` | Choose the environment file |
| `--example PATH` | Read annotated requirements |
| `--strict` | Treat extra keys as errors |
| `--ci` | Use machine-oriented lines and fail warnings |
| `--fix` | Rewrite environment content from the example |

## Limits and operational notes

An unknown type is accepted by the inspected validator and a malformed pattern definition becomes a warning. --ci fails warnings as well as errors. --fix may drop keys absent from the example; save a copy before using it.

## Development

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

| Script | Declared command |
| --- | --- |
| `test` | `node --test` |

Work from the pinned source, keep changes focused, and reproduce the affected behavior with a small fixture before proposing a change. Existing contribution and security policies remain authoritative where present.

## Research and status

[Research record](docs/RESEARCH.md) identifies the inspected revision, source evidence, documentation disposition and verification gaps. Static inspection supports the descriptions here; runtime behavior, dependency installation and current hosted services remain unverified.

## License and author

[License](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/LICENSE)

[Nicholas Ashkar](https://nicholashkar.com) · Applied AI, systems and consulting.
