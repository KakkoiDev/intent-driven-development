---
id: ADR-001
status: accepted
context: PLAN-0001
immutable: true
supersedes: null
superseded-by: null
---

# Context

INT-0001 asks for "a format spreadsheets understand". The two realistic candidates are CSV and XLSX. The implementation choice has downstream consequences for payload size, mime handling, library dependencies, and future features (formulas, multi-sheet).

# Decision

Ship CSV only in v1.

# Consequences

- We ship faster. Zero new dependencies. `Intl.NumberFormat` in the standard library handles amount formatting deterministically.
- CSV is universally readable by Excel, Google Sheets, Numbers, Python pandas, R, SQL imports. Zero friction.
- We lose: cell formatting, multiple sheets, formulas, column widths. Finance users lose nothing that matters for reconciliation in v1.
- Future intent (if raised) can add XLSX as a second endpoint or a `?format=xlsx` parameter. Not today.
- CSV cell escaping for commas and quotes is handled in TASK-0001-03; this is a well-understood problem and the serializer is a pure function.

# Alternatives Considered

- **XLSX via `exceljs` or `xlsx` npm library**: adds 1-5 MB to the bundle and non-trivial startup cost. Library CVE history is non-trivial. Rejected: complexity does not match current need.
- **TSV (tab-separated)**: some edge cases are simpler, but Excel's default parser treats `.tsv` oddly in some locales. CSV is the lowest-surprise option.
- **JSON**: rejected as a finance-facing export format. Finance users have never asked for JSON.
- **Both CSV and XLSX on day one**: rejected per the Non-Goals of INT-0001.
