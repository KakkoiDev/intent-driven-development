---
description: Mint a new INT-#### intent from a slug. Prompts for Job Story, actor, impact, outcome metric.
argument-hint: <slug>
---

Create a new intent file.

1. List existing intents: `ls intents/INT-*.md 2>/dev/null | sort | tail -1`.
2. Take the highest ID and add 1. Zero-pad to 4 digits.
3. Copy `templates/intent.md` to `intents/INT-NNNN-$ARGUMENTS.md`.
4. Fill the frontmatter:
   - `id`, `slug: $ARGUMENTS`, `status: draft`, `parent: VIS-001` (or the active vision).
   - `created` = today in YYYY-MM-DD.
5. Ask the user to fill these interactively:
   - **Actor**: who benefits (role or persona)?
   - **Impact**: what behavior change do we expect?
   - **Job Story**: "When <situation>, I want to <motivation>, so I can <outcome>."
   - **Problem**: 2-4 paragraphs of evidence.
   - **Outcome Metric**: measurable observable signal.
   - **Non-Goals**: explicit out-of-scope items.
6. Read `vision/VIS-001-*.md` first so the intent aligns with the north star.
7. After the user fills the content, run `node verify/validator.mjs` to confirm schema passes.
