---
version: alpha
name: Catchy
description: >-
  Editorial zinc-neutral UI for a culture-and-English-expression learning
  product. Colors/typography/radii below are read directly from
  src/app/globals.css and verified against actual usage in src/app and
  src/components — not copied from the original "Awesomic" style
  reference this system was bootstrapped from (see Overview).
omitted:
  - section: spacing
    reason: >-
      No custom spacing tokens are defined in globals.css — the app relies
      entirely on Tailwind v4's built-in 4px-based scale (p-4, gap-6, etc.).
      Real, commonly-used values are documented as prose under Layout
      instead of invented as named tokens that don't exist in code.
colors:
  # Role names (primary/secondary/muted/accent/neutral/surface) are this
  # reorganization's addition, chosen to match actual usage below — they
  # are not separate CSS variables. Every value and the --color-* name
  # next to it is unchanged from src/app/globals.css.
  primary: "#09090b"      # --color-obsidian
  secondary: "#3f3f46"    # --color-iron
  muted: "#71717a"        # --color-fog
  accent: "#ff5a00"       # --color-ember
  neutral: "#fafbfc"      # --color-paper (canvas/page background)
  surface: "#ffffff"      # --color-snow (card/elevated-surface background)
  # Remaining tokens that exist in globals.css but don't fit the
  # primary/secondary/muted/accent/neutral/surface ladder — kept under
  # their own --color-* names rather than forced into a role.
  graphite: "#18181b"     # --color-graphite — body/nav/badge text ink
  slate: "#27272a"        # --color-slate — defined, not used in any .tsx today
  steel: "#52525b"        # --color-steel — icon strokes (text-steel)
  ash: "#a1a1aa"          # --color-ash — placeholder/disabled text, borders
  mist: "#d4d4d8"         # --color-mist — hero-photo Korean subtitle, borders
  cloud: "#ececee"        # --color-cloud — the one card/badge/input border color
  magenta-spark: "#fe45e2" # --color-magenta-spark — defined, not used in any .tsx today
typography:
  # Font-size only, deliberately — see "Typography" below for why no
  # lineHeight/fontWeight is declared per level. Sizes and names are
  # exactly src/app/globals.css's @theme inline block.
  caption:
    fontSize: 12px
  label:
    fontSize: 13px
  body-sm:
    fontSize: 14px
  body:
    fontSize: 15px
  body-md:
    fontSize: 16px
  body-lg:
    fontSize: 18px
  subheading:
    fontSize: 20px
  heading-xs:
    fontSize: 24px
  heading-sm:
    fontSize: 32px
  heading:
    fontSize: 40px
rounded:
  badges: 12px
  inputs: 14px
  buttons: 14px
  icons: 40px
  pills: 10000px
  # --radius-cards is the one responsive token in the system — see Shapes.
  # Represented as three explicit entries (its real values at each
  # breakpoint) rather than one key, since the format has no native way
  # to express "this token changes at 768px/1024px" in a single Dimension.
  cards-mobile: 16px
  cards-tablet: 20px
  cards-desktop: 24px
components:
  btn-solid-black:
    backgroundColor: "#111111"
    textColor: "{colors.surface}"
    rounded: "{rounded.buttons}"
    padding: 12px
  btn-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.pills}"
    padding: 12px
  btn-neutral:
    backgroundColor: "#fafafa"
    textColor: "{colors.graphite}"
    rounded: "{rounded.buttons}"
    padding: 12px
  badge-outline:
    backgroundColor: transparent
    textColor: "{colors.graphite}"
    typography: "{typography.caption}"
    rounded: "{rounded.badges}"
    padding: 4px
  badge-filled:
    backgroundColor: "{colors.secondary}"
    textColor: "#fafafa"
    typography: "{typography.caption}"
    rounded: "{rounded.badges}"
    padding: 4px
  badge-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.badges}"
    padding: 4px
  field-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.graphite}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.inputs}"
    padding: 12px
  surface-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.cards-mobile}"
  # Typography presets ("Catchy 타이포그래피 프리셋 구현") — role-based
  # combinations of a typography size token with the weight/line-height/
  # letter-spacing/family that already accompanied it at every repeat
  # occurrence found in the codebase. The `typography` reference below
  # only carries the size token (this format's Typography object has no
  # weight/lineHeight slot — see Typography section below); the full
  # combination (including weight/leading/family, which the YAML schema
  # can't express per-component) is documented in prose there.
  type-heading:
    typography: "{typography.heading-sm}"
  type-caption:
    typography: "{typography.caption}"
  type-caption-strong:
    typography: "{typography.caption}"
  type-body-kr:
    typography: "{typography.body-sm}"
---

# Catchy

## Overview

Catchy is a culture-and-language product: it turns trending music/film/sports/tech stories into bilingual (English + Korean) reading material and teaches the English expressions inside them. The UI's visual language — a near-monochrome zinc scale, one reserved orange accent, hairline borders instead of shadows, and generously rounded cards — was adopted wholesale from an external reference ("Awesomic," a marketplace-style site) when the project started, and is now the actual, implemented system: every color/radius/typography value in the YAML above is read from `src/app/globals.css`, not restated from the original reference.

What did **not** carry over from that reference is its subject matter and page structure. The original material documented components like a logo strip, a stats block, a dark feature card with arrow-bullet lists, and a nature-photography "breakthrough" section — none of which exist anywhere in Catchy's codebase. This reorganization replaces those with Catchy's real components (buttons, badges, surfaces, `TrendCard`, `ExpressionCard`, `FeedbackModal`) so the document describes what's actually on screen. The original reference material is preserved in full, untouched, in `DESIGN.md.bak` for anyone who wants it.

Catchy is mobile-first in practice: 146 of the app's 150 responsive-breakpoint usages are the single `sm:` (640px) breakpoint — content is designed for a narrow screen first, with one step up for tablet/desktop, not a multi-tier system.

## Colors

- **`primary` (`#09090b` / `--color-obsidian`)** — the dominant ink: hero headlines, section headings (`text-obsidian`), and focus rings. Note: the single busiest CTA class in the live app, `.btn-solid-black`, actually uses a raw `#111111` for its background rather than this token — see Do's and Don'ts.
- **`secondary` (`#3f3f46` / `--color-iron`)** — filled-badge backgrounds, outline-button borders/text, secondary labels.
- **`muted` (`#71717a` / `--color-fog`)** — helper text, captions, metadata (`text-fog` is the most common secondary-text color in the app).
- **`accent` (`#ff5a00` / `--color-ember`)** — the one reserved chromatic color. Used only for the orange-underline highlight on English summaries and `.badge-accent`; never for body text or large fills.
- **`neutral` (`#fafbfc` / `--color-paper`)** — the page canvas background.
- **`surface` (`#ffffff` / `--color-snow`)** — card and elevated-surface backgrounds, input fields.
- **Supporting tokens**: `graphite` (body/nav ink), `steel` (icon strokes, `text-steel`), `ash` (placeholder/disabled text and borders), `mist` (borders, and the hero-photo Korean subtitle color), `cloud` (the single border color used across nearly every card/badge/input — `border-cloud`).
- **Defined but unused**: `slate` and `magenta-spark` exist as CSS variables but appear in zero `.tsx` files today. Don't reach for them assuming they're load-bearing somewhere — confirm with a search first.
- **No `danger`/error token exists.** Quiz correct/incorrect states use Tailwind's stock `emerald-*`/`rose-*` palette directly (`quiz-client.tsx`), not a Catchy color token. `feedback-modal.tsx`'s error message now reuses the same `rose-700` for consistency (see "`text-terracotta` fix" below) rather than introducing a dedicated `danger` token — Catchy still has no custom-token error color, only this shared Tailwind-default convention.

## Typography

Catchy renders two scripts with two different typefaces: DM Sans for Latin text (headings, UI chrome, English sentences) and Pretendard for Korean (opted into per-element via `.text-kr-body`/`.text-kr-subtitle`, not global). Neither is "Cosmica," the typeface named in the original reference material — Cosmica was never a real distributable font; DM Sans has always been the actual substitute in code, and that's reflected here directly rather than kept as a to-be-substituted placeholder.

`.text-kr-body` and `.type-body-kr` (one of the four presets below) share one `font-family`/`font-weight`/`line-height`/`letter-spacing`/`color` declaration via a grouped CSS selector (`.text-kr-body, .type-body-kr { ... }` in `globals.css`) rather than each declaring it independently — `.type-body-kr` only adds the one thing that's actually different about it, its font-size. The two classes keep distinct roles and both still work exactly as before at every existing call site (20 for `.text-kr-body`, 10 for `.type-body-kr`, verified — no element applies both at once): `.text-kr-body` is the general-purpose opt-in for Korean typography at *any* size (paired with `text-body` / `text-body-md` / `text-body-lg` / the fluid `.text-kr-body-fluid` article body, depending on the element), while `.type-body-kr` is specifically the 14px role. Neither class sets a font-size of its own outside this split — `.text-kr-body` still requires a separate size class exactly as it always has.

The ten tokens above (`caption` 12px through `heading` 40px) are **font-size only** — no `fontWeight`, `lineHeight`, or `letterSpacing` is bundled in, on purpose. Before these existed, the same pixel size was already paired with different `leading-*` values across different call sites (compare the hero's `leading-[1.28]` heading against the quiz result's unleaded `font-semibold text-heading-sm`) — bundling a single line-height into the token would have silently changed one of those. `heading-lg` (56px) and `display` (64px) are documented in the original reference but not implemented as tokens, since nothing in the app uses those sizes.

When adding new UI text, pick the closest existing token by rendered size rather than reaching for a new arbitrary `text-[Npx]` value — that's the exact duplication this document's last revision cleaned up (119 occurrences across 18 files, see git history: "Tokenize repeated font sizes...").

### Typography presets vs. size tokens

The ten size tokens above are intentionally bare (size only). Four **presets** — `.type-heading`, `.type-caption`, `.type-caption-strong`, `.type-body-kr`, defined in `globals.css`'s `@layer components`, right below the token block — go one level further: they bundle a size token with whatever weight/line-height/letter-spacing/family/responsive-step was already repeated alongside it at real call sites in the app (verified by parsing every `className` in `src/app`/`src/components`, not estimated). **A preset is not a replacement for the token system** — most text in the app still just pairs a bare size token with its own per-usage weight/color, exactly as before; a preset exists only where the *same full combination* repeated across unrelated components.

- **`.type-heading`** — `text-heading-sm` (32px) `font-semibold` `leading-tight`, stepping to `text-heading` (40px) at `sm:`. The screen's own title text. 4 sites: the bookmarks page title, both quiz page titles, and the quiz question-phrase display.
- **`.type-caption`** — `text-caption` (12px), no explicit weight (inherits the ambient 400 every one of these already rendered at). Small metadata/helper text. 18 sites across `bookmarks-list.tsx`, `quiz-client.tsx`, `quiz-entry-client.tsx`, `trend/[id]/page.tsx`, `expression-card.tsx`, `expression-detail-card.tsx`, `feedback-modal.tsx`.
- **`.type-caption-strong`** — `text-caption` `font-medium`. The medium-weight sibling of Caption — category tags, the "원문 보기" link, quiz correct/incorrect indicators, the bookmark "삭제"/save-pill buttons. 9 sites.
- **`.type-body-kr`** — `text-body-sm` (14px) plus the shared `font-family: var(--font-kr)` / `font-weight: 400` / `line-height: 1.75` / `letter-spacing: -0.015em` / `color: #374151` it draws from the same grouped selector as `.text-kr-body` (see Typography intro above — that color only shows where no `text-*` color utility is also applied, since `@layer components` loads before Tailwind's own utilities). Korean body text at the app's most common size. Replaces the `"text-kr-body text-body-sm"` two-class pairing at 10 sites.

None of the four presets include a text **color** — every site's color varies (fog/ash/white/ember/graphite/emerald-700/rose-700/iron), so color stays a separate utility class alongside the preset at every call site, same as before.

**Deliberately not folded into any preset** (same rendered size, different role or different responsive behavior — verified, not assumed):
- **Phrase Display** — `text-heading-sm font-semibold leading-tight` with no `sm:` step, in `bookmarks-list.tsx` and `expression-detail-card.tsx`. Same literal classes as `.type-heading`'s base, but these show a saved English phrase/word, not a screen title, and don't grow at `sm:` — merging them into `.type-heading` would make saved phrases 40px on desktop where they're 32px today, a real size change.
- **Section Heading** — `trend/[id]/page.tsx`'s "어떤 이야기인가요?" / "이 이야기에서 배우는 표현", `text-heading-sm font-semibold leading-[1.5]`, fixed at 32px with no `sm:` step. Visually similar to the home feed's/carousel's `text-heading-xs sm:text-heading-sm` section headings, but that pair *did* get mobile-reduced in an earlier pass and these two did not — a genuine, pre-existing inconsistency, left as-is here since fixing it would change the trend detail page's current mobile rendering.
- **Hero Display** — `trend-hero.tsx`'s `"Catch the Culture. / Learn the Language."`, sized via an inline `clamp(2rem, 0.72rem + 6vw, 5.5rem)` style with `font-extrabold` (the only 800-weight text in the app) and `tracking-tight`. Fluid, not discrete — doesn't fit a token-based preset at all.

## Layout

No numeric spacing tokens are defined (see `omitted` above) — these are the values Catchy's code actually converges on, for reference, not enforced tokens:

- **Content width**: primary article-style content (trend detail, quiz, bookmarks) uses `max-w-4xl` (896px); wider index-style content (home feed, carousels) uses `max-w-6xl` (1152px).
- **Section spacing**: top padding between stacked sections is most commonly `pt-10` (40px) or `pt-14` (56px) on mobile, with a larger `sm:` step for desktop.
- **Card padding**: `p-6` (24px) or `p-8` (32px) are the two values actually used across `surface-card`/modal/form containers — not a single fixed figure.
- **Mobile-only font/spacing overrides** follow the base-class/`sm:`-class pattern throughout (`text-heading-xs sm:text-heading-sm`, `gap-3 sm:gap-5`) — the mobile value is the plain class, the larger tablet/desktop value is always under `sm:`, never the reverse.

## Elevation & Depth

Catchy's live UI uses **zero box-shadows**. Every card, badge, and input is flat, bounded by a 1px `cloud` (`#ececee`) border instead — this is the system's only elevation mechanism (`surface-card`'s `border border-[#E8ECF1]`, effectively the same hairline-gray as `cloud`). `.btn-primary` is the one class in `globals.css` with a real multi-layer `box-shadow` (inset highlight + ambient shadow, matching the original reference's "Primary Action Button"), but it's defined and unused — no page currently renders a `.btn-primary`. Don't treat it as evidence that shadows are part of the live visual language; treat it as dead code to be aware of.

## Shapes

Radius is the system's most structurally expressive property. Three fixed radii repeat everywhere: `badges`/`inputs`/`buttons` cluster around 12–14px (precise, controlled, interactive), `icons` at 40px, and `pills` at 10000px (nav CTAs, filter chips) for fully-rounded shapes. Cards are the one **responsive** radius in the system — 16px on mobile (<768px), 20px on tablet (768–1023px), 24px on desktop (≥1024px) — implemented as a plain CSS custom property (`--radius-cards`) overridden per breakpoint, specifically *not* as a `@theme inline` token, because `@theme inline` bakes a literal value into generated utility CSS that a later media query can't reach. No container in the live UI uses a radius below 12px.

## Components

Real, currently-used component classes (`src/app/globals.css`'s `@layer components`) and React components (`src/components`):

- **Buttons** — five classes, each tied to a specific role, not interchangeable: `.btn-solid-black` (the actual primary CTA — feedback confirm, quiz CTAs, bookmark empty-state), `.btn-outline-black` (quiz "다시 풀기," sized to match `.btn-solid-black` exactly via compensating 1px padding), `.btn-ghost` (secondary/pill action), `.btn-neutral` (light pill action). `.btn-primary` exists but is unused — see Elevation & Depth.
- **Badges** — `.badge-outline` (default category tag, transparent/bordered), `.badge-filled` (`iron` background, used for the hero's translucent-white variant too — see `trend/[id]/page.tsx`'s inline comment on why that one isn't `.badge-filled` itself), `.badge-accent` (orange, reserved for sparse highlight chips; text is `primary`/obsidian, not `surface`/white — white-on-ember measured 3.13:1 against WCAG AA's 4.5:1 minimum, obsidian-on-ember measures 6.36:1). Not currently rendered anywhere in the live app, same as `.btn-primary`.
- **Surfaces** — `.surface-card` (white, responsive radius, the default card), `.surface-card-subtle` (`#fafafa`, flat 16px radius, recessed content), `.surface-info-box` (`#F7F9FB`, nested boxes inside expression cards — intentionally a different gray from `.surface-card-subtle` even though both are "subtle backgrounds," because they appear side-by-side on the trend detail page and need to read as distinct), `.surface-dark` (graphite background, inverted text).
- **Typography presets** — `.type-heading`, `.type-caption`, `.type-caption-strong`, `.type-body-kr`. See "Typography presets vs. size tokens" above for what each bundles and exactly which call sites use them.
- **`TrendCard` / `ExpressionCard`** — the two real content-card React components; everything else reusable is a CSS class, not a component.
- **`FeedbackModal`** — the only modal in the app. Hand-built (no portal, no external dialog library — see Do's and Don'ts), with `role="dialog"`/`aria-modal`, Escape-to-close, background scroll lock, a keyboard focus trap, and focus returned to whatever triggered it on close.

## Do's and Don'ts

- **Reuse the ten typography tokens (`text-caption` … `text-heading`) instead of a new arbitrary `text-[Npx]`.** This exact duplication (119 repeated arbitrary sizes across 18 files) was the design system's biggest real gap until this revision closed it — don't reopen it.
- **Reuse `.btn-*` / `.badge-*` / `.surface-*` classes for new buttons, badges, and cards instead of hand-rolling new ones.** `CATEGORY_BADGE_CLASS` was independently redeclared in three files before being consolidated into one shared export — new one-off component styling tends to drift the same way.
- **On mobile, let unpredictable-length text (Korean titles especially) wrap — never `truncate` it without an explicit reason.** The trend detail page's Korean subtitle used to `truncate` unconditionally and cut titles off on narrow screens; it now wraps on mobile and only truncates from `sm:` up, where the original single-line layout was actually verified to fit.
- **Elevation is a 1px `cloud` border, not a shadow.** The live UI has no working box-shadow anywhere; don't add one to a new card or badge to "lift" it — match the existing hairline-border pattern instead.
- **Don't introduce a new raw hex color when an existing token already names that value.** This system still has two known drifts from exactly this pattern: `--color-paper`'s real value (`#fafbfc`) silently diverged from what this document used to claim (`#f4f4f5`); and `#111111` is used directly in three places instead of through a token. (A third — `text-terracotta`, an undefined color class on the feedback form's error message — was found and fixed: it now reuses `rose-700`, the same Tailwind color already used for the quiz's "wrong answer" state, rather than adding a new token.) Search the token list above before typing a new `#` value.

## Reference Material (preserved, not current implementation)

The sections below are carried over from the original "Awesomic" style-reference extraction this system was bootstrapped from. They describe that reference site's own components, imagery strategy, and brand comparisons — not anything implemented in Catchy. Kept here (rather than deleted) because they may still be useful context for *why* a color or radius was chosen even though the component itself was never built. The complete, unedited original document is also preserved at `DESIGN.md.bak`.

### Reference components (not implemented in Catchy)

Category Card (image-top, 36px radius), Dark Feature Card (arrow-bullet list), Logo Strip (grayscale partner logos), Stats Block (large-number metrics), Breakthrough Image Section (full-bleed nature photography divider), and an Email Input Field sized for a newsletter-signup hero — none of these exist in Catchy. (Catchy does have a `.field-input` class, but it's used for the feedback-modal textarea and quiz answer resting-state, not an email capture form.)

### Reference imagery strategy (not implemented in Catchy)

> Photography plays a structural role rather than decorative: full-bleed landscape/macro nature shots (green moss, organic textures) serve as visual dividers between content sections... Image treatment: no overlays, no duotone, no masks — raw photography with generous corner-radius (48–64px)... roughly 30–40% of viewport is photographic.

Catchy's actual photo usage is narrower: a single hero photo per trend detail page (`resolveTrendImage`), with a dark gradient overlay for text legibility — the opposite of "no overlays" above — and card thumbnails. No nature-photography section dividers exist.

### Reference brand comparisons (describe the reference site, not Catchy)

Linear, Vercel, Stripe, Framer — cited in the original material as visually similar to the *reference* site's zinc-and-hairline-border aesthetic. Left here for the same reason as the rest of this section: context for the inherited visual language, not a claim about Catchy itself.
