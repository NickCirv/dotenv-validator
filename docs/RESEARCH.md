# dotenv-validator — research record

## Revision and scope

- Repository: [NickCirv/dotenv-validator](https://github.com/NickCirv/dotenv-validator)
- Commit: `07cb4cd6256f60196b0efa9706986e1b2fa84f13`
- Tree: `e2b389542bb05c31ba51f4269536df4362e218ac`
- Captured: 7 of 7 eligible text files (all eligible text files).
- Recursive tree truncated: `False`.
- Runtime verification: **unverified**; no repository code, installation or test command was executed.

The captured file inventory is broader than the semantic review. Authoring inspected package metadata, entrypoint/argument handling and implementation paths relevant to the claims below, plus test declarations. This is documentation research, not a line-by-line security audit. Generated/binary artifacts, lockfiles and file types outside the acquisition filter were not inspected.

## Claim and evidence

| Claim | Pinned evidence | Status |
| --- | --- | --- |
| Runtime requirement and executable mapping | [package.json](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/package.json) | verified in manifest; installation unverified |
| Validate environment keys and annotated value constraints against .env.example. | [implementation](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/index.js) | partially verified by static implementation review |
| Operational limits and side effects | [implementation](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/index.js) and source map in [reference](REFERENCE.md) | partially verified; runtime unverified |
| Test command definition | [package.json](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/package.json) | verified as a declaration only |

## Findings carried into the rewrite

An unknown type is accepted by the inspected validator and a malformed pattern definition becomes a warning. --ci fails warnings as well as errors. --fix may drop keys absent from the example; save a copy before using it.

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

## Documentation inventory and disposition

| Existing document | Disposition |
| --- | --- |
| [README.md](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/README.md) | Rewritten overview; historical copy remains at this pinned URL. |

New supporting documents: `docs/REFERENCE.md` and `docs/RESEARCH.md`. No original source or protected legal/security file was changed.

## Protected-file evidence

- `LICENSE` SHA-256 `68729cab364d82364078b08d8580ccfa51dc69c81a7d64e8d8d47a1da6c9349d`.

## Remaining verification

Clean installation, useful-command execution, malformed input, side-effect boundaries, platform compatibility and end-to-end tests remain unverified. Package-registry availability and live API destinations were not checked. No performance, customer-adoption, compliance or production-readiness claim is made.

## Captured evidence index

- [LICENSE](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/LICENSE) · blob `05b804beeec7d1a6c933d087387ba4adf6463d93`.
- [README.md](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/README.md) · blob `e95a13d55291ee33c443b21c7e92411665511a99`.
- [package.json](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/package.json) · blob `5b318f331609d277c4d6f017c0c10a54c7602ba7`.
- [.env.example](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/.env.example) · blob `55d093b8dc3e21375e605fbd9043eae3d68db517`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/.github/workflows/ci.yml) · blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [index.js](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/index.js) · blob `b2f3e2dff9f544f602a541c5990cebec180d2bb6`.
- [test/smoke.test.js](https://github.com/NickCirv/dotenv-validator/blob/07cb4cd6256f60196b0efa9706986e1b2fa84f13/test/smoke.test.js) · blob `ebbccaaf2583b4850575f835313e4b0afd21bff7`.

## Tree files outside the captured text set

These paths were mapped but their contents were not acquired in this research pass:

- `.gitignore`
- `banner.svg`
