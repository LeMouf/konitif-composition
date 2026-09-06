# Maintaining Composition

Build with TypeScript 5.9.3, locked in package-lock.json. No runtime dependency.
With the build dependency installed: `npm run build`, `npm test`, then
`npm run verify:package`. Verification packs offline without lifecycle scripts
and checks the archive through an external runtime and TypeScript consumer.

CI selects cached Node 24.20.0 and fails if absent; it does not download a
runtime fallback. It installs the locked compiler. Required check: `validate`.

## GitHub setup

Create the public repository `LeMouf/konitif-composition` without generated
README, licence or gitignore. Push the package-only baseline, then require
pull requests and the successful `validate` check for main. Disable force
pushes and deletion. For a solo maintainer, do not require another reviewer
on every PR.

## Publication preparation

No publishing workflow is enabled in this baseline. Before first publication,
prepare a tag/version check and publication of the verified archive, configure
the protected `npm-release` environment, and configure npm trusted publishing
for this repository and the exact workflow filename. Never reuse Core's
trusted-publisher binding for Composition. First npm publication and subsequent
OIDC bootstrap must be coordinated explicitly. Never commit npm credentials.

The package is source-available under PolyForm Noncommercial 1.0.0, not OSI
open source. This repository grants no separate partner licence.
