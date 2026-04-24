---
description: Mint a new PLAN-#### from a spec ID. Generates Mermaid architecture and an initial tasks.yaml.
argument-hint: <SPEC-####>
---

Create a new plan folder for spec `$ARGUMENTS`.

1. Read `specs/SPEC-$ARGUMENTS-*/spec.md` and all sibling artifacts (contracts, observability, compliance, budgets, diagrams).
2. List existing plans: `ls -d plans/PLAN-*/ 2>/dev/null | sort | tail -1`. Take highest, add 1, pad to 4 digits.
3. Create the folder `plans/PLAN-NNNN-<slug>/` using the spec's slug.
4. Copy `templates/plan.md` -> `plans/PLAN-NNNN-<slug>/plan.md` and `templates/tasks.yaml` -> `plans/PLAN-NNNN-<slug>/tasks.yaml`.
5. Fill plan frontmatter: `id: PLAN-NNNN`, `implements: SPEC-$ARGUMENTS`, `status: draft`.
6. Draft the **Architecture** section with an embedded Mermaid diagram (`flowchart LR` or `sequenceDiagram`) showing components, boundaries, data flow.
7. Draft **Sequencing** as an ordered list of phases, each with an exit criterion. Kent Beck rule: never mix structural and behavioral changes in the same task.
8. Draft **Risks and Rollback** with a risk table and a concrete rollback strategy (feature flag, fallback, etc.).
9. Fill `tasks.yaml` with one task per requirement (or cluster of related requirements):
   - Each task cites >=1 `SPEC-####-R##` in `satisfies:`.
   - Each task lists metric/log names in `emits:` if it touches an observability-tagged requirement.
   - `produces:` lists the exact file paths the task will create.
   - `depends-on:` lists prerequisite task IDs.
10. Ask the user to review and create ADRs for any non-trivial decisions.
11. Run `node verify/validator.mjs`.
