# David Becerra Portfolio — Design System (MASTER)

> **Current version: v5 ("Blueprint", 2026-09-29) — see the last section. It supersedes everything above it (v1–v4 are kept as history).**
>
> **Content rule (applies to every version):** every claim must match `CV_David_Becerra_updated.pdf`: titles, dates, numbers. No "5+ years". Python is shown as *learning (beginner)*, never as a skill. The site says openly that it was built with AI (Claude Code).

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
| `beyond.html` | Photo gallery — one-photo horizontal slider, 24 frames from `photos/` (see v3). Upload/edit from the browser is still out of scope (would need storage + auth) |

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

## v3 — Illoca pass (2026-09-29)

Sebastian sent a full Illoca hero screenshot as the target look. v2's navy/cream alternation and tilted floating cards were replaced with Illoca's actual language: a drafting sheet.

**Tokens** (`style.css :root`):

```css
--cobalt: #1F4FD1;        /* page frame, CTAs, links, accents */
--cobalt-dark: #173C9E;   /* CTA hover */
--coral: #F15534;         /* ONLY the small tile inside the nav CTA + focus ring */
--paper: #EDE3CB;         /* sheet background (graph paper) */
--paper-surface: #F4EDDC; /* cards */
--paper-line: #D6C9A8;    /* borders, dashed rules */
--paper-shadow: #C9BA95;  /* hard offset card shadow */
--ink: #2B2B2B;           /* headlines — dark grey, not black */
--ink-soft: #5A5648;      /* body */
--on-cobalt: #F4EDDC;
```

Light-only by design (`color-scheme: light`): the paper sheet is the identity, a dark variant would erase it.

**Typography:** Archivo 400–600 for headlines (hero weight 500, tracking −0.045em); Space Grotesk for body; **IBM Plex Mono** for nav, eyebrows, dates, tags and buttons; **Architects Daughter** for handwritten annotations and card indexes.

**Structure:**
- `body` is cobalt with `--frame` padding (20px, 8px on phones). The `.sheet` inside is the graph paper: 12px minor grid plus 60px major grid via 4 linear-gradients, with an SVG-noise grain overlay. `overflow-x: clip`, not `hidden`, so the sticky nav keeps working.
- The footer sits outside the sheet, directly on the cobalt frame. A `.band` that is the sheet's last child runs flush into it.
- **Nav:** a centered floating pill (`.nav-inner`) with the I-beam logo mark, mono links and a cobalt CTA with a coral tile. Corner annotations outside it: `.sheet-coords` (Boston lat/long, mono) and `.sheet-mail` (handwritten email). Both are hidden under 1180px.
- **Hero:** centered `.hero-title` with each line in a `.line` span. Above 1100px the lines are `nowrap`, so the inline-block shrinks to the text and the `.annot-left`/`.annot-right` handwritten annotations sit right against it. Their SVG strokes have class `draw`, and GSAP animates `stroke-dashoffset` to draw them in.
- **Duotone photo** (`.hero-figure`) is Illoca's illustration slot. The inline SVG filter `#duotone-cobalt` (in `index.html`) runs a grayscale matrix, then a 3-stop table: navy → cobalt → paper. Swap the photo by changing the `src`, since the filter doesn't touch the file.
- **Cards** (`.card`, `.frame-card`, `.timeline-item`, `.contact-links`, `.slide`): flat, 2px radius, 1px `--paper-line` border, `4px 4px 0 var(--paper-shadow)` hard shadow, hover nudges −2px with a 6px shadow. A handwritten `.card-index` ("01", "Note —") sits at the top. There is no tilt anymore, so the v2 wrapper rule is moot, but the `.card-wrap` wrappers are kept as GSAP stagger targets.
- **Deco shapes:** isometric cube and fold as cobalt **outlines** (`stroke: currentColor`, `.fill-soft` for a 14% tint). Fewer per page, hidden under 900px.

**Beyond slider** (replaces the v2 two-page flip book, which stuttered because it swapped `src` mid-flip and drove `rotateY` from JS every frame):
- The `.slider-track` flex row is moved by a single CSS `transition: transform .65s cubic-bezier(.22,1,.36,1)` on `translate3d`, which is compositor-only.
- `offsetFor(i)` centers slide i. Neighbors peek at `opacity .4; scale .94`.
- Pointer-events drag with `setPointerCapture`: the track follows the finger with the transition off, then snaps with a threshold of `min(80px, 12% width)` and resists at the ends. A plain click on a peeking slide goes to it.
- Arrows, ←/→ keys and the thumbnail strip (auto-centers the active thumb) all work. Lazy images are promoted to eager for i−1..i+2.
- Slides are static markup, generated from `photos/manifest.json` (real `width`/`height` attributes, so there's no layout shift).
- **Gotcha found in v3:** `<img width height>` attributes beat CSS `aspect-ratio` unless `height: auto` is set. It is now in the global reset.

**Cache busting:** `style.css?v=N` / `script.js?v=N` in all 5 pages. Bump N on every deploy, because GitHub Pages and browsers otherwise serve the old files for a while.

## v4 — "Sketch on concrete" (2026-09-29, same day)

Sebastian felt v3 copied Illoca too closely. v4 drops every Illoca signature (cobalt frame, blue grid paper, pill nav, duotone photo, Plex Mono / Architects Daughter) and mixes three references:

1. **The1 style reference, used for structure.** Flat concrete canvas `#D9D9D9` with near-black ink `#1F1F1F`. Building-scale condensed display type (line-height 0.8, negative tracking). Dark pill buttons are the only button style, and each one sits after a short question ("See the projects? [View work →]"). Hairline 1px dividers, a 48px circle menu button, and a full-screen red menu with a giant cropped "D". Four paint colors are used as full-bleed identity blocks, never as text colors.
2. **The hand-drawn wireframe, used for the details.** `.sketch-box` wobbly borders come from uneven elliptical `border-radius`. Handwritten labels (`.label`, Patrick Hand) sit above fields. Orange `--sketch` notes have hand-drawn arrows, and `.todo` checkboxes appear as "Talking points". Contact is laid out as a one-column wireframe form.
3. **The skyline sketch, used for the Home hero.** A hand-drawn **Boston skyline written entirely as inline SVG**, with no spider. It includes the Custom House Tower, a building under construction with a swinging yellow crane, the Prudential and Hancock towers, the Zakim Bridge, trees, a plane, birds, "Hola / Welcome" bubbles, and colored underground pipes labeled "water + gas networks" as a nod to the hydrosanitary work. The shared `#sketchy` filter (feTurbulence + feDisplacementMap, defined once per page right after `<body>`) wobbles every stroke. Buildings rise on load via GSAP.

**Tokens:** `--concrete #D9D9D9`, `--iron #1F1F1F`, `--green #027B49`, `--pink #F19EC8`, `--red #FA4D43`, `--yellow #FBB833`, `--sketch #C9401A`.

**Fonts:** Barlow Condensed 500 for display, Barlow 400/500 for body, Patrick Hand for the sketch layer.

**Page colors (wayfinding):** a `body.page-*` class sets `--page`.

| Page | Color |
|---|---|
| Home | yellow block + red CTA |
| Work | green |
| About | yellow |
| Beyond | pink |
| Contact | red |

Each sub-page hero is a full-bleed `.hero-block` in its page color, with the page label, "0N / 05" and wall-scale type. Green is too dark for small ink text, so `.block--green` switches text to `#F4F4F4`.

**Everything is drawn in code.** No decorative image files remain. Card illustrations (vault door, phone chat, water tank + pipes) are small inline SVGs using `.sk-art`, with `.fill-paint` picking up the card's `--c`. Every block in the HTML and CSS has a numbered `/* 0N. … */` or `<!-- ===== … ===== -->` header, so any part can be found and edited.

**Gotchas found in v4:**
- A CSS class that sets `fill: none` beats an SVG `fill=""` attribute. Stroke classes now only drop the fill on elements without one (`.sk-line:not([fill])`).
- `.wrap` combined with a component that sets `padding: X 0` loses its side gutters. Use `padding-top` / `padding-bottom` instead.
- The Claude browser pane pauses `requestAnimationFrame` while it is hidden, so GSAP screenshots come out half-animated. Use headless Edge (`--force-prefers-reduced-motion --screenshot`) for visual checks. Its window can't go narrower than about 500px, so check phone widths with DOM measurements instead.

## v5 — "Blueprint" (2026-09-29, same day)

David felt v4 read as childish (handwriting, wobbly boxes, speech bubbles, a plane, pastel paint blocks). He asked for a professional look for a civil engineer who likes photography, with a Timescale-style reference: engineering blueprint on warm graph paper.

**Palette (strict):**
- `--paper #FAFAFA` with a dot grid (`.dotgrid`, 1px dots every 20px).
- `--ink #000` does all the structure.
- `--steel #5F5F5F` for secondary text (6.4:1 contrast).
- `--orange #FF5B29` is **voice only**: key headline words, stat numerals, the "in progress" element of the drawing. Never button fills, never body text, never smaller than 24px.
- `--lime #F5FF80` is **spotlight only**: the announcement bar and the "Open to work" chip.
- No other colors. The four v4 paint colors are gone.

**Type:** Geist 400/500/600 for voice. Geist Mono 400/500/700 for numbers, labels, dates, tags, drawing text and title blocks.

**Components:**
- Cards (`.card`): 12px radius, 1px black border, `5px 5px 0 #000` hard shadow. Hover lifts to 7px on linked cards.
- Buttons: pill `.btn-primary` (black) and `.btn-outline`.
- Tags: mono uppercase pills.
- Nav: flat 64px bar with a hairline, links, and a black "Resume" pill. On mobile it becomes a dropdown `.nav-panel`; v4's full-screen red menu is gone.
- Announcement bar in lime.
- Spec-sheet key/value cards (`.spec`).
- Stats banner (mono orange numerals).
- Feature cards with 1.5px line icons.
- Experience `.row`s separated by hairlines.
- Dark CTA panel.
- Footer states that the site was built with AI.

**Hero drawing:** the Boston skyline is redrawn as a real line **elevation sheet**:
- Hatched glazing and an earth hatch at grade (±0.00 level marker).
- Dashed water and gas utilities with W/G letters.
- Numbered callouts, a legend and a title block (PROJECT / DRAWN BY / SHEET A-101 / SCALE N.T.S. / DATE).
- The building under construction and the tower crane are the only orange element, labeled "In progress", as a quiet metaphor for learning software.
- GSAP draws the linework like a pen plotter (`strokeDashoffset`), then fades in the hatching, utilities and callouts.
- Under 760px the SVG keeps a 760px width and scrolls sideways inside `.sheet-scroll`, so the 11px drawing text stays legible.

**Photography:** Home has a "Structures I stop for" strip with four frames. The captions are engineering-accurate: suspension bridge, cable-stayed bridge, thin-shell dome, brick rowhouses. The frames deep-link to `beyond.html#frame-NN`, and the slider opens on that frame. The nav label is "Photography" (the file is still `beyond.html`).

**Brand assets:** the favicon (I-beam mark with an orange corner), `favicon-16/32.png`, `apple-touch-icon.png` and `og-image.png` (1200×630 drawing-sheet card) are regenerated in v5. The PNGs are rendered with headless Edge and resized with Pillow.

**Head:** generated from one template for all pages. It has honest per-page descriptions, `theme-color`, a canonical link, and `Person` JSON-LD on Home.

**Gotchas found in v5:**
- An element cloned with `<use>` did not get the `.elev .ln` styles (the selector didn't match inside the clone), so it rendered with the default black fill. Draw repeated parts explicitly.
- A `#frame-NN` anchor makes the browser natively scroll the slider's `overflow: hidden` viewport. `goTo()` resets `viewport.scrollLeft = 0`.
- The phone title-block borders needed simple column rules (odd cells after the first get the left border).
