---
description: Inter-LLM agreement check on a spec. Runs 2-3 models independently, compares their pseudo-implementations, flags divergence as ambiguity. Required before a spec reaches status accepted.
argument-hint: <SPEC-####>
---

Run an ambiguity pre-check on `SPEC-$ARGUMENTS`.

1. Read `specs/SPEC-$ARGUMENTS-*/spec.md` and all sibling artifacts.
2. For each EARS requirement `SPEC-####-R##`, ask 2-3 models (default: Claude Opus, GPT, Gemini) to produce a short pseudo-code function that implements exactly that requirement, given the contracts and fixtures. Do NOT show one model the output of another.
3. Compare outputs pairwise:
   - Identical control flow + identical data shape = "agreement".
   - Same output for the same fixture input = "semantic agreement".
   - Different output or different control flow = "divergence" (requires human review).
4. Compute an agreement score: `agreements / total_pairs`. Compare to `ambiguity-threshold:` in the spec frontmatter (default 0.80).
5. Write `specs/SPEC-$ARGUMENTS-*/ambiguity-report.md` with:
   - Per-requirement verdict (agree / diverge).
   - For each divergence, show the two/three implementations side-by-side and a one-paragraph analysis of what phrase in the spec caused the divergence.
   - Overall score and pass/fail vs threshold.
6. If the score fails the threshold:
   - Do NOT approve the spec for `status: accepted`.
   - Suggest spec edits that would reduce the divergence (clarify phrasing, add acceptance entries, tighten contracts).
   - Rerun after edits.
7. If it passes:
   - Note in the report that the spec may be moved to `status: accepted`.
   - Commit the report under `ambiguity-report.md` as part of the spec's accepted state.

Note: this check is expensive (2-3x inference). Run on critical specs, not trivial ones. Judgment call: if the spec is a pure CRUD wrapper with well-understood semantics, skip the check and document the skip reason in the spec frontmatter.
