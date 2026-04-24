---
id: SPEC-0001
slug: export-csv
status: accepted
parent: INT-0001
version: 1.0.0
contracts: [contracts/openapi.yaml, contracts/invoice.schema.json]
observability: observability.yml
compliance: compliance.yml
budgets: budgets.yml
diagrams: [diagrams/state.mmd, diagrams/sequence.mmd]
verified-by: [tests/spec-0001/**]
mutation-threshold: 0.85
judge-model: claude-opus-4-7
ambiguity-threshold: 0.80
generation-seed: 42
compiled-hash: null
supersedes: null
superseded-by: null
---

# Scope

This spec covers the CSV export endpoint and UI button for invoice data. Excludes XLSX, scheduled exports, custom column selection, and multi-tenant aggregation (see `intents/INT-0001-example-export-csv.md` non-goals).

# Requirements (EARS)

- **SPEC-0001-R01**: WHEN a user with `finance` role clicks the Export button on the invoices page, THE SYSTEM SHALL return a CSV download response with HTTP 200 within 800ms at p95.
- **SPEC-0001-R02**: THE CSV SHALL contain these columns in order: `id`, `issue_date`, `customer_name`, `amount`, `currency`, `status`.
- **SPEC-0001-R03**: WHEN a user without `finance` role requests `/invoices/export`, THE SYSTEM SHALL return HTTP 403 and SHALL NOT include any invoice data in the response.
- **SPEC-0001-R04**: Amounts SHALL be formatted with 2 decimal places, period as decimal separator, and no thousands separator.
- **SPEC-0001-R05**: WHEN a single user submits more than 10 export requests per minute, THE SYSTEM SHALL return HTTP 429 with `Retry-After` header.
- **SPEC-0001-R06**: THE SYSTEM SHALL NOT include the `customer_email` field in the CSV, regardless of role, because the export is for reconciliation and email is PII that is not required.

# Invariants

- **SPEC-0001-I01**: Every row in the CSV corresponds to exactly one invoice in the account, with no duplicates and no omissions.
- **SPEC-0001-I02**: Amount totals of the exported CSV equal the sum of invoice amounts in the filtered view.

# State Machine

See `diagrams/state.mmd`. Every transition must have a test.

# Contracts

- OpenAPI: `contracts/openapi.yaml` - `GET /invoices/export`
- JSON Schema: `contracts/invoice.schema.json` - record shape

# Acceptance Criteria

See `acceptance.yaml` for structured given/when/then per requirement.
