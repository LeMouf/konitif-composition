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

The `publish.yml` workflow is disabled unless the repository variable
`COMPOSITION_NPM_PUBLISH_ENABLED` is exactly `true`. Keep it absent until setup
is complete. Only version-matching `v*` tags on main history may publish.
The job verifies and publishes the same archive, with no lifecycle scripts
at upload time. It refuses old preinstalled npm/Node versions without upgrading.

Before enabling it, configure the `npm-release` environment with LeMouf as
required reviewer, no administrative bypass, and allowed tags `v*`. For solo
operation, allow self-review. Configure npm trusted publishing with user
`LeMouf`, repository `konitif-composition`, filename `publish.yml`, environment
`npm-release`, and permission to publish. No long-lived npm secret is required.
Never reuse Core's trusted-publisher binding. First npm publication and OIDC
bootstrap must be coordinated explicitly; do not tag or publish merely to test
the setup. A published version cannot be reused for another artifact.

Merge the workflow PR before enabling publication; branch validation does not
exercise npm authentication. Environment approval is separate from PR merging.
Never commit npm credentials. See https://docs.npmjs.com/trusted-publishers/.

The package is source-available under PolyForm Noncommercial 1.0.0, not OSI
open source. This repository grants no separate partner licence.
