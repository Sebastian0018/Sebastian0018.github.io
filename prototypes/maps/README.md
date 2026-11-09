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
directly.

## What was decided

- One new nav item, "Maps", after Photography. The rest of the site stays as it is.
- The page is an open atlas: text on the left page, the map plate on the right,
  page tabs on the book's edge. Picking a tab turns the leaf.
- Every plate covers the same ground, so each one has an overlay: a divider
  lays another plate over it to compare the two. Drag on the map, use the
  slider, or press "Compare with".
- Text per plate: a short summary, three or four insights, key data, and one
  curious fact.
- The earlier "Atlas of Boston" prototype was dropped and deleted.

## Files

| File | What it is |
|---|---|
| `index.html` | The page: site chrome, the book's CSS, and the script that builds the book from the data |
| `plates.js` | The content, one entry per plate. Field notes are at the top of the file |
| `build_plates.py` | Turns map exports into `img/<id>.webp` (1900 px) and `img/<id>-950.webp` (phones) |
| `img/` | The built plates |

## How the page works

- `index.html` reads `window.PLATES` and builds, per plate, a text panel (left
  page), a leaf (right page) and a tab.
- A leaf holds a `.stage` with two stacked images. `.top` is the plate itself,
  `.under` is the plate it is compared with. The CSS variable `--reveal` (0 to
  100%) sets how much of `.top` is laid down, through `clip-path`. Only
  `clip-path` and `left` change, and writes are batched to one per frame.
- The under image is fetched only when its leaf is opened. Images use `srcset`,
  so phones and normal laptop screens load the half-size files.
- Turning a leaf is a CSS animation (`rotateY` around the spine). State is set
  immediately and never waits for the animation to end.
- Keyboard: arrow keys on the tabs turn pages, arrow keys on the slider move
  the divider. `prefers-reduced-motion` turns the animations off.
- Below 860 px the book becomes one column and the tabs move to the top.

## Adding a plate

1. Export the map from Python on the shared canvas (next section).
2. Build the images. Pass every plate each time, so they are all checked together:
   ```
   pip install pillow
   python prototypes/maps/build_plates.py prototypes/maps/img basins=path/to/basins.png order=path/to/order.png new=path/to/new.png
   ```
3. Add an entry to `plates.js`. The `id` must match the image name.

The tab column, the "Compare with" chips and the page numbers update on their own.

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

Still open:

- "River segments" on plate II is empty and marked `tbc`. Fill it from the
  script (the number of rows in the clipped rivers layer) or delete the row.
- The copy in `plates.js` is a first draft in English. David has not edited it.
- The plates in `img/` come from the WebP copies uploaded in chat, not the
  original PNGs. Rebuild them from the originals after the re-export.

## Moving it to the live site

The live site deploys from `main`. Check in the repository's Pages settings
that it still does before merging.

1. Create `maps.html` at the repository root. Take the `<head>`, loading
   screen, nav, footer and script tags from `work.html`, then bring in the page
   header and the book from the prototype. Change the `../../` paths.
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
> tab. First look at my map scripts in the hydro-maps folder and apply the
> shared-canvas export recipe from the README, so that every plate is exactly
> 1900 x 2040 px with the title at the same coordinates. Then rebuild the
> plates with `build_plates.py` and show me the page.
