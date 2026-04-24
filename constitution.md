# Constitution

Immutable org principles. These apply to every spec, plan, and implementation in this repo. Changing a principle requires a team-wide review and a dated amendment below.

## Testing

- **C1**: Every `SPEC-####-R##` must have at least one automated test. No exceptions.
- **C2**: Tests are named after their requirement: `SPEC-####-R##: <description>`.
- **C3**: New code without a failing test first is rejected (TDD).
- **C4**: Mutation testing is mandatory on production-path code. Minimum mutation score per spec is set in its frontmatter.

## Security

- **C5**: Authentication and authorization are required for every data-access endpoint. Missing authz defaults to deny.
- **C6**: Secrets are never committed. Use environment variables or the org's secret manager.
- **C7**: Input validation at every trust boundary (HTTP, queue, file).
- **C8**: Dependencies are pinned and scanned. Known CVEs block merges.
- **C9**: Follow OWASP Top 10 and ASVS controls referenced in each spec's `compliance.yml`.

## Privacy

- **C10**: All fields classified `PII` or `sensitive` in `compliance.yml` are encrypted at rest and in transit.
- **C11**: Retention periods are enforced in code; logs with PII expire per the declared window.
- **C12**: Export and delete (GDPR art-15, art-17) are implemented for every PII field.

## Observability

- **C13**: Every requirement that triggers state change emits a structured log, a metric, and a trace span.
- **C14**: Error paths emit with `level: error` and include requirement ID for search.
- **C15**: Dashboards and SLOs are part of the deliverable, not an afterthought.

## Accessibility

- **C16**: UI components meet WCAG 2.2 AA.
- **C17**: Keyboard navigation works for every interactive element.
- **C18**: Error messages are human-readable, not raw stack traces.

## Code

- **C19**: Minimal changes. No refactoring in the same commit as a feature.
- **C20**: No comments describing WHAT the code does. Only WHY, when non-obvious.
- **C21**: Library-first: prefer well-maintained libraries over bespoke code for solved problems.
- **C22**: Simplicity bound: if a solution needs more than one ADR to explain, it is probably too complex.

## Deprecation

- **C23**: Nothing is deleted in place. Use the `deprecated` -> `superseded` lifecycle.
- **C24**: Deprecated artifacts stay in the repo, read-only, with `superseded-by:` backlinks.

## AI Usage

- **C25**: AI agents must read `AGENTS.md` before editing code.
- **C26**: AI-generated code must trace to a `SPEC-####-R##` via a task. Orphan code is rejected.
- **C27**: Judge-LLM receipts are required for every PR that implements a spec.

## Amendment Log

- 2026-04-24: Initial constitution committed.
