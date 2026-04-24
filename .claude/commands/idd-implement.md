---
description: Implement a task under the IDD trace constraint. Every line of code must cite a SPEC-####-R## via this task.
argument-hint: <TASK-####-##>
---

Implement task `$ARGUMENTS`.

1. Locate the task in `plans/PLAN-*/tasks.yaml`. Read the `satisfies:`, `emits:`, and `produces:` fields.
2. Read the parent `plan.md` and the `spec.md` it implements.
3. Read sibling spec artifacts:
   - `contracts/openapi.yaml` and `contracts/*.schema.json` - implementation must match.
   - `observability.yml` - emit the declared logs/metrics/traces; `emits:` in tasks.yaml is the authoritative list for this task.
   - `compliance.yml` - respect data classification. Do not read PII fields unless the task's satisfied requirements authorize it.
   - `budgets.yml` - implementation must stay under the declared budgets (latency, cost, DB queries).
   - `diagrams/state.mmd` or `diagrams/sequence.mmd` - implementation must match the declared flow.
   - `acceptance.yaml` - test cases.
4. For each file in `produces:`:
   - If it is a test file, write tests first (TDD). Tests named `SPEC-####-R##: <desc>`. Load fixtures from `fixtures/`, compare to `expected/`.
   - If it is production code, write it to pass the tests.
5. Kent Beck rule: never mix structural and behavioral changes in a single task. If you find yourself doing both, split the task.
6. After implementing, update `tasks.yaml`: `status: in-progress` -> `done` when tests pass locally.
7. Run `node verify/validator.mjs` to confirm no gate failures.
8. Stage and commit: `idd: implement TASK-#### (<short description>)`.
9. If reality conflicts with spec during implementation, **STOP** and trigger the drift protocol: ask the user whether to update spec or fix code. Do not silently resolve.
