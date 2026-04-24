# Naming and Versioning

## ID Format

| Artifact | Format | Example |
|---|---|---|
| Vision | `VIS-###` | `VIS-001` |
| Intent | `INT-####` | `INT-0042` |
| Spec | `SPEC-####` | `SPEC-0117` |
| Spec requirement | `SPEC-####-R##` | `SPEC-0117-R03` |
| Spec invariant | `SPEC-####-I##` | `SPEC-0117-I01` |
| Plan | `PLAN-####` | `PLAN-0042` |
| ADR | `ADR-###` | `ADR-012` |
| Task | `TASK-####-##` | `TASK-0042-07` |

## Rules

- IDs are zero-padded, monotonically minted, never reused.
- If an artifact is deleted (rare), its ID stays as a "tombstone" reference; do not recycle.
- Task IDs are scoped to their parent plan: `TASK-0042-01` is the first task of `PLAN-0042`.

## Slugs

- Kebab-case, lowercase, ASCII-only: `export-csv`, `rate-limit-exports`.
- Stable. If you need to rename the concept, the slug can change but the ID cannot.
- Appear in paths: `intents/INT-0042-export-csv.md`, `specs/SPEC-0117-export-csv/`, etc.

## Minting

```bash
# Next intent ID
ls intents/INT-*.md 2>/dev/null | sort | tail -1
# e.g. INT-0041-foo.md -> next is INT-0042

# Next spec ID
ls -d specs/SPEC-*/ 2>/dev/null | sort | tail -1

# Next task ID within a plan
grep -o 'TASK-0042-[0-9]\+' plans/PLAN-0042-*/tasks.yaml | sort -u | tail -1
```

Slash commands (`/idd-intent`, `/idd-spec`, `/idd-plan`) automate this.

## Versioning (specs only)

Specs use semver:

- **patch** - clarification only. Body text change, same behavior. Same `compiled-hash:` after rebuild.
- **minor** - additive requirement. Existing requirements unchanged.
- **major** - breaking change. Contracts bump in lockstep (OpenAPI major, JSON Schema major).

On every version bump:

1. Update `version:` in frontmatter.
2. If minor or major, set `compiled-hash: null` and rebuild.
3. Run `node verify/validator.mjs`.

## Intents Do Not Version

If an intent changes, create a new one with `supersedes: INT-OLD`. The old one moves to `deprecated`. Keeps history clean and avoids stale "why did we build this?" debates.

## File Naming

- Markdown: `<kind>-<ID>[-<slug>].md`
  - `intents/INT-0042-export-csv.md`
  - `specs/SPEC-0117-export-csv/spec.md`
  - `plans/PLAN-0042-export-csv/plan.md`
  - `plans/PLAN-0042-export-csv/adr/ADR-001-csv-over-xlsx.md`
- YAML: `<name>.yml` (plural where appropriate, e.g. `budgets.yml`).
- Mermaid: `.mmd` extension.
- Fixtures and expected outputs: free-form, placed in `fixtures/` and `expected/` subdirs.

## Avoid

- Spaces or uppercase in slugs.
- Reordering requirement IDs after a spec is accepted.
- Renaming IDs. Ever.
