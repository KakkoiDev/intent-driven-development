---
id: PLAN-NNNN
implements: SPEC-NNNN
adrs: []
tasks: tasks.yaml
status: draft
supersedes: null
---

# Architecture

```mermaid
flowchart LR
  A[Client] -->|request| B[API]
  B --> C[Service]
  C --> D[(Store)]
```

<3-5 paragraphs explaining components, boundaries, data flow, trust zones.>

# Sequencing

1. Phase 1 - <exit criterion>
2. Phase 2 - <exit criterion>
3. Phase 3 - <exit criterion>

# Risks and Rollback

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| <risk> | low/med/high | low/med/high | <action> |

Rollback: <how to revert safely>.
