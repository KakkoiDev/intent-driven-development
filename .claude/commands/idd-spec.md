---
description: Mint a new SPEC-#### from an intent ID. Drafts EARS requirements and scaffolds cross-cutting artifacts (observability, compliance, budgets, contracts).
argument-hint: <INT-####>
---

Create a new spec folder for intent `$ARGUMENTS`.

1. Read `intents/INT-$ARGUMENTS.md` and `vision/VIS-*.md`.
2. List existing specs: `ls -d specs/SPEC-*/ 2>/dev/null | sort | tail -1`. Take highest, add 1, pad to 4 digits.
3. Create the folder `specs/SPEC-NNNN-<slug>/` using the same slug as the intent (or a more specific one).
4. Copy templates:
   - `templates/spec.md` -> `specs/SPEC-NNNN-<slug>/spec.md`
   - `templates/observability.yml` -> `.../observability.yml`
   - `templates/compliance.yml` -> `.../compliance.yml`
   - `templates/budgets.yml` -> `.../budgets.yml`
5. Fill the spec frontmatter with the new ID, `parent: INT-$ARGUMENTS`, `status: draft`, `version: 0.1.0`.
6. Draft 4-8 EARS requirements from the Job Story. Each must start with SPEC-NNNN-R##, use WHEN/SHALL form, and be independently testable. Include at least one negative `SHALL NOT` requirement if any prohibition is in play.
7. Scaffold `contracts/openapi.yaml` if this is an API spec, or `contracts/*.schema.json` if it's a data spec.
8. Create `acceptance.yaml` with a given/when/then entry per requirement.
9. If the behavior is stateful, create `diagrams/state.mmd` enumerating every state and transition.
10. Ask the user to review. Do NOT set `status: accepted` until the ambiguity pre-check passes (`/idd-ambiguity SPEC-NNNN`).
11. Run `node verify/validator.mjs` to confirm schema.
