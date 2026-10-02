# Intent Driven Development (IDD)

A methodology for documenting **intent**, **spec**, and **implementation** cohesively, so AI agents can implement faithfully and humans can verify without reading every line.

The order is `intent -> spec -> implementation`. Specs are the source of truth; code is the artifact.

## The Chain

```
VIS -> INT -> SPEC -> PLAN -> TASK -> code -> test
```

Every artifact cites the layer above by stable ID. Break the chain and the validator rejects the PR.

## Layers

| Layer | ID | Captures |
|---|---|---|
| Vision | `VIS-###` | Why the product exists |
| Intent | `INT-####` | Why this change exists (Job Story + actor + impact + outcome) |
| Spec | `SPEC-####` + `SPEC-####-R##` | WHAT the system does (EARS + contracts + observability + compliance + budgets) |
| Plan | `PLAN-####` | HOW we build it (architecture + sequencing + ADRs) |
| Tasks | `TASK-####-##` | Ordered work, each citing requirements |

## Quickstart

```bash
git clone <this-repo> my-idd-setup
cd my-idd-setup
npm install --prefix verify
node verify/validator.mjs         # must pass on the worked example
```

Open in Claude Code and run `/idd` to see available commands:

- `/idd-intent <slug>` mint next `INT-####`
- `/idd-spec <INT-id>` draft spec from intent
- `/idd-plan <SPEC-id>` generate plan and tasks
- `/idd-implement <TASK-id>` implement under spec constraint
- `/idd-verify` run the validator
- `/idd-ambiguity <SPEC-id>` inter-LLM agreement check before accepting a spec

## What is Worked Out

- `vision/VIS-001-north-star.md`
- `intents/INT-0001-example-export-csv.md`
- `specs/SPEC-0001-export-csv/` - full spec with contracts, Gherkin, fixtures, observability, compliance, budgets, state diagram
- `plans/PLAN-0001-export-csv/` - plan, tasks, ADR

Read these first. They show the pattern concretely.

## Validator Gates

13 validator gates (the receipt gate runs only with `--receipts`, not in CI) split across structural, test-enforcement, and cross-cutting concerns. See `verify/README.md` for the full list.

## Ecosystem

IDD is methodology-level. Works with:

- **Claude Code / Cursor / Copilot** - implementation agents
- **CodeSpeak** - optional spec-to-code compiler (Python/Go/JS/TS)
- **Tessl** - spec registry + MCP server
- **GitHub Spec Kit**, **Amazon Kiro** - overlapping spec workflows

See `docs/ecosystem.md`.

## Adopting

Fork this repo. Replace `constitution.md` with your org principles. Delete the worked example when you have real specs. The template is what you copy.

## License

MIT.
