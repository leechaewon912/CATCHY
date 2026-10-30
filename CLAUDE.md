@AGENTS.md

# Design System (UI work)

Before any UI/frontend change, read `DESIGN.md` at the project root. It documents Catchy's real, implemented design tokens and components — colors, the typography scale, border radius, and the button/badge/surface component classes — sourced directly from `src/app/globals.css` and verified against actual usage in `src/app`/`src/components`, not copied from the original style reference it was bootstrapped from.

- **Reuse first.** Prefer existing `--color-*` / `--text-*` / `--radius-*` tokens and existing component classes (`.btn-solid-black`, `.btn-ghost`, `.btn-neutral`, `.btn-outline-black`, `.badge-outline`, `.badge-filled`, `.badge-accent`, `.surface-card`, `.surface-card-subtle`, `.surface-info-box`, `.surface-dark`, `.field-input`) or components (`TrendCard`, `ExpressionCard`, `FeedbackModal`) over writing new ad-hoc styles.
- **Don't invent new raw values.** No new arbitrary colors, font sizes (`text-[Npx]`), spacing, or border-radius without first checking DESIGN.md / `globals.css` for an existing token that already covers it. A new token should be rare — if one is genuinely needed, add it to `globals.css`'s `@theme inline` block (not a one-off arbitrary value) and document it in DESIGN.md in the same change, not as a follow-up.
- **Keep DESIGN.md in sync.** Whenever a real design-system rule changes — a token's value, a new component class, a component's color/role — update DESIGN.md's YAML and prose in the same change. This document has drifted from the real code before (`--color-paper`'s documented value, an undefined `text-terracotta` class) and both were only caught by an explicit audit, not by anyone noticing during normal work.
- DESIGN.md's YAML frontmatter is lint-checkable: `npx @google/design.md lint DESIGN.md`.
