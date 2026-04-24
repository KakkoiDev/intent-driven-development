---
description: Run the IDD validator over the repo and report gate failures.
---

Run the validator and surface any failures.

1. Check `verify/node_modules` exists. If not: `(cd verify && npm install --silent)`.
2. Run: `node verify/validator.mjs`.
3. If exit code 0: report "All gates pass" plus any warnings.
4. If exit code 1: read the error report, group failures by gate, and explain each to the user. For each failure, suggest the smallest fix (e.g., "add an `acceptance.yaml` entry for SPEC-0001-R04").
5. If exit code 2: the validator itself errored. Print stderr and stop.
6. Show the user `verify/traceability.mmd` - it now reflects the current state of the repo and renders as a Mermaid graph in GitHub/VSCode.
