# @konitif/composition

Amodal Workflow Composition authority for KONITIF workbenches.

This package owns Workflow, Composition, Module, Connection, Domain and Contract definitions together with their validation and commit boundary. It has no dependency on Nodal, Timeline, Viewer or a particular workbench shell.

Tools consume it according to their role:

- a Viewer reads a Workflow Composition;
- Nodal projects it as an editable graph and submits edits back through a commit adapter;
- a runtime executes or adapts the Composition without transferring authored authority to its execution representation.

## Usage

```js
import { createEmptyWorkflow, validateWorkflow } from '@konitif/composition';

const workflow = createEmptyWorkflow({ id: 'example', title: 'Example' });
const validation = validateWorkflow(workflow);
```

Validation checks composition structure, not successful execution or real-world
effects. A rejected commit returns a copy of the previous workflow.

## Licence

Source-available under [PolyForm Noncommercial 1.0.0](LICENSE.md), not OSI
open source. Third-party elements retain their own rights and notices.
