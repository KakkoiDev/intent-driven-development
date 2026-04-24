# Ecosystem Compatibility

IDD is methodology-level. It does not prescribe which code-generation backend you use, which test framework, or which CI provider. Several adjacent frameworks and tools plug in.

## Code Generation Backends

| Backend | Role | IDD Integration |
|---|---|---|
| Claude Code / Cursor / Copilot / Aider | AI coding agent | Primary. `AGENTS.md` tells them the contract. Claude Code gets first-class support via `.claude/skills/idd/`. |
| [CodeSpeak](https://codespeak.dev/) | LLM compiler markdown-spec -> Python/Go/JS/TS | Optional. IDD owns intent layer + receipts; CodeSpeak owns generation. Point CodeSpeak at `spec.md` and its `contracts/`. |
| [Tessl](https://tessl.io/) | Spec registry + MCP server | Optional. Reference external specs from our frontmatter via `external-spec:` field. |
| [GitHub Spec Kit](https://github.com/github/spec-kit) | Constitution/spec/plan workflow | Overlapping. Our `constitution.md` aligns with theirs. Migration: rename `spec-kit/*` -> `specs/SPEC-####-*`, add IDs and EARS. |
| [Amazon Kiro](https://kiro.dev/) | Spec-driven IDE, AWS-native | Compat: map `requirements.md` -> `spec.md`, `design.md` -> `plan.md`, `tasks.md` -> `tasks.yaml`. |

## File Extensions

IDD uses folder structure (`specs/SPEC-####-<slug>/`). We also accept:

- `<slug>.spec.md` flat file (CodeSpeak convention) - the validator loads either layout.
- `<slug>.cs.md` (CodeSpeak's own extension) - treated as an IDD spec when frontmatter contains `id: SPEC-####`.

## Test Frameworks

Any test framework works. Tests must be named `SPEC-####-R##: <desc>`. Examples:

- **Go**: `go test`, `testify`, `ginkgo`.
- **JS/TS**: `vitest`, `jest`, `mocha`, `playwright`.
- **Python**: `pytest`, `behave`, `pytest-bdd`.
- **Ruby**: `rspec`, `cucumber`.

## Contract Test Generators

`contracts/openapi.yaml` and `contracts/*.schema.json` compile to tests via:

- **Schemathesis** (Python) - property-based testing from OpenAPI.
- **Dredd** - OpenAPI contract test runner.
- **Pact** - consumer-driven contracts.
- **ajv** (JS), **Pydantic** (Py), **go-jsonschema** (Go) - runtime validation.

## Mutation Testers

- **JS/TS**: Stryker.
- **Python**: mutmut.
- **Go**: go-mutesting.
- **Ruby**: mutant.

Configure the mutation score threshold per spec in frontmatter `mutation-threshold:`.

## Observability

`observability.yml` declares logs, metrics, traces. Compatible with:

- **OpenTelemetry** - span names, attribute keys, metric names, and log event types map directly.
- **Prometheus** - metric `name:` + `labels:` compile to Prometheus client library calls.
- **structured logging** - pino (JS), zap (Go), structlog (Py), Serilog (C#).

## Compliance

`compliance.yml` references:

- **OWASP ASVS 5.0** via `V#.#.#` identifiers.
- **GDPR** via `art-##` article references.
- **STRIDE** threat model categories: S/T/R/I/D/E.
- **NIST OSCAL** extension point (add `oscal:` field) for compliance-heavy orgs.

## Budgets

`budgets.yml` enforced by:

- **k6 / artillery / bombardier** for latency and throughput.
- **Static analysis** for LLM call counts and external API calls (grep for known SDK imports).
- **Cost estimators** (cloud provider billing APIs, LLM pricing APIs) for per-request cost.

## What IDD Adds on Top

- **Intent layer** that most AI-coding frameworks skip: Job Story + actor + impact + outcome metric.
- **Cross-cutting specs** (observability, privacy, budgets) as first-class artifacts, not afterthoughts.
- **Determinism receipt** that pins generation output across LLM re-runs, addressing the main critique of spec-as-source-of-truth approaches.
- **Mermaid-coverage gate** ensures every state transition has a test.
- **Ambiguity pre-check** gates spec acceptance by inter-model agreement.
- **CI-enforced traceability chain** from vision to test.

## Migration Recipes

### From GitHub Spec Kit

1. Rename `constitution.md` -> keep as is.
2. For each feature in Spec Kit:
   - `spec.md` -> `intents/INT-####-<slug>.md` (extract the "why" into Job Story + actor + impact).
   - `spec.md` -> `specs/SPEC-####-<slug>/spec.md` (the "what", as EARS).
   - `plan.md` -> `plans/PLAN-####-<slug>/plan.md`.
   - `tasks.md` -> `plans/PLAN-####-<slug>/tasks.yaml`.
3. Add `observability.yml`, `compliance.yml`, `budgets.yml` stubs per spec.
4. Run `node verify/validator.mjs`.

### From Amazon Kiro

1. `requirements.md` -> split into `intents/INT-####-<slug>.md` + `specs/SPEC-####-<slug>/spec.md` using EARS.
2. `design.md` -> `plans/PLAN-####-<slug>/plan.md` + any ADRs.
3. `tasks.md` -> `plans/PLAN-####-<slug>/tasks.yaml` (add satisfies/produces).
4. Kiro hooks -> `.claude/commands/` equivalents.

### From ad-hoc Markdown

1. Identify the active features.
2. For each, create the intent-spec-plan chain using templates.
3. Start with `status: draft`; move to `accepted` as you retroactively fill gaps.
4. Use `/idd-ambiguity` to find underspecified areas.
