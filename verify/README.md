# IDD Validator

Single-file Node validator that enforces the IDD traceability chain, coverage, and cross-cutting contracts.

## Install

```bash
cd verify
npm install
```

Requires Node >= 20.

## Run

From the repo root:

```bash
node verify/validator.mjs
```

Exit code 0 on success, 1 on any gate failure. Prints a human-readable report to stdout and writes:

- `verify/traceability.yaml` - generated join across all layers
- `verify/traceability.mmd` - Mermaid graph of the chain (renders in GitHub/VSCode)

## Gates

### Structural

1. **Frontmatter schema** - every artifact validates against `schemas/*.schema.json`.
2. **ID uniqueness** - no duplicates.
3. **Link integrity** - every `parent`, `implements`, `supersedes`, `superseded-by`, `context` resolves.
4. **Task coverage** - every `SPEC-####-R##` appears in `tasks.yaml satisfies:`.
5. **Orphan detection** - accepted intent -> spec -> plan chain complete; deprecated artifacts have `superseded-by:`.
6. **Lifecycle invariants** - `implemented` spec has all tasks `done`.

### Test-enforcement

7. **Requirement -> test binding** - every `SPEC-####-R##` covered via Gherkin scenario title, `acceptance.yaml` entry, contract, or named test.
8. **Test name format** - produces-files contain `SPEC-####-R##: ...` named tests.
9. **Receipt presence** - CI checks for coverage, mutation, judge, determinism receipts (skipped in local runs unless `--receipts` flag present).

### Cross-cutting

10. **Observability coverage** - every requirement referenced in `observability.yml` has an `emits:` entry in a task.
11. **Compliance tagging** - PII/financial fields in `compliance.yml` are governed by a requirement.
12. **Budget presence** - every implementation-path requirement has an entry in `budgets.yml`.
13. **State machine coverage** - every transition in `diagrams/state.mmd` has a test.
14. **Determinism** - if `compiled-hash:` is set, validator recomputes content hash and compares.
15. **Ambiguity** - specs with `status: accepted` must have a passing `ambiguity-report.md` (skipped if absent).

## CLI flags

- `--root <path>` - repo root (default: cwd).
- `--receipts` - enforce gate 9 (receipt presence).
- `--strict` - treat warnings as errors.
- `--json` - emit machine-readable report instead of human-readable.

## Exit codes

- `0` - all gates pass.
- `1` - at least one gate failed.
- `2` - validator error (missing dependencies, IO failure).
