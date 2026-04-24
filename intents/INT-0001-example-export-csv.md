---
id: INT-0001
slug: example-export-csv
status: accepted
parent: VIS-001
actor: finance-user
impact: stops re-keying invoices into spreadsheets for month-end reconciliation
owners: [cyril.antoni@meetsmore.com]
created: 2026-04-24
supersedes: null
superseded-by: null
---

# Job Story

When a finance user reconciles month-end invoices, I want to export all invoices as CSV with one click, so I can open them directly in my reconciliation spreadsheet without copying individual rows.

# Problem

Finance users re-key invoice data into spreadsheets every month. Average session takes 4-6 hours, during which transcription errors happen routinely: wrong decimal places, currency mixups, missed invoices. We see support tickets with screenshots of our dashboard next to mismatched spreadsheet cells almost daily.

The underlying cause is that our dashboard shows invoices but does not let users take them out in a format spreadsheets understand. Users open Chrome DevTools, paste HTML table data, clean it up, and hope for the best.

# Outcome Metric

Success = zero "wrong totals" or "transcription error" support tickets tagged `finance` in a rolling 30-day window, starting 2 weeks after launch.

# Non-Goals

- Custom column selection. Ship fixed columns; custom exports are a future intent.
- XLSX export. CSV first; if finance teams ask for XLSX, that is a separate intent.
- Scheduled exports. Manual one-click only for v1.
- Multi-tenant aggregation. One customer at a time.

# Evidence

- Support tickets Q1 2026: 142 tagged `finance` with substring "total" or "amount".
- User interviews (6 finance users, March 2026) all mentioned copy-paste as pain point.
- Analytics: 87% of finance-role sessions end with a page-print or select-all copy action.
