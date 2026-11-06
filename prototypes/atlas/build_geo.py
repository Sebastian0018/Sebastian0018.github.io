"""Project Boston neighborhood + Cambridge boundary GeoJSON into the atlas
sheet (1200x800, ~91 px/km) and write a small JS data file.

usage: python3 -I build_geo.py <boston.geojson> <cambridge.geojson> <out.js>
"""
import json
import math
import sys

LON0, LAT0, KX, KY = -71.14, 42.395, 7500, 10135
MARGIN = 60  # keep shapes that reach within this many px of the sheet
TOL = 0.45   # Douglas-Peucker tolerance in px


def proj(pt):
    lon, lat = pt[0], pt[1]
    return ((lon - LON0) * KX, (LAT0 - lat) * KY)


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    best, idx = -1, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        if norm < 1e-6:
            d = math.hypot(x - x1, y - y1)
        else:
            d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / norm
        if d > best:
            best, idx = d, i
    if best > tol:
        return dp(pts[: idx + 1], tol)[:-1] + dp(pts[idx:], tol)
    return [pts[0], pts[-1]]


def ring_path(ring):
    pts = dp([proj(p) for p in ring], TOL)
    if len(pts) < 3:
        return ''
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    if max(xs) < -MARGIN or min(xs) > 1200 + MARGIN or max(ys) < -MARGIN or min(ys) > 800 + MARGIN:
        return ''
    out = 'M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + 'Z'
    return out


def polys(geom):
    if geom['type'] == 'Polygon':
        return [geom['coordinates']]
    return geom['coordinates']


def area_centroid(ring):
    pts = [proj(p) for p in ring]
    a = cx = cy = 0.0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        c = x1 * y2 - x2 * y1
        a += c
        cx += (x1 + x2) * c
        cy += (y1 + y2) * c
    if abs(a) < 1e-9:
        return 0, (0, 0)
    return abs(a / 2), (cx / (3 * a), cy / (3 * a))


def main(boston_fp, cam_fp, out_fp):
    hoods = []
    for f in json.load(open(boston_fp))['features']:
        d = ''
        best = (0, (0, 0))
        for poly in polys(f['geometry']):
            for ring in poly:
                d += ring_path(ring)
            ac = area_centroid(poly[0])
            if ac[0] > best[0]:
                best = ac
        if d:
            hoods.append({'name': f['properties']['name'], 'd': d,
                          'c': [round(best[1][0], 1), round(best[1][1], 1)]})
    cam = ''
    for f in json.load(open(cam_fp))['features']:
        for poly in polys(f['geometry']):
            for ring in poly:
                cam += ring_path(ring)
    data = {'hoods': hoods, 'cambridge': cam}
    with open(out_fp, 'w') as fh:
        fh.write('/* Generated for the atlas prototype. Sources: City of Boston neighborhood\n'
                 '   boundaries (via click_that_hood) and City of Cambridge GIS city boundary.\n'
                 '   Projected to the 1200x800 sheet, simplified. */\n')
        fh.write('window.ATLAS_GEO = ' + json.dumps(data, separators=(',', ':')) + ';\n')
    print(len(hoods), 'hoods;', sum(len(h['d']) for h in hoods) + len(cam), 'chars')
    for h in hoods:
        print(f"  {h['name']:<26} {h['c']}")


if __name__ == '__main__':
    main(*sys.argv[1:4])
