# Contributing to OpenSEO

## Getting started

Follow the [development setup guide](docs/development/getting-started.md) to get a local environment running.

## What to contribute

- **Bug fixes** — always welcome. If there's no existing issue, open one briefly describing the bug.
- **Documentation** — improvements, typo fixes, and missing examples are appreciated.
- **Features** — open an issue first to discuss scope and approach before writing code. This avoids wasted effort on things that don't fit the project direction.

## Branch and PR process

1. Fork the repo and create a feature branch from `main`.
2. Keep PRs focused — one concern per PR.
3. Open a pull request against `main`.

## PR expectations

- Describe what you changed and why.
- Include steps to test your change.
- Make sure these pass before opening:
  ```bash
  npm run build
  npm run lint
  ```

## What we don't accept right now

- Large refactors without prior discussion in an issue.
- Changes to the license.
- PRs that skip or bypass CI checks.
