# Paper & Moss — Style Reference
> warm editorial paper grid with a single reserved moss-green signal.

**Theme:** light

Re-skinned from the original "Awesomic" zinc/orange system on 2026-10-14. Token *names* are unchanged on purpose (every component still references `bg-obsidian`, `text-ember`, etc.) — only the underlying values moved from a cool zinc-gray register to a warm paper/ink one, plus one new token (`--color-terracotta`) for error/incorrect states that the old system had no dedicated color for.

Paper & Moss operates in a warm, paper-first visual register: an ivory-to-ink neutral scale (warm taupes and blacks, never cool grays) carries nearly the entire interface, with one reserved moss-green accent (the system's "One Signal Rule") and a muted terracotta reserved exclusively for error/incorrect states. Elevation comes from soft, warm-toned, low-opacity shadows (the "Paper Lift Rule") layered on top of — not instead of — the existing hairline borders. Geist handles every typographic role at the same scale the old system used. The atmosphere is that of a warm, considered editorial surface: quiet ivory canvas, soft paper-lift cards, and color deployed as functional punctuation rather than decoration.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Ink Black | `#17140f` | `--color-obsidian` | Primary action buttons, hero headlines, dominant text — the deepest warm near-black that grounds every dark CTA and display heading against the ivory canvas |
| Graphite | `#211d14` | `--color-graphite` | Body text, nav text, badge ink — the working near-black ink color across paragraphs, links, and labels |
| Slate | `#332c1d` | `--color-slate` | Reserved for the ink family; not currently used by any shipped component |
| Soft Graphite | `#5c584e` | `--color-iron` | Ghost-button text/border, filled-badge background — the mid-tone used for secondary UI labels and outlined-button text |
| Steel | `#6e6652` | `--color-steel` | Icon strokes, supporting metadata |
| Warm Taupe | `#8c8673` | `--color-fog` | Helper text, tertiary labels — muted copy and supporting metadata |
| Ash | `#afa68f` | `--color-ash` | Placeholder text, disabled labels, hover-from states |
| Mist | `#d6ccb0` | `--color-mist` | Secondary text on dark surfaces, soft dividers |
| Hairline Taupe | `#e4dcc8` | `--color-cloud` | Primary border color across the system — 1px hairline rules on cards, badges, and inputs |
| Warm Ivory | `#f8f3e8` | `--color-paper` | Canvas background, subtle card fills — the page's warm ground |
| Paper (surface) | `#fffdf8` | `--color-snow` | Elevated surfaces (cards on canvas), input fields, button backgrounds for ghost/neutral actions |
| Moss Signal | `#5b6b3e` | `--color-ember` | The system's single reserved accent — correct-answer states, accent badges, highlight chips. The One Signal Rule: used sparingly, never for general UI |
| Muted Rose | `#c9a3a0` | `--color-magenta-spark` | Reserved, thematically-consistent decorative accent; not currently used by any shipped component |
| Muted Terracotta | `#b6694f` | `--color-terracotta` | The system's one error/incorrect signal — wrong-answer states only |

## Tokens — Typography

### Geist — Single-family type system for everything: 56–64px weight 600 display headlines with tight 1.12–1.28 line-height, 32–40px weight 600–700 section headings, 14–16px weight 400 body and UI text, 12–13px weight 400 badge and meta labels · `--font-geist-sans`
- **Mono companion:** Geist Mono (`--font-geist-mono`) — reserved for the rare monospace/measurement case, not a general UI font
- **Weights:** 400, 500, 600, 700 (as deployed; Geist itself ships a fuller variable range)
- **Sizes:** 10, 12, 13, 14, 15, 16, 18, 20, 32, 40, 56, 64
- **Line height:** 1.0–1.8
- **Letter spacing:** normal across all steps (no tracking adjustments)
- **Role:** Single-family type system for everything: 56–64px weight 600 display headlines with tight 1.12–1.28 line-height, 32–40px weight 600–700 section headings, 14–16px weight 400 body and UI text, 12–13px weight 400 badge and meta labels

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | — | — | 12px | 1.64 | — | `--text-caption` |
| body | — | — | 15px | 1.45 | — | `--text-body` |
| body-lg | — | — | 18px | 1.45 | — | `--text-body-lg` |
| subheading | — | — | 20px | 1.5 | — | `--text-subheading` |
| heading-sm | — | — | 32px | 1.5 | — | `--text-heading-sm` |
| heading | — | — | 40px | 1.28 | — | `--text-heading` |
| heading-lg | — | — | 56px | 1.28 | — | `--text-heading-lg` |
| display | — | — | 64px | 1.12 | — | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** compact

Spacing scale, border radii, and layout values are unchanged from the original system — only colors, shadows, and typography moved.

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 28 | 28px | `--spacing-28` |
| 32 | 32px | `--spacing-32` |
| 36 | 36px | `--spacing-36` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |
| 64 | 64px | `--spacing-64` |
| 68 | 68px | `--spacing-68` |
| 80 | 80px | `--spacing-80` |
| 120 | 120px | `--spacing-120` |

### Border Radius

| Element | Value |
|---------|-------|
| cards | 36px |
| icons | 40px |
| pills | 10000px |
| badges | 12px |
| inputs | 14px |
| buttons | 14px |

### Shadows — "Paper Lift Rule"

Depth comes from a soft, warm-toned, low-opacity shadow layered on top of the existing hairline border — never a hard, cool, or glossy shadow, and never a border-only or shadow-only treatment.

| Name | Value | Token | Used on |
|------|-------|-------|---------|
| rest | `0 1px 2px rgba(23, 20, 15, 0.04), 0 8px 24px rgba(23, 20, 15, 0.05)` | — | `.surface-card`, `.btn-primary` resting state |
| hover | `0 14px 32px rgba(23, 20, 15, 0.1)` | — | `.surface-card:hover`, `.btn-primary:hover` |

### Layout

- **Page max-width:** 1200px
- **Section gap:** 80px
- **Card padding:** 28px
- **Element gap:** 8px

## Components

### Primary Action Button (Dark Filled)
**Role:** Main CTA — 'Book demo', 'Get started', 'Get match'

Background `#17140f` (Ink Black), `#fffdf8` text, 14px border-radius, 12px vertical / 16px horizontal padding, 14px Geist weight 400. Elevation is the Paper Lift Rule's soft warm shadow (rest → hover), not the old hard inset-highlight treatment.

### Ghost Action Button (White)
**Role:** Secondary CTA on dark backgrounds

Background `#fffdf8`, text `#5c584e` (Soft Graphite), 1px solid `#5c584e` border, 10000px pill radius, 20px all padding, 14px Geist.

### Neutral Pill Button (Light)
**Role:** Subtle action on light backgrounds — 'Our work'

Background `#f8f3e8` (Warm Ivory), text `#211d14`, 14px border-radius, 12px vertical / 16px horizontal padding, 14px Geist weight 400. No visible border — relies on the subtle background contrast against `#fffdf8` surfaces.

### Category Card (Image Top)
**Role:** Service category showcase — 'Web & product', 'Motion design'

Full-width image fills the top half, 36px border-radius, 28px bottom padding, Paper Lift Rule soft shadow. Title overlay or below image at 20px Geist weight 600. Tag pills sit inside the card at bottom.

### Dark Feature Card
**Role:** Pain-point listing with arrow bullets

Background `#332c1d` or `#211d14`, `#fffdf8` text, 28–36px border-radius, 24px padding. Each list item has a 20px Geist weight 500 with right-arrow accent. Creates a warm dark band that contrasts with the ivory page.

### Tag Pill Badge
**Role:** Category tags — 'Web', 'UX/UI design', 'Mobile app'

Transparent background with 1px solid `#e4dcc8` (Hairline Taupe) border, text `#211d14`, 12px border-radius, 4px vertical / 8px horizontal padding, 12–13px Geist weight 400. Hairline border treatment keeps tags quiet.

### Filled Tag Badge
**Role:** Accent tags — 'Software development', 'Marketing'

Background `#5c584e` (Soft Graphite), text `#fffdf8`, 12px border-radius, 4px/8px padding. Used for skill/category labels that need more visual weight than outlined tags.

### Moss Accent Badge
**Role:** Highlight chips, correct-answer markers, category emphasis

Background `#5b6b3e` (Moss Signal), white text, 12px border-radius, 4px/8px padding. The sole chromatic badge — reserved for sparse highlight/count chips only. **The One Signal Rule.**

### Error / Incorrect Signal
**Role:** Wrong-answer state in quizzes and validation errors

Text and subtle fill in `#b6694f` (Muted Terracotta) at ~10–30% opacity over the base surface — e.g. `border-terracotta/30 bg-terracotta/10 text-terracotta`. This is the system's only other reserved chromatic signal besides Moss, and it is never used for anything but error/incorrect states.

### Email Input Field
**Role:** Hero email capture, newsletter signup; also the resting state for quiz answer options

Background `#fffdf8`, text `#211d14`, 14px border-radius, 12px vertical / 16px horizontal padding, 1px solid `#e4dcc8` border.

### Logo Strip
**Role:** Social proof — partner/client logos

Grayscale logos rendered in `#8c8673` (Warm Taupe) at 60–70% opacity, horizontally centered with even spacing. No background container.

### Stats Block
**Role:** Headline metrics — '20 000+ completed projects'

Large number at 40–56px Geist weight 600 in `#17140f`, adjacent descriptor at 14px weight 400 in `#6e6652`. Minimal spacing between number and label.

### Breakthrough Image Section
**Role:** Full-bleed visual divider — landscape/moss

Full-width photographic image (no overlay, no text), 48px or 64px corner radius on top corners, functions as a visual breath between content sections.

### Navigation Bar
**Role:** Top-level site navigation

Sticky ivory/paper header, logo left, nav links center (14px Geist), login + dark CTA button right. No visible border — floats on canvas.

## Do's and Don'ts

### Do
- Use `#17140f` for all primary action buttons — the ink-black fill is the system's single most important interactive element
- Set card border-radius to 36px and pair 1px solid `#e4dcc8` hairline borders with the Paper Lift Rule's soft warm shadow for elevation
- Keep body text at 14–15px Geist weight 400 in `#211d14` — compact, dense, considered
- Reserve `#5b6b3e` (Moss) exclusively for the single reserved accent role — correct-answer states, highlight chips, category emphasis — never general UI
- Reserve `#b6694f` (Terracotta) exclusively for error/incorrect states — never anything else
- Use 56–64px Geist weight 600 with line-height 1.12–1.28 for hero and section display headlines
- Apply 28px padding inside cards and 80px vertical rhythm between major page sections
- Use 10000px border-radius for pill-shaped CTAs in the navigation, and 14px for inline action buttons

### Don't
- Do not introduce new accent colors beyond Moss and Terracotta — the system is still overwhelmingly achromatic; adding blues, purples, or extra greens would break the restrained register
- Do not use hard, cool, or glossy drop shadows — only the warm low-opacity Paper Lift Rule shadow values, always paired with the `#e4dcc8` hairline border
- Do not set display headlines below weight 600 — the bold weight is what makes the editorial typography read as authoritative
- Do not use `#5b6b3e` or `#b6694f` for body text, links, or large fills — they are reserved signal colors, not brand colors for general UI
- Do not use border-radius below 12px on any container — the system's geometry is defined by generous rounding
- Do not break the single-font rule — Geist handles every typographic role from 10px badges to 64px displays (Geist Mono is the one reserved exception, for monospace/measurement content only)
- Do not use pure black (#000000) or any cool-toned gray — `#17140f` is the deepest permitted ink, and every neutral in the scale must carry warmth

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Canvas | `#f8f3e8` | Page background — Warm Ivory that fills the viewport |
| 1 | Card | `#fffdf8` | Elevated content surfaces sitting on the canvas |
| 2 | Subtle Card | `#f8f3e8` | Slightly recessed surfaces within content areas (same as canvas) |
| 3 | Dark Surface | `#211d14` | Dark feature blocks and inverted sections |
| 4 | Deep Dark | `#332c1d` | Darker feature cards and dark-mode accents |

## Elevation

- **Primary Dark Button:** rest `0 1px 2px rgba(23,20,15,0.04), 0 8px 24px rgba(23,20,15,0.05)` → hover `0 14px 32px rgba(23,20,15,0.1)`
- **Card:** rest `0 1px 2px rgba(23,20,15,0.04), 0 8px 24px rgba(23,20,15,0.05)` → hover `0 14px 32px rgba(23,20,15,0.1)`, paired with the `#e4dcc8` hairline border (shadow supplements the border, never replaces it)
- **Link/Pill:** no shadow — border-only, as in the original system

## Imagery

Photography plays a structural role rather than decorative: full-bleed landscape/macro nature shots (moss, organic textures — reinforcing the Moss Signal accent) serve as visual dividers between content sections, creating breath and warmth against the ivory canvas. Category cards use real product/work imagery filling the top half of rounded card containers. No illustrations or abstract graphics; no 3D renders. Logos in social-proof strips are desaturated to grayscale but keep a warm cast rather than cool gray. Image treatment: no overlays, no duotone, no masks — raw photography with generous corner-radius (48–64px) to integrate with the rounded geometry of cards and sections.

## Layout

The page follows a centered max-width (1200px) container with generous vertical rhythm (80px section gaps). The hero is a split composition: massive left-aligned headline (56–64px) paired with a compact right-aligned email-capture form and supporting paragraph. Below the hero, a horizontal scroll of category image-cards creates a portfolio band. The mid-page alternates light card sections with dark feature blocks — a rhythm of `#f8f3e8` canvas, `#fffdf8` cards, then inverted `#211d14` dark surface for pain-point lists. Stats appear as a horizontal row of three large-number blocks. A full-bleed nature photograph breaks the grid before testimonial/social-proof sections. Navigation is a sticky ivory top bar with logo left, centered nav links, and a dark CTA right. The overall feel is warm editorial-magazine meets considered product dashboard: spacious section gaps but compact internal card density.

## Agent Prompt Guide

**Quick Color Reference**
- Background: `#f8f3e8`
- Card surface: `#fffdf8`
- Text primary: `#17140f`
- Text secondary: `#211d14`
- Text muted: `#6e6652`
- Border: `#e4dcc8`
- Accent (reserved): `#5b6b3e`
- Error (reserved): `#b6694f`
- Primary action: `#17140f` (filled action)

**Example Component Prompts**

1. *Hero Section*: Canvas `#f8f3e8` background. Headline at 64px Geist weight 600, `#17140f`, line-height 1.12. Below, supporting paragraph at 15px Geist weight 400, `#6e6652`. Email input: `#fffdf8` background, 14px border-radius, 12px/16px padding, paired with dark CTA (`#17140f` fill, `#fffdf8` text, 14px radius, 12px/16px padding, Paper Lift Rule shadow). 80px vertical padding above and below.

2. *Category Card Grid*: Each card is `#fffdf8` with 36px border-radius, 1px solid `#e4dcc8` border, and the Paper Lift Rule soft shadow. Image fills top half (no padding, flush to card edges). Bottom area has 28px padding containing a 20px Geist weight 600 title in `#17140f` and tag pills below (transparent background, 1px `#e4dcc8` border, 12px radius, 4px/8px padding, 13px text in `#211d14`). 3–4 cards in a horizontal row with 16px gap.

3. *Dark Feature Block*: Background `#332c1d`, 28px border-radius, 24px all padding. White headline at 32px Geist weight 700. List items below: each prefixed with a right-arrow icon, 20px Geist weight 500 in white, 16px vertical gap between items.

4. *Moss Accent Badge*: Background `#5b6b3e`, white text, 12px border-radius, 4px/8px padding, 12px Geist weight 500. Use only for the single reserved accent role — never general UI.

5. *Stats Row*: Three blocks side by side. Large number at 56px Geist weight 600 in `#17140f`. Adjacent label at 14px Geist weight 400 in `#6e6652`, sitting to the right of the number on the same baseline.

## Geometry Philosophy

The system's spatial language is defined by three radii that repeat everywhere: 12px for tags and small controls, 14px for buttons and inputs, and 36px for cards and large surfaces. Pill shapes (10000px) appear only in navigation CTAs. This creates a consistent visual rhythm where corners curve generously on containers but stay controlled on interactive elements. No sharp corners (0px) are used on visible UI — even the smallest chips get 12px rounding. The asymmetry between 14px (buttons) and 36px (cards) is deliberate: buttons feel precise and contained, cards feel inviting and spacious.

## Similar Brands

- **Linear** — Same hairline-border-driven card treatment and compact 14px body text on generous rounded cards, but swapped to a warm paper palette
- **Notion** — Warm off-white canvas, soft paper-toned surfaces, restrained single accent color
- **Stripe** — Editorial-grade typography with bold display weights at 48–64px, generous section spacing, hairline border card treatments
- **Framer** — Rounded geometry (28–36px cards), neutral-first palette with occasional vivid accent, marketplace-style dense information layout

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-obsidian: #17140f;
  --color-graphite: #211d14;
  --color-slate: #332c1d;
  --color-iron: #5c584e;
  --color-steel: #6e6652;
  --color-fog: #8c8673;
  --color-ash: #afa68f;
  --color-mist: #d6ccb0;
  --color-cloud: #e4dcc8;
  --color-paper: #f8f3e8;
  --color-snow: #fffdf8;
  --color-ember: #5b6b3e;
  --color-magenta-spark: #c9a3a0;
  --color-terracotta: #b6694f;

  /* Typography — Font Families */
  --font-geist-sans: 'Geist', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-geist-mono: 'Geist Mono', ui-monospace, monospace;

  /* Typography — Scale */
  --text-caption: 12px;
  --leading-caption: 1.64;
  --text-body: 15px;
  --leading-body: 1.45;
  --text-body-lg: 18px;
  --leading-body-lg: 1.45;
  --text-subheading: 20px;
  --leading-subheading: 1.5;
  --text-heading-sm: 32px;
  --leading-heading-sm: 1.5;
  --text-heading: 40px;
  --leading-heading: 1.28;
  --text-heading-lg: 56px;
  --leading-heading-lg: 1.28;
  --text-display: 64px;
  --leading-display: 1.12;

  /* Typography — Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-unit: 4px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-28: 28px;
  --spacing-32: 32px;
  --spacing-36: 36px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-68: 68px;
  --spacing-80: 80px;
  --spacing-120: 120px;

  /* Layout */
  --page-max-width: 1200px;
  --section-gap: 80px;
  --card-padding: 28px;
  --element-gap: 8px;

  /* Border Radius */
  --radius-md: 6px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-2xl-2: 20px;
  --radius-3xl: 24px;
  --radius-3xl-2: 28px;
  --radius-3xl-3: 36px;
  --radius-3xl-4: 40px;
  --radius-full: 48px;
  --radius-full-2: 56px;
  --radius-full-3: 64px;
  --radius-full-4: 80px;
  --radius-full-5: 1000px;
  --radius-full-6: 10000px;

  /* Named Radii */
  --radius-cards: 36px;
  --radius-icons: 40px;
  --radius-pills: 10000px;
  --radius-badges: 12px;
  --radius-inputs: 14px;
  --radius-buttons: 14px;

  /* Shadows — Paper Lift Rule */
  --shadow-rest: 0 1px 2px rgba(23, 20, 15, 0.04), 0 8px 24px rgba(23, 20, 15, 0.05);
  --shadow-hover: 0 14px 32px rgba(23, 20, 15, 0.1);

  /* Surfaces */
  --surface-canvas: #f8f3e8;
  --surface-card: #fffdf8;
  --surface-subtle-card: #f8f3e8;
  --surface-dark-surface: #211d14;
  --surface-deep-dark: #332c1d;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-obsidian: #17140f;
  --color-graphite: #211d14;
  --color-slate: #332c1d;
  --color-iron: #5c584e;
  --color-steel: #6e6652;
  --color-fog: #8c8673;
  --color-ash: #afa68f;
  --color-mist: #d6ccb0;
  --color-cloud: #e4dcc8;
  --color-paper: #f8f3e8;
  --color-snow: #fffdf8;
  --color-ember: #5b6b3e;
  --color-magenta-spark: #c9a3a0;
  --color-terracotta: #b6694f;

  /* Typography */
  --font-geist-sans: 'Geist', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-geist-mono: 'Geist Mono', ui-monospace, monospace;

  /* Typography — Scale */
  --text-caption: 12px;
  --leading-caption: 1.64;
  --text-body: 15px;
  --leading-body: 1.45;
  --text-body-lg: 18px;
  --leading-body-lg: 1.45;
  --text-subheading: 20px;
  --leading-subheading: 1.5;
  --text-heading-sm: 32px;
  --leading-heading-sm: 1.5;
  --text-heading: 40px;
  --leading-heading: 1.28;
  --text-heading-lg: 56px;
  --leading-heading-lg: 1.28;
  --text-display: 64px;
  --leading-display: 1.12;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-28: 28px;
  --spacing-32: 32px;
  --spacing-36: 36px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-68: 68px;
  --spacing-80: 80px;
  --spacing-120: 120px;

  /* Border Radius */
  --radius-md: 6px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-2xl-2: 20px;
  --radius-3xl: 24px;
  --radius-3xl-2: 28px;
  --radius-3xl-3: 36px;
  --radius-3xl-4: 40px;
  --radius-full: 48px;
  --radius-full-2: 56px;
  --radius-full-3: 64px;
  --radius-full-4: 80px;
  --radius-full-5: 1000px;
  --radius-full-6: 10000px;

  /* Shadows — Paper Lift Rule */
  --shadow-rest: 0 1px 2px rgba(23, 20, 15, 0.04), 0 8px 24px rgba(23, 20, 15, 0.05);
  --shadow-hover: 0 14px 32px rgba(23, 20, 15, 0.1);
}
```
