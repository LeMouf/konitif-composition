# @konitif/composition

Amodal contracts and pure helpers for authoring, validating and committing
executable compositions.

## Installation

```sh
npm install @konitif/composition
```

## What it provides

- Canonical Workflow, Composition, Module, Connection, Domain and Contract
  definitions.
- Structural validation for authored compositions.
- A commit boundary that preserves the previous composition when a candidate
  is rejected.
- Pure construction helpers with no UI or runtime dependency.

## Authority boundary

This package owns authored composition structure and its validation rules. It
does not execute compositions, render graph or temporal projections, select runtime
providers, or confirm real-world effects. Editors and runtimes consume the same
composition contract without acquiring its authority.

## Quick start

```ts
import { createEmptyWorkflow, validateWorkflow } from '@konitif/composition';

const workflow = createEmptyWorkflow({ id: 'example', title: 'Example' });
const validation = validateWorkflow(workflow);

if (!validation.valid) {
  console.error(validation.issues);
}
```

Validation proves structural admissibility, not successful execution.

## Public entry points

| Entry | Purpose |
| --- | --- |
| `@konitif/composition` | Composition contracts, validation and construction helpers. |

## Reference

See [`reference/`](reference/) for the machine-readable capability catalog and
authority diagrams. These files document the package; they are not runtime
configuration or executable authority.

## License

Source-available under [PolyForm Noncommercial 1.0.0](LICENSE.md), not OSI open
source. Commercial use requires separate written authorization.
