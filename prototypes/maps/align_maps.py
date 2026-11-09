"""Register map PNG/WebP exports onto one canvas so the land silhouette
sits at the same place and scale in every plate.

usage: python3 align_maps.py <out_dir> <name=path> [<name=path> ...]
"""
import sys
from PIL import Image, ImageChops

CANVAS = (1900, 2040)
LAND_X, LAND_Y, LAND_H = 430, 110, 1730   # where the silhouette's top-left goes, and its height


def land_box(im):
    W, H = im.size
    bg = im.getpixel((5, 5))
    diff = ImageChops.difference(im, Image.new('RGB', im.size, bg)).convert('L').point(lambda v: 255 if v > 7 else 0)

    def bbox(x0, y0, x1, y1):
        b = diff.crop((x0, y0, x1, y1)).getbbox()
        return (b[0] + x0, b[1] + y0, b[2] + x0, b[3] + y0)
    top = bbox(0, 0, W, int(H * .55))               # above the baked-in title
    left = bbox(0, 0, int(W * .55), int(H * .93))   # left of the title, above the credits
    return (left[0], top[1], top[2], left[3]), bg


def main(out_dir, *pairs):
    outs = []
    for pair in pairs:
        name, path = pair.split('=', 1)
        im = Image.open(path).convert('RGB')
        (x0, y0, x1, y1), bg = land_box(im)
        s = LAND_H / (y1 - y0)
        scaled = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        canvas = Image.new('RGB', CANVAS, bg)
        canvas.paste(scaled, (round(LAND_X - x0 * s), round(LAND_Y - y0 * s)))
        out = f'{out_dir}/{name}.webp'
        canvas.save(out, 'WEBP', quality=86, method=6)
        box, _ = land_box(canvas)
        print(f'{name}: scale {s:.4f} -> land box {box}, w/h {(box[2]-box[0])/(box[3]-box[1]):.4f}')
        outs.append(canvas)
    if len(outs) >= 2:
        Image.blend(outs[0], outs[1], .5).save(f'{out_dir}/_blend_check.png')


if __name__ == '__main__':
    main(*sys.argv[1:])
