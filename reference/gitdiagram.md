# GitDiagram architecture — @konitif/composition

This architecture view was generated from the public repository by [GitDiagram](https://gitdiagram.com/lemouf/konitif-composition) on 2026-09-20 18:43:54 UTC.

It is a documentation projection of the repository tree, README, and source files sampled by GitDiagram. It does not replace the authored contracts in [catalog.json](catalog.json) and [diagrams.json](diagrams.json), nor does it establish runtime authority.

The Mermaid source keeps GitDiagram's groups, nodes, relationships, and source links. GitDiagram's forced color classes and HTML line breaks are omitted so the diagram remains readable in local previews and dark themes.

- Public repository: [konitif-composition](https://github.com/LeMouf/konitif-composition)
- Interactive diagram: [Open in GitDiagram](https://gitdiagram.com/lemouf/konitif-composition)

## Architecture diagram

```mermaid
flowchart TD

subgraph group_public["Public Surface"]
  node_api["Package API — [index.ts]"]
end

subgraph group_model["Composition Model"]
  node_contracts["Composition Contracts — [model.ts]"]
end

subgraph group_authoring["Authoring Validation"]
  node_constructors["Construction Helpers — [helpers.ts]"]
  node_validation["Structural Validation — [helpers.ts]"]
end

subgraph group_authority["Authority Boundary"]
  node_commit["Commit Boundary — [authority.ts]"]
  node_projection["Read Projection — [authority.ts]"]
end

node_author(("Composition Author"))
node_client(("Composition Consumer"))

node_author -->|"calls"| node_api
node_api -->|"exports"| node_contracts
node_api -->|"exports"| node_constructors
node_api -->|"exports"| node_validation
node_api -->|"exports"| node_commit
node_api -->|"exports"| node_projection
node_constructors -->|"constructs"| node_contracts
node_validation -->|"reads"| node_contracts
node_commit -->|"validates"| node_validation
node_commit -->|"clones workflow"| node_contracts
node_projection -->|"validates"| node_validation
node_projection -->|"returns model"| node_client

click node_api "https://github.com/lemouf/konitif-composition/blob/main/src/index.ts"
click node_contracts "https://github.com/lemouf/konitif-composition/blob/main/src/model.ts"
click node_constructors "https://github.com/lemouf/konitif-composition/blob/main/src/helpers.ts"
click node_validation "https://github.com/lemouf/konitif-composition/blob/main/src/helpers.ts"
click node_commit "https://github.com/lemouf/konitif-composition/blob/main/src/authority.ts"
click node_projection "https://github.com/lemouf/konitif-composition/blob/main/src/authority.ts"

```

## Generated analysis

@konitif/composition is a small TypeScript library for defining and governing authored executable compositions. A caller creates workflows and modules through pure helpers, validates structural relationships, then submits a candidate to the commit boundary; valid candidates are cloned and accepted, while invalid ones preserve the previous workflow. Callers can also project a validated read model. The sampled source confirms contracts, construction, validation, cloning, commit, and projection; editors and runtimes are documented consumers but are not implemented here.
