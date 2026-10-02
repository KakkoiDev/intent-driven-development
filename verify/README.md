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

The validator runs 13 gates. Specified checks with no code are listed under "Not yet implemented".

## Gates

### Structural

1. **Frontmatter schema** - every artifact validates against `schemas/*.schema.json`.
2. **ID uniqueness** - no duplicates.
3. **Link integrity** - every `parent`, `implements`, `supersedes`, `superseded-by`, `context` resolves.
4. **Task coverage** - every `SPEC-####-R##` appears in `tasks.yaml satisfies:`.
5. **Orphan detection** - accepted intent -> spec -> plan chain complete; deprecated artifacts have `superseded-by:`.
6. **Lifecycle invariants** - `implemented` spec has all tasks `done`. Status transitions are not checked.

### Test-enforcement

7. **Requirement -> test binding** - every `SPEC-####-R##` covered via Gherkin scenario title, `acceptance.yaml` entry, contract, or named test.
8. **Receipt presence** - `<spec dir>/receipts/{coverage,mutation,judge,determinism}.yml` exist. Runs only with `--receipts`; CI does not pass the flag. Checks presence only, not content or thresholds.

### Cross-cutting

9. **Observability coverage** - every requirement referenced in `observability.yml` has an `emits:` entry in a task.
10. **Compliance tagging** - PII/financial fields in `compliance.yml` are governed by a requirement.
11. **Budget presence** - non-draft specs without `budgets.yml`, or requirements without a budget entry, produce warnings only.
12. **State machine coverage** - every transition in `diagrams/state.mmd` has a test.
13. **Determinism** - if `compiled-hash:` is set, validator recomputes content hash and compares.

### Not yet implemented

- **Test name format** - produces-files contain `SPEC-####-R##: ...` named tests.
- **Ambiguity** - specs with `status: accepted` must have a passing `ambiguity-report.md`. Run `/idd-ambiguity` manually.
- **Status transitions** - allowed transitions and the `proposed -> accepted` / `accepted -> implemented` preconditions in `docs/lifecycle.md`.

## CLI flags

- `--root <path>` - repo root (default: cwd).
- `--receipts` - enforce gate 8 (receipt presence).
- `--json` - emit machine-readable report instead of human-readable.

## Exit codes

- `0` - all gates pass.
- `1` - at least one gate failed.
- `2` - validator error (missing dependencies, IO failure).
