"""Turn map exports into the plates the Maps page loads.

    python build_plates.py img basins=path/to/basins.png order=path/to/order.png

For each `name=path` it writes img/<name>.webp (1900 px wide) and
img/<name>-950.webp (half size, for phones).

Plates only overlay cleanly if the land sits at the same place and scale in
every image:

* If every input has the same pixel size, they are assumed to come from the
  shared matplotlib canvas (see README.md) and are converted as they are.
* If the sizes differ, each map is registered instead: the land silhouette
  is found, scaled to one height and pasted at one position. This rescues
  exports made with different figure sizes, as long as the projection and
  the mapped area are the same. Baked-in titles will not line up.

Needs Pillow:  pip install pillow
"""
import sys
from PIL import Image, ImageChops

CANVAS = (1900, 2040)                      # the page assumes this aspect ratio
LAND_X, LAND_Y, LAND_H = 430, 110, 1730    # registration target: top-left corner and height of the land
BG_TOLERANCE = 7


def land_box(im):
    """Bounding box of the land, ignoring the title (right) and credits (bottom)."""
    w, h = im.size
    bg = im.getpixel((5, 5))
    diff = ImageChops.difference(im, Image.new('RGB', im.size, bg)).convert('L')
    diff = diff.point(lambda v: 255 if v > BG_TOLERANCE else 0)

    def bbox(x0, y0, x1, y1):
        b = diff.crop((x0, y0, x1, y1)).getbbox()
        return (b[0] + x0, b[1] + y0, b[2] + x0, b[3] + y0)

    top = bbox(0, 0, w, int(h * .55))               # above the title: north and east edges
    left = bbox(0, 0, int(w * .55), int(h * .93))   # left of the title, above the credits: west and south
    return (left[0], top[1], top[2], left[3]), bg


def register(im):
    (x0, y0, _, y1), bg = land_box(im)
    s = LAND_H / (y1 - y0)
    scaled = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    canvas = Image.new('RGB', CANVAS, bg)
    canvas.paste(scaled, (round(LAND_X - x0 * s), round(LAND_Y - y0 * s)))
    return canvas, s


def main(out_dir, *pairs):
    if not pairs:
        sys.exit(__doc__)
    maps = []
    for pair in pairs:
        name, path = pair.split('=', 1)
        maps.append((name, Image.open(path).convert('RGB')))

    same_canvas = len({im.size for _, im in maps}) == 1
    print('inputs share one canvas: converting as they are' if same_canvas
          else 'inputs differ in size: registering by land silhouette')

    for name, im in maps:
        if same_canvas:
            if abs(im.width / im.height - CANVAS[0] / CANVAS[1]) > 0.002:
                print(f'  ! {name}: aspect {im.width}x{im.height} is not {CANVAS[0]}x{CANVAS[1]}; '
                      'update CANVAS here and the aspect-ratio in index.html')
            plate = im.resize((CANVAS[0], round(im.height * CANVAS[0] / im.width)), Image.LANCZOS)
            note = f'{im.width}x{im.height}'
        else:
            plate, s = register(im)
            note = f'{im.width}x{im.height}, scaled x{s:.4f}'
        plate.save(f'{out_dir}/{name}.webp', 'WEBP', quality=86, method=6)
        half = plate.resize((plate.width // 2, plate.height // 2), Image.LANCZOS)
        half.save(f'{out_dir}/{name}-950.webp', 'WEBP', quality=84, method=6)
        print(f'  {name}: {note} -> {plate.width}x{plate.height} (+ half size), land box {land_box(plate)[0]}')


if __name__ == '__main__':
    main(*sys.argv[1:])
