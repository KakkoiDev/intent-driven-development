---
id: SPEC-NNNN
slug: short-kebab-slug
status: draft
parent: INT-NNNN
version: 0.1.0
contracts: [contracts/openapi.yaml]
observability: observability.yml
compliance: compliance.yml
budgets: budgets.yml
diagrams: []
verified-by: [tests/spec-NNNN/**]
mutation-threshold: 0.85
judge-model: claude-opus-4-7
ambiguity-threshold: 0.80
generation-seed: 42
compiled-hash: null
supersedes: null
superseded-by: null
---

# Scope

<1 paragraph: what this spec covers, what it excludes.>

# Requirements (EARS)

- **SPEC-NNNN-R01**: WHEN <trigger> IF <condition> THE SYSTEM SHALL <response>.
- **SPEC-NNNN-R02**: THE SYSTEM SHALL NOT <prohibition>.

# Invariants

- **SPEC-NNNN-I01**: <always-true statement>.

# State Machine

<If stateful, see `diagrams/state.mmd`. Validator enforces one test per transition.>

# Contracts

- OpenAPI: `contracts/openapi.yaml`
- JSON Schema: `contracts/*.schema.json`

# Acceptance Criteria

See `acceptance.yaml` for structured given/when/then per requirement.
