# David Becerra Portfolio — Design System (MASTER)

Generated with `ui-ux-pro-max`, adjusted against explicit user color/motion decisions (2026-09-28 session). This file is the source of truth — read it before touching any page.

## Brief

- **Person:** David Sebastian Becerra Davila ("Sebastian" — GitHub `Sebastian0018`)
- **Narrative:** Civil Engineer pivoting into Construction Technology / BIM in Boston. Real construction-management experience (Colombia) + self-taught Python/AI, used as the differentiator.
- **Product type:** Portfolio/Personal — pattern: Hero-Centric Design (tool match, kept)
- **Structure:** Multi-page — Home, Work, About, Contact now. Beyond (photo album/book) is a later phase, not built yet — nav placeholder only.
- **Inspiration:** Illoca (blue/cream, scroll storytelling, microinteractions) — primary reference. Heron AI (GSAP storytelling) — motion reference. Kardev (industrial/corporate restraint) — tone reference. Dribbble "Shipped Engineer Portfolio CV" — not accessible, not used.

## Design Dials

- Variance: 6/10 (Balanced/Modern)
- Motion: 8/10 (Complex — GSAP via CDN, ScrollTrigger reveals, no build step)
- Density: 3/10 (Spacious)

## Colors — overrides the tool's auto-suggested industrial-grey/orange palette per explicit user choice: blue + cream, Illoca-inspired

```css
:root {
  --color-primary: #3B60C5;        /* Illoca blue — links, accents, CTAs */
  --color-primary-dark: #23408F;   /* hover/active state for primary */
  --color-on-primary: #FDF2DE;

  --color-background: #FDF2DE;     /* warm cream */
  --color-surface: #FFFBF3;        /* cards, slightly lighter than bg */
  --color-ink: #14213D;            /* body text — deep navy, not pure black */
  --color-ink-soft: #4A5578;       /* secondary text */
  --color-border: #E7DCC4;         /* warm hairline border on cream */

  --color-accent: #F15534;         /* sparing use only — Heron coral, for rare emphasis (tags, one CTA) */
}

/* Dark mode: invert, keep the same hue family */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0F1626;
    --color-surface: #16213A;
    --color-ink: #F3EEE0;
    --color-ink-soft: #B9C2D9;
    --color-border: #263054;
    --color-primary: #7C97E8;
    --color-on-primary: #0F1626;
  }
}
```

Contrast check: navy `#14213D` on cream `#FDF2DE` ≈ 12:1 (body text safe). Primary blue `#3B60C5` on cream ≈ 5.3:1 (safe for text ≥14px and UI elements). Coral accent is decorative/large-text only — never body copy.

## Typography

**Archivo** (headings, 500/600/700) + **Space Grotesk** (body/UI, 400/500). Both geometric-humanist sans, distinct enough to pair, closer to Illoca/Heron's contemporary-editorial feel than the previous Inter-only setup.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
```

- Base body: 16px / 1.6, Space Grotesk 400
- H1 (hero): Archivo 800, clamp(2.5rem, 6vw, 5rem)
- H2 (section): Archivo 700, clamp(1.75rem, 3.5vw, 2.75rem)
- Nav / labels: Space Grotesk 500, uppercase, letter-spacing 0.04em

## Motion

- Library: GSAP + ScrollTrigger via CDN (`gsap.min.js`, `ScrollTrigger.min.js`) — no build step, static-host safe.
- Hero: staggered fade/slide-up entrance on load (label → h1 → tagline → CTA), 0.6–0.8s, `power3.out`.
- Sections: scroll-triggered fade/slide-up reveal per block (`toggleActions: "play none none reverse"`), stagger 0.08–0.12s between siblings.
- Nav: underline-draw on hover/active (CSS, no JS needed).
- **Respect `prefers-reduced-motion: reduce`** — disable ScrollTrigger reveals and the hero stagger, render final state immediately. This is a hard requirement, not optional polish.
- Explicitly skipped: GSAP Flip page-transitions between separate static HTML pages. Illoca/Heron achieve that inside a JS-routed SPA; faking it across full-page navigations on plain multi-page HTML is flaky (flash of unstyled content, browser back-button breakage) and not worth it for a personal portfolio. Revisit only if the site becomes a JS framework app.

## Layout

- Style: Minimalism & Swiss Style base (grid, generous white/cream space, geometric structure) + Illoca's overlapping-section depth on Home only.
- Max content width: 1120px, side padding 2rem (1.25rem mobile).
- Spacing scale (density 3 → spacious): 8 / 16 / 24 / 40 / 64 / 96px.
- Breakpoints: 375, 768, 1024, 1440.

## Pages (this phase)

| Page | Content |
|---|---|
| `index.html` (Home) | Hero (pivot narrative) + short summary + featured work teaser + CTA to Work/Contact |
| `work.html` | Full experience as case studies: Rochambeau, Ethos Valor (Farmatodo), Alpha Group (Banco de la República), Hidrarco, Javeriana, + WhatsApp bot (marked **paused/prototype**, not finished), + Hydraulic Design Archive (coming soon) |
| `about.html` | Bio + experience narrative only. Skills/certs deliberately deferred — not on this page yet |
| `contact.html` | Email, GitHub, LinkedIn, CV PDF download |
| `beyond.html` | Placeholder only — "coming soon", photo-album/book feature is a separate future build (needs its own architecture: storage, upload/edit UI) |

## Anti-patterns to avoid (from tool + Illoca/Heron read)

- No AI purple/pink gradients, no emoji-as-icons, no 2D-flat-only layout with zero depth
- No motion that can't be paused/skipped (`prefers-reduced-motion` always respected)
- No raw hex scattered in components — use the CSS variables above everywhere

## v2 — Depth pass (2026-09-28, same-day follow-up)

First build read as flat — a single cream page with no rhythm. Sebastian pointed at actual Illoca screenshots (not just the Awwwards text description) and the real DNA was: **alternating full-bleed section backgrounds + floating tilted cards with real shadow + isometric decorative shapes + bold annotation typography**, not a uniform page with subtle fades. v2 adds:

- **`.panel` / `.panel-dark`**: sections alternate cream/navy background, fixed by design (not `prefers-color-scheme` — that would flatten the alternation for OS-dark-mode users, which defeats the whole point). Everything inside a panel reads its colors from `--panel-*` custom properties so components don't need light/dark variants written twice.
- **`.frame-card` / `.card`**: floating surface, `border-radius:10px`, heavy layered box-shadow, resting rotation via `--tilt` (±1.5–2.5deg), rotates to 0 and lifts on hover.
- **`.corner-tag`**: small monospace annotation labels in section corners (`DB · Civil Eng → ConTech`, `42.36°N 71.06°W`, `Fig. 01 —`) — blueprint/technical-drawing convention, doubles as a thematic nod to civil engineering instead of literally copying Illoca's illustration style.
- **`.deco-parallax` / `.deco-shape`**: inline SVG isometric cubes and folded-card shapes (blue + cream, stroke-outlined so they still read against a same-tone background), continuous CSS-keyframe idle float, plus GSAP ScrollTrigger scrub parallax on the wrapper. Two independent transforms on two different elements (wrapper vs. SVG) — deliberately not combined on one element, to avoid transform conflicts.
- **GSAP/transform gotcha (real bug caught this session):** several elements set their resting look via CSS custom-property-driven `transform` (`.card`, `.frame-card`, both use `rotate(var(--tilt))`). GSAP's `x/y/scale/rotate` shorthand writes directly to that same element's inline `transform`, which silently deletes the CSS rotation the moment the tween runs. Fix: **GSAP-animated reveals never target the visually-tilted element directly** — they target a plain wrapper (`.card-wrap`, `.frame-card-wrap`) with no transform of its own; the tilt lives one level down and survives untouched. Apply this pattern to any future tilted/rotated component before wiring it to GSAP.
- Typography got bigger/bolder (hero H1 up to `clamp(3rem, 7.5vw, 6rem)`, was `5rem` max) and `--radius` went from 4px to 10px to match the softer floating-card language.
