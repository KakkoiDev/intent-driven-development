# IDD Methodology

## Why

The order is intent -> spec -> implementation. Today these live in different places: intent in Slack and heads, spec in scattered Markdown, implementation in code. AI agents can implement, but they conflate spec with code and lose intent entirely. Vibe coding hits a three-month wall of unmaintainable output.

IDD makes the chain explicit and enforceable:

```
VIS -> INT -> SPEC -> PLAN -> TASK -> code -> test
```

Every artifact cites the layer above by stable ID. Break the chain and the validator rejects the PR. Specs are the source of truth; code is the artifact.

## The Layers

| Layer | Captures | Does NOT capture |
|---|---|---|
| Vision | Why the product exists, north star | Features, tech choices |
| Constitution | Immutable org principles | Per-feature rules |
| Intent | Why this change exists (Job Story, actor, impact, outcome) | Solutions, schemas, UX |
| Spec | WHAT the system must do (EARS, contracts, invariants, observability, privacy, budgets) | HOW to build it |
| Plan | HOW we build it (architecture, sequencing, ADRs) | Line-level code |
| Tasks | Ordered work, each citing requirements | Design debates (those live in ADRs) |

## Why Job Stories, not User Stories

Job Stories drop the fake persona and center on causal context: `When <situation>, I want to <motivation>, so I can <outcome>.` Paired with an `actor:` field and an `impact:` field (from Impact Mapping), you get a three-axis anchor: who, what changes, why it matters.

User stories ("As a X, I want Y, so that Z") quietly invite inventing personas that do not exist and benefits that rarely get measured. Job Stories keep the conversation honest.

## Why EARS for Requirements

EARS = Easy Approach to Requirements Syntax. One behavior per bullet. Machine-parseable. `WHEN <trigger> IF <condition> THE SYSTEM SHALL <response>.` Negative form `SHALL NOT` permitted. Every requirement is independently testable.

Prose requirements lose edge cases. EARS requirements enumerate them.

## Why Separate Observability, Compliance, Budgets

Most spec frameworks treat observability, privacy, and performance as afterthoughts. IDD treats them as first-class spec artifacts because AI agents do not infer them from functional requirements. If you do not say "emit a metric named X", the AI will not emit it. If you do not say "p95 < 800ms", the AI might happily write a 10-second export.

Each is a separate YAML file so it validates independently and can evolve without thrashing `spec.md`.

## Why Mermaid

Mermaid is text, so it is both human-readable AND machine-parseable. AI can generate, render, and validate it. Sits between prose and formal spec.

- `state.mmd` enumerates transitions. Validator counts and requires one test per transition. Prose elides transitions; diagrams list them.
- `sequence.mmd` pins multi-actor flows. Clearer than "when X, Y calls Z" prose.
- `plan.md` embeds architecture. AI reads and avoids wrong-layer placement.
- `verify/traceability.mmd` auto-generated. Orphans jump out visually.

## Why Four Receipts

At PR time we require four machine-generated receipts, not because any one is perfect, but because the union makes drift detectable:

1. **Coverage** - every requirement has a test.
2. **Mutation** - the tests actually test (not assertion-free AI slop).
3. **Judge** - a second LLM confirms tests match spec intent.
4. **Determinism** - the spec re-builds to the same hash (addresses CodeSpeak's critique of LLM non-determinism).

Human reviewers read the receipts, not every test line. Sampling provides the final signoff.

## Why Supersession, Not Edit in Place

Accepted specs do not get edited. New version supersedes old via `supersedes:` backlink. Why:

- Git history is not an audit trail. Teams force-push, squash, and rewrite.
- Downstream references (tasks, tests, commits) need a stable anchor. A superseded artifact keeps its ID.
- Dep chains become traceable: "this task failed because SPEC-0042 v1.2.0 had a bug; v1.3.0 fixes it."

## What IDD Deliberately Avoids

- Custom DSL (TLA+, Alloy, Lean, Dafny). Markdown + YAML + EARS is the medium.
- Code generators from spec. That's the AI agent's job. CodeSpeak plugs in as an optional backend.
- Rules engines (Drools). LLMs parse intent directly; rule engines add config debt.
- Proprietary IDE integration. Claude Code is first-class via the skill, but any editor works.
- Full formal verification of LLM output. Intractable. We rely on property-based tests + mutation + determinism re-build.
- Opinionated branching or PR workflow. Teams decide.

## The One-Sentence Summary

IDD makes the intent-spec-implementation chain explicit, typed, traceable, and CI-enforceable so AI agents can implement faithfully and humans can verify without reading every line.
