# AGENTS.md - AI Contract for Intent Driven Development

This file tells AI coding tools (Claude Code, Cursor, Copilot, Aider, etc.) how to read and write the IDD layers. Read this on every session before editing code.

## Read Order (mandatory)

Before editing any file, load in this order:

1. `constitution.md` - immutable org principles
2. `vision/VIS-*.md` - active vision
3. Active `intents/INT-####-*.md` - the reason for this change
4. `specs/SPEC-####-*/spec.md` + sibling files:
   - `contracts/*.{yaml,json}` - API and data contracts
   - `observability.yml` - required logs, metrics, traces
   - `compliance.yml` - data classification, GDPR, ASVS
   - `budgets.yml` - performance and cost ceilings
   - `diagrams/*.mmd` - state machines, sequence diagrams
   - `acceptance.yaml` - structured given/when/then
5. `plans/PLAN-####-*/plan.md` + `tasks.yaml`
6. Only now: touch code.

## Write Rules per Layer

| Layer | Who authors | AI role |
|---|---|---|
| Vision | Leadership (human) | Read-only |
| Constitution | Org (human) | Read-only |
| Intent | Product (human) | Draft from notes, human approves |
| Spec | Product + Tech Lead | Draft EARS + cross-cutting, human approves each requirement |
| Plan | Tech Lead | Draft architecture + sequencing, human approves |
| ADR | Tech Lead | Draft options, human signs |
| Tasks | AI | Generate from spec + plan |
| Code | AI | Generate under trace constraint |
| Tests | AI | Generate under name + coverage constraints |

## Hard Prohibitions

- AI MUST NOT write code that fails to cite a `SPEC-####-R##` via a `TASK-####-##`.
- AI MUST NOT edit a `SPEC` with `status: accepted` or later. Create a new version.
- AI MUST NOT edit an ADR. Supersede it via `supersedes:` chain.
- AI MUST emit the logs, metrics, and traces declared in `observability.yml`.
- AI MUST respect ceilings in `budgets.yml` (p95 latency, LLM calls, cost).
- AI MUST NOT access fields classified in `compliance.yml` without citing the requirement that authorizes it.
- AI MUST NOT mix structural and behavioral changes in the same task (Kent Beck rule).

## Commands

Run via Claude Code slash commands or equivalent in other IDEs.

- `/idd-intent <slug>` - mint next `INT-####`, copy template, prompt for Job Story + actor + impact.
- `/idd-spec <INT-id>` - mint next `SPEC-####`, link to intent, draft EARS requirements, create `observability.yml` + `compliance.yml` + `budgets.yml` stubs.
- `/idd-plan <SPEC-id>` - mint next `PLAN-####`, generate Mermaid architecture + initial `tasks.yaml`.
- `/idd-implement <TASK-id>` - resolve task -> spec requirements -> contracts -> observability, implement under trace constraint.
- `/idd-verify` - run `verify/validator.mjs`.
- `/idd-ambiguity <SPEC-id>` - inter-LLM agreement check; required before a spec reaches `accepted`.

## Drift Protocol

If during implementation, you find reality conflicts with the spec:

1. **STOP**. Do not silently fix code to match an out-of-date spec, or silently fix spec to match drifted code.
2. Ask the user: "The spec says X, but the code/system does Y. Which is correct?"
3. If spec is wrong: bump spec version, update frontmatter, update `compiled-hash` after rebuild.
4. If code is wrong: create a new task citing the requirement, fix code, do not touch spec.

## PR Receipts

Every PR that implements a spec requirement must attach four receipts:

1. **Coverage** - every `SPEC-####-R##` has >= 1 passing test.
2. **Mutation** - mutation score >= `mutation-threshold:` from spec frontmatter.
3. **Judge** - second LLM confirms tests match spec intent.
4. **Determinism** - re-build spec from `generation-seed:` matches `compiled-hash:`.

Missing or weak receipt = PR should be blocked by the reviewer. CI does not enforce receipts: `node verify/validator.mjs --receipts` checks presence only and is not run in CI.

## Traceability Format

- Test names: `SPEC-####-R##: <short description>`.
- Commit messages may reference IDs: `idd: implement SPEC-0001-R02 (CSV serialization)`.
- PR descriptions list changed `SPEC-####-R##` items.

## Versioning

- Specs use semver: patch (clarification), minor (additive requirement), major (breaking contract).
- Bump version in frontmatter and re-run validator after any change.
- On major bump, rebuild contracts in `contracts/openapi.yaml` lockstep.
