# Theme Switcher — Paper / Terminal / Studio

**Date:** 2026-09-17 · **Status:** approved by Robert · **Target:** `index.html` (single-file site)

## Purpose

A nav selector that swaps the entire site aesthetic among three complete design personalities. Part delight, part positioning: it is the first visible "demonstration of what I'm building" exhibit (more planned: agent canaries, LLM chat surfaces). The toggle enacts the Intersection claim — same person, same content, different registers — because only the rendering changes.

## Decisions (settled during brainstorm)

1. **Three themes:** Paper (the current editorial design, unchanged), Terminal (noir mockup, chosen), Studio (grotesk-daylight mockup, chosen). Schematic direction rejected.
2. **Scope level:** full personality per theme on a shared skeleton. Same DOM, same content, no per-theme markup duplication. Layout treatments may differ per section; copy never differs.
3. **Selector:** named chips in the nav — PAPER · TERMINAL · STUDIO. Not a hidden cycle button, not a floating widget.
4. **Default:** Paper. No-JS, crawlers, and agents get Paper.

## Behavior

- Clicking a chip sets the theme instantly (≈300ms body opacity fade; animate opacity only).
- Persistence: `localStorage` key `siteTheme` ∈ `paper|terminal|studio`.
- FOUC guard: tiny inline script in `<head>` reads `localStorage` and sets `data-theme` on `<html>` before first paint. Wrapped in try/catch; any failure → Paper.
- Content, structure, meta, and URLs are identical across themes: zero SEO impact.

## Architecture

- `<html data-theme="...">` is the single switch. Absent/`paper` → current CSS applies untouched.
- CSS layering inside `index.html` (stays single-file per project convention):
  1. Existing CSS = base = Paper. Not rewritten.
  2. `[data-theme="terminal"]` block: redefines `:root`-equivalent tokens (colors, font stacks) scoped to the attribute, then per-section structural overrides.
  3. `[data-theme="studio"]` block: same pattern.
- Fonts: add IBM Plex Mono (400/600/700) and Inter (400/700/800/900) to the existing Google Fonts link. Loaded for all themes (cost accepted; avoids swap-time font flashes).
- **Targeted refactor riding along:** hardcoded `#4A80AA`/fill colors inside inline SVG icons change to `currentColor` (plus a `color` on `.quad-icon`/`.offer-icon` in base CSS preserving today's rendering) so themes recolor the icon system with one rule.
- Existing JS (reveal observer, glow tracking, nav scroll) is theme-agnostic and untouched.

## Theme specifications

### Paper
The current site. No visual changes. Acts as the reference: if Paper renders one pixel different after this project, that is a bug.

### Terminal
- Tokens: bg `#0B0E12`; panel `#10151C`; text `#E8ECF2`; muted `#8A97AB`; accent `#5FA8E0`; rules/borders `#223046`.
- Type: IBM Plex Mono everywhere (display, body, labels). Headline weight 700, letter-spacing ~`-0.02em`.
- Hero: faint blueprint grid (CSS gradients) over bg; blinking block cursor after the headline via `::after` (opacity keyframes; hidden under `prefers-reduced-motion`); CTA becomes bordered mono uppercase (`GET_IN_TOUCH →`).
- Section labels (`.label`, eyebrows): `//` prefix via `::before`, accent color, tracking loosened.
- Cards (quadrants, offers, testimonials, projects): panel bg, 1px `#223046` border, square corners; glow layer recolored to accent hue.
- Photos: `filter: grayscale(1) contrast(1.05)` plus a blue tint overlay on existing wrappers (reuse `::before/::after` hooks where present); client logos `filter: invert(1)` variants.
- Icons: `color` → accent.
- Selector chip active state: filled accent on dark.

### Studio
- Tokens: bg `#FFFFFF`; text `#0A0A0A`; muted `#555555`; hairline `#EAEAEA`; accent = black (single blue moment allowed on the hero em).
- Type: Inter for display and labels — headlines 800/900 with `-0.04em` tracking; body stays a readable sans (Inter 400); section markers in IBM Plex Mono, lowercase, gray, `// section_name` style via `::before`/text-transform.
- Buttons/CTAs: black pills, white text, full rounding.
- Cards: flat white, hairline borders, 14–16px radius, soft neutral shadows on hover.
- Photos: untreated full color; dissolves/fades removed (`background: none` on gradient overlays).
- Icons: `color` → near-black.

## Selector UI

- Markup: a `.theme-switch` group of three `<button>` chips in `.nav-right`, `aria-pressed` reflecting the active theme.
- Desktop: uppercase micro-labels (Raleway in Paper; theme fonts restyle the chips like everything else). Active chip filled; hover, focus-visible, and active states on all three (project hard rule).
- Mobile <640px: labels compress to initials P · T · S.

## Non-goals / out of scope

- No per-theme copy differences, no theme-specific sections, no new imagery/assets.
- No `prefers-color-scheme` auto-selection (Terminal is a personality, not a dark mode).
- No dev font picker resurrection; no changes to the DYC showcase or other subprojects in the repo.

## Verification

- Screenshot matrix: 3 themes × {hero, What I Offer, Special Projects, About} at 1440px, plus hero + one section at 430px. Minimum two comparison rounds against the approved mockups (`.superpowers/brainstorm/*/content/builder-aesthetic.html` renders them).
- Paper regression check: before/after screenshots of Paper must be visually identical.
- Manual checks: switch persistence across reload; FOUC guard (hard refresh on Terminal); no-JS renders Paper; reduced-motion hides cursor blink; chip states.

## Cost accepted

Roughly +900–1200 lines of CSS. Every future section added to the site is styled three times. Robert accepted this trade explicitly.
