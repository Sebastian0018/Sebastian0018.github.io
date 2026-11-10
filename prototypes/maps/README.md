# Maps tab: prototype and handoff

A new "Maps" page for the portfolio: the maps David makes in Python, shown as a
cartography book. This folder is a working prototype. Nothing here is linked
from the live site yet, and the page carries `noindex`.

Read `design-system/david-becerra-portfolio/MASTER.md` before changing the
look. The prototype follows v5 "Blueprint" and loads the site's own
`style.css`.

## Run it locally

```
git fetch origin
git checkout claude/epic-gauss-7IDMk
git pull
python -m http.server 8000
```

Run the server from the repository root, then open
<http://localhost:8000/prototypes/maps/>. `#basins` and `#order` open a plate
directly. Add `?demo=14` to fill the book with stand-in plates and see how the
index behaves when the atlas grows.

## What was decided

- One new nav item, "Maps", after Photography. The rest of the site stays as it is.
- The page is an open atlas: text on the left page, the map on the right,
  page tabs on the book's edge.
- Every plate covers the same ground, so the right page always shows two of
  them with a thin divider between: the open plate on the left of the line,
  another plate under it on the right. The page loads with the divider in the
  middle.
- Opening another plate does not flip a page. The open plate is laid down
  fully, becomes the sheet underneath, and the new one is drawn over it from
  the left. An earlier version turned a 3D leaf; David asked for something
  quieter and more fluid.
- The divider is deliberately minimal: a 1 px line with a small grip.
- Less text in view. The left page shows the title, the summary and the
  curious fact. "What it shows" and "Key data" open on request.
- David expects more than 12 maps. The index is a rail of tabs with
  thumbnails that scrolls inside the book's height, plus a "Contents" dialog
  with every plate.
- The top bar has a proposed restyle (`.nav--v2`, section 01 of the CSS). It
  is only applied on this page so far.
- The earlier "Atlas of Boston" prototype was dropped and deleted.

## Files

| File | What it is |
|---|---|
| `index.html` | The page: site chrome, the book's CSS, and the script that builds the book from the data |
| `plates.js` | The content, one entry per plate. Field notes are at the top of the file |
| `build_plates.py` | Turns map exports into `img/<id>.webp` (1900 px), `img/<id>-950.webp` (half size) and `img/<id>-thumb.webp` (index thumbnail) |
| `img/` | The built plates |

## How the page works

- `index.html` reads `window.PLATES` and builds the index tabs, the contents
  dialog and the "over" menu. The left page is re-rendered for the open plate.
- The right page has one `.stage`. Each plate is a single `<img>`, created the
  first time it is needed and decoded before it is shown. Two of them are
  visible: `.is-top` (the open plate) and `.is-under`.
- The CSS variable `--reveal` (0 to 100%) sets how far `.is-top` is laid down,
  through `clip-path`. The script owns that number and writes it at most once
  per frame. `follow()` eases towards the pointer while dragging; `sweep()` is
  the timed move used when a plate is laid down. Nothing waits on
  `transitionend`.
- `go(i)` opens a plate, `setUnder(j)` changes only the sheet underneath. A
  counter (`seq`) cancels a move when a newer one starts.
- The stage loads the half-size image unless it really has more than 1000
  device pixels across.
- Ways to move the divider: drag, click or tap anywhere on the map, or focus
  the map with Tab and use the arrow keys (a hidden range input). Arrow keys
  on the index tabs change plate. `prefers-reduced-motion` turns the motion off.
- Nav: the underline glides to the hovered link and rests under the current
  page; the bar gets slimmer after 80 px of scroll, slides away while
  scrolling down and returns when scrolling up or when it has focus.
- Below 900 px the book becomes one column and the index becomes a
  horizontal strip above it.

## Adding a plate

1. Export the map from Python on the shared canvas (next section).
2. Build the images. Pass every plate each time, so they are all checked together:
   ```
   pip install pillow
   python prototypes/maps/build_plates.py prototypes/maps/img basins=path/to/basins.png order=path/to/order.png new=path/to/new.png
   ```
3. Add an entry to `plates.js`. The `id` must match the image name.

The index, the contents dialog, the "over" menu and the page numbers update on
their own. The thumbnail is cropped to the land, so it also comes out of
`build_plates.py`.

## Exporting maps so they overlay

The first two exports did not share a canvas: 1687 x 2000 px and 1894 x 2000 px.
The projection was the same (the land has the same proportions in both), but one
map was 2.3% larger and shifted. `build_plates.py` detected that and registered
them by the land silhouette, which is why they line up now. That is a rescue,
not the plan: the baked-in titles still sit in different places.

The fix belongs in the matplotlib script. Every plate needs the same figure
size, the same map extent, and the title and credits at the same figure
coordinates. The usual cause of drifting sizes is `bbox_inches="tight"`, which
crops each map to its own content.

The original scripts were not available when this was written, so the code
below is a recipe to adapt, not a drop-in patch:

```python
import math
import matplotlib.pyplot as plt

# One canvas for every plate. Set once, never per map.
FIG_SIZE = (9.5, 10.2)                # inches
DPI = 200                             # 9.5 x 10.2 in at 200 dpi = 1900 x 2040 px
BG = "#1a1a1a"
MAP_BOX = (0.02, 0.05, 0.96, 0.92)    # map area as figure fractions: left, bottom, width, height
TITLE_X, TITLE_Y = 0.615, 0.355       # figure fractions: the same spot on every plate
CREDIT_X, CREDIT_Y = 0.012, 0.012

# The mapped area, in the CRS the layers are plotted in. Take it once from the
# states layer (states.total_bounds plus a margin), then hard-code the numbers
# here so they cannot drift between scripts.
EXTENT = (XMIN, XMAX, YMIN, YMAX)
GEOGRAPHIC = False                    # True if the layers are in lon/lat (EPSG:4326)


def new_plate():
    fig = plt.figure(figsize=FIG_SIZE, dpi=DPI, facecolor=BG)
    ax = fig.add_axes(MAP_BOX)
    ax.set_axis_off()
    return fig, ax


def finish_plate(fig, ax, kicker, title, note, credit, path, title_color):
    # geopandas' .plot() resets limits and aspect, so set them after plotting.
    ax.set_xlim(EXTENT[0], EXTENT[1])
    ax.set_ylim(EXTENT[2], EXTENT[3])
    if GEOGRAPHIC:
        mid_lat = (EXTENT[2] + EXTENT[3]) / 2
        ax.set_aspect(1 / math.cos(math.radians(mid_lat)))
    else:
        ax.set_aspect("equal")

    # fig.text places text in figure coordinates, so it cannot move with the data.
    fig.text(TITLE_X, TITLE_Y + 0.040, kicker, color="#e8e8e8", fontsize=20, ha="left", va="baseline")
    fig.text(TITLE_X, TITLE_Y, title, color=title_color, fontsize=34, fontweight="bold", ha="left", va="baseline")
    fig.text(TITLE_X, TITLE_Y - 0.028, note, color="#6b6b6b", fontsize=11, ha="left", va="baseline")
    fig.text(CREDIT_X, CREDIT_Y, credit, color="#555555", fontsize=9, ha="left", va="bottom")

    fig.savefig(path, dpi=DPI, facecolor=BG)   # no bbox_inches="tight"
    plt.close(fig)
```

Put this in one module that every map script imports, so there is a single
copy of the constants. Check an export by its pixel size: every plate must be
exactly 1900 x 2040. When they all are, `build_plates.py` prints "inputs share
one canvas" and converts them without touching the geometry.

If the canvas shape changes, update `CANVAS` in `build_plates.py` and the two
`1900 / 2040` and `width="1900" height="2040"` values in `index.html`.

## Content status

Confirmed by David:

- Plate II uses HydroRIVERS `ORD_STRA` (Strahler order).
- On plate I, purple is the Kennebec–Androscoggin basin and mint is the Penobscot.
- The Connecticut is about 650 km long; the Vermont–New Hampshire border follows
  the Vermont bank; the bright line on Vermont's western edge is Lake Champlain.

- The plates in `img/` were rebuilt by David from exports on the shared canvas
  (both 1900 x 2040, land within 2 px, titles at the same coordinates). The
  thumbnails were made from those plates.

Still open:

- "River segments" on plate II is empty and marked `tbc`. Fill it from the
  script (the number of rows in the clipped rivers layer) or delete the row.
- The copy in `plates.js` is a first draft in English. David has not edited it.

## Moving it to the live site

The live site deploys from `main`. Check in the repository's Pages settings
that it still does before merging.

1. Create `maps.html` at the repository root. Take the `<head>`, loading
   screen, nav, footer and script tags from `work.html`, then bring in the page
   header and the book from the prototype. Change the `../../` paths. Leave out
   the `?demo=` block.
1. Decide on the nav restyle. If it stays, move the `.nav--v2` rules into
   section 05 of `style.css` as the normal `.nav` rules, add the
   `<span class="nav-glide">` to the nav of every page, and move the nav part
   of the script (section A) into `script.js` next to the existing menu code.
2. Move the book's CSS into `style.css` as a new numbered section and the
   script into its own file (for example `maps.js`). Move `plates.js` and
   `img/` next to it (for example `maps/plates.js`, `maps/img/`).
3. Add "Maps" after "Photography" in the three nav lists of every page (desktop
   nav, mobile panel, footer): `index.html`, `work.html`, `about.html`,
   `beyond.html`, `contact.html`, `404.html`.
4. Renumber the sheets: every page says `/ 05` today. Maps becomes
   `SHEET 05 / 06` and Contact becomes `SHEET 06 / 06`.
5. Add the page to `sitemap.xml`, give it a canonical link, a description and
   Open Graph tags like the other pages, and remove `noindex`.
6. Bump the `?v=` number on `style.css` and `script.js` in every page.
7. Remove the remaining `tbc` chips, then check 375, 768, 1024 and 1440 px,
   reduced motion, and keyboard use.
8. Add a section for the Maps page to `MASTER.md`.

## Next: scroll effects, not built yet

David likes how <https://www.town.com/> scrolls and wants some of it here. He
approved the current book design first. Nothing in this section is built.

**His choices**

- Effects wanted: text that fills in as you scroll, section titles that stick,
  and parallax inside images. He did not pick the footer that is revealed from
  behind the page.
- Scope: try them on the Maps prototype first. The rest of the site comes
  later, if he likes the result.

**What town.com does** (read from the live page on 2026-11-10, in Chromium at
1440 px)

- The scroll is the browser's own. There is no Lenis and no GSAP, `html` has
  `scroll-behavior: auto`, and nothing snaps vertically. The feel comes from
  CSS, not from taking over the wheel. The site is built with Next.js.
- Parallax: an inner layer scaled to 1.1 inside a frame, moved with
  `animation-timeline: view()` and this keyframe:
  `@keyframes brand-parallax-drift { from { transform: translateY(var(--parallax-from, 0%)); } to { transform: translateY(var(--parallax-to, 0%)); } }`.
  The range is `cover` on most images and `exit` on the hero portrait.
- Text fill: one paragraph block has a named view timeline. A keyframe takes a
  custom property from 0 to 1 over the range `cover 15%` to `exit 0%`, and the
  text goes from grey to black. How the property is turned into colour was not
  inspected.
- Sticky: the header sticks at the top. Inside each story section, the heading
  or side column is `position: sticky` at 120 px, so it stays while the rest of
  the section scrolls past.
- The footer is `position: sticky; bottom: 0` behind the page, which gives the
  reveal David did not ask for.

**Notes for building it here**

- Use the same approach: CSS scroll-driven animations and `position: sticky`,
  no scroll library. That also fits the site's rule of no build step.
- Scroll-driven animations do not run in every browser. Put them inside
  `@supports (animation-timeline: view())` and make the resting state the
  finished one, so a browser without support shows black text and still images.
  Check current browser support before relying on it.
- Keep them off under `prefers-reduced-motion: reduce`, like the rest of the site.
- Do not put parallax on the map stage. The two plates have to stay registered
  for the comparison to work.
- The Maps page is short: a header and the book. There is little to stick or
  fill. A short introduction between the header and the book would give the
  text fill a place, and it could say what the atlas is. Ask David before
  adding copy.
- For the text fill, a registered number property and `color-mix()` are
  enough. The grey is only a starting state; the text must end at `--ink`:

```css
@property --fill { syntax: "<number>"; inherits: true; initial-value: 1; }

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .fill-on-scroll {
      color: color-mix(in srgb, var(--ink) calc(var(--fill) * 100%), var(--ash));
      animation: fill-text linear both;
      animation-timeline: view();
      animation-range: cover 15% cover 55%;
    }
  }
}
@keyframes fill-text { from { --fill: 0; } to { --fill: 1; } }
```

  This fills the whole block at once. Filling word by word needs one span per
  word, each with a slightly later range.

## Later: a mascot

David also likes town.com's mascot and wants one for this site. He will open a
separate folder for it. It is not designed yet and not part of this prototype.

For reference, town.com's mascot "Bud" is a drawn dog. On the page as loaded it
is a still WebP image, not an animation. It sits beside the hero headline, and
other characters of the same family appear in later sections. A fixed bar at
the bottom of the screen carries a prompt box labelled "Ask Bud anything".

## Continuing with Claude Code on the computer

Open the repository folder in Claude Code and give it the map project too:

```
/add-dir "C:\Users\david\Desktop\second brain\nucleo\proyectos\hydro-maps"
```

The design plugin used for earlier versions of the site is installed by typing
these two commands on their own, one at a time, in the Claude Code prompt:

```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

A first message that carries the context:

> Read `prototypes/maps/README.md` and
> `design-system/david-becerra-portfolio/MASTER.md`. We are continuing the Maps
> tab. Start the local server and show me the page as it is. Then propose how
> to add the three scroll effects from the "Next: scroll effects" section to
> the Maps prototype, and ask me before changing anything.
