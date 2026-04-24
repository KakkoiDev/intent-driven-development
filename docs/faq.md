# FAQ

## Why "Intent Driven Development" and not just "Spec Driven"?

Most spec frameworks (GitHub Spec Kit, Amazon Kiro, CodeSpeak) skip the **why**. They ask "what should the system do?" IDD asks that AND "why does this change exist and for whom?" The intent layer keeps specs from becoming solutions-in-disguise.

## Is this overkill for a small team?

For a solo weekend project, yes. For a team shipping AI-generated code to production, no. IDD exists because specs drift, intent gets lost, and AI fills the gaps with guesses. If your team has the problem, IDD's overhead is cheap compared to the cost of wrong code.

Minimum viable adoption: just intent + spec + acceptance.yaml + validator. Skip observability/compliance/budgets/ambiguity until they hurt.

## Won't this slow us down?

Initial authoring of the first few specs will feel slow. After that, the slash commands and templates cut the time significantly. And the AI implementation phase is much faster because the agent has a complete context.

Measure: time from "requirement stated" to "feature in production with tests and observability". IDD teams report this metric improves after ~4-6 specs.

## What if the spec is wrong?

If the spec is wrong but accepted, you do NOT edit it in place. Create a new version (minor or major bump) with the correction. Old version moves to `superseded`.

If reality conflicts with the spec during implementation, **stop** and trigger the drift protocol. Ask the user whether to fix the spec or fix the code. Never silently reconcile.

## How do I handle refactors that do not change behavior?

Refactors do not change behavior, so they do not affect the spec. A refactor task cites the existing `SPEC-####-R##` it preserves and is purely structural. Kent Beck rule: never mix structural and behavioral changes in the same task.

If a refactor requires a spec change, it is not a refactor; it is a new spec version.

## Do I need to write the ambiguity pre-check for every spec?

No. Run it on specs where the cost of misinterpretation is high (authz, money, data integrity, safety). Skip it on trivial CRUD. Document the skip reason in `ambiguity-skip-reason:` frontmatter.

## What about specs that change during implementation?

If a spec changes while it is being implemented:

- **patch**: no behavioral change. Continue implementation unchanged.
- **minor**: additive requirement. Add a new task for the new requirement. Existing tasks unaffected.
- **major**: breaking change. Close the in-flight plan, create a new plan implementing the new version.

## How does this interact with feature flags?

Feature flags are implementation details, not spec concerns. Mention flags in `plan.md` Rollback section. Do not put flags in `spec.md` requirements.

Exception: if a flag's behavior is user-observable (for example, a feature that is gradually rolled out), that belongs in the spec.

## What if a task touches multiple specs?

Tasks cite requirements, not specs directly. A task that satisfies `SPEC-0001-R01` and `SPEC-0042-R03` is fine. It lives in the plan for whichever spec is primary.

## How do I handle cross-cutting concerns like error handling?

Cross-cutting concerns go in:

- `constitution.md` if they are org-wide principles ("all errors are logged with context").
- `AGENTS.md` if they are AI-behavior rules ("never catch errors silently").
- Individual specs when a specific error response is user-observable (`SHALL return HTTP 429 with Retry-After`).

## Can I use this with languages other than JS?

Yes. The validator itself is Node, but everything it reads (Markdown, YAML, JSON Schema, Gherkin, Mermaid) is language-agnostic. Generated code can be in any language. Test names just need to start with `SPEC-####-R##:`.

## What about monorepos?

Add a `project/<service>/` namespace layer. Specs become `project/<service>/specs/SPEC-####-*/`. IDs are globally unique but slugs can repeat across services. Document this pattern in your own adoption; the default layout is single-namespace.

## What if CI is slow?

The validator itself is fast (< 2 seconds on hundreds of specs). Slow CI usually comes from mutation testing or judge-LLM calls. Configure `mutation-threshold:` per spec so cheap specs skip expensive mutation runs. Use judge-LLM only on specs touching critical paths.

## Is there a GUI?

No. The plain text IDs are greppable and the Mermaid traceability graph renders in most Markdown viewers. If you want a dashboard, generate it from `verify/traceability.yaml`.

## How do I onboard a new engineer?

1. Read `README.md`, `docs/methodology.md`, `AGENTS.md`.
2. Read the worked example (`vision/VIS-001`, `intents/INT-0001`, `specs/SPEC-0001-*`, `plans/PLAN-0001-*`).
3. Run `node verify/validator.mjs`. Break a thing. See it fail. Fix it.
4. Write your first intent via `/idd-intent <your-slug>`.
