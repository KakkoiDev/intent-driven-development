---
name: idd
description: Intent Driven Development workflow. Use when the user says /idd or wants to author, validate, or implement specs in an IDD-structured repo. Provides five slash commands and enforces trace constraints.
---

# Intent Driven Development (IDD) Skill

You are operating in an IDD-structured repo. Specs are the source of truth; code is the artifact. Every line of code must trace to a `SPEC-####-R##` via a `TASK-####-##`.

## Read these files first, in order

1. `constitution.md` - immutable org principles
2. `vision/VIS-*.md` - product north star
3. The active `intents/INT-####-*.md` - why this change exists
4. `specs/SPEC-####-*/spec.md` plus sibling files:
   - `contracts/openapi.yaml`, `contracts/*.schema.json`
   - `observability.yml`, `compliance.yml`, `budgets.yml`
   - `diagrams/state.mmd`, `diagrams/sequence.mmd`
   - `acceptance.yaml`
5. `plans/PLAN-####-*/plan.md` and `tasks.yaml`

Then you can edit code.

## Hard rules

- Never write code that does not cite a `SPEC-####-R##` via a task.
- Never edit a `SPEC` with `status: accepted` or later. Create a new version.
- Never edit an ADR. Supersede it.
- Always emit logs/metrics/traces declared in `observability.yml`.
- Always respect ceilings in `budgets.yml`.
- Never access a field classified in `compliance.yml` unless the task's satisfied requirements authorize it.

## Slash commands

| Command | Purpose |
|---|---|
| `/idd-intent <slug>` | Mint next INT-####, prompt Job Story + actor + impact |
| `/idd-spec <INT-id>` | Mint SPEC-####, draft EARS + observability/compliance/budgets stubs |
| `/idd-plan <SPEC-id>` | Mint PLAN-####, draft Mermaid architecture + tasks |
| `/idd-implement <TASK-id>` | Implement a task under trace constraint |
| `/idd-verify` | Run `node verify/validator.mjs` |
| `/idd-ambiguity <SPEC-id>` | Multi-LLM agreement check before spec is accepted |

## Drift protocol

If reality diverges from spec during implementation, **stop**. Ask:

> The spec says X, but the code/system does Y. Which is correct?

Never silently "fix" code to match a stale spec, or silently update spec to match drifted code. Drift is a decision point, not an auto-resolve.

## ID minting

IDs are zero-padded, monotonic, never reused. To mint the next `INT-####`:

```bash
ls intents/INT-*.md 2>/dev/null | sort | tail -1
```

Take the highest, add 1, pad to 4 digits.

Same pattern for SPEC, PLAN, ADR (3 digits), and TASK (per-plan counter).

## Receipts at PR time

Four receipts required:

1. **Coverage** - every requirement has >= 1 passing test.
2. **Mutation** - mutation score >= `mutation-threshold:`.
3. **Judge** - second LLM confirms tests match spec intent.
4. **Determinism** - re-build matches `compiled-hash:`.

Missing or weak receipt = PR blocked.
