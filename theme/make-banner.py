# SPDX-License-Identifier: GPL-2.0-or-later
# Coded By Alperen Yavuz - https://github.com/alplix/passiflora
#
# Draws the banner of the theme: the roots, in the complex plane, of every degree-10 polynomial whose coefficients are
# -1, 0 or 1 (the project searches degree-10 fields, "decic" fields). Colour = the argument of the root, brightness =
# how many roots land there. Needs numpy and Pillow.   python make-banner.py [out.jpg]
import sys
import numpy as np
from PIL import Image, ImageFilter

W, H = 2088, 340            # 2x the size of the original 1044x170 banner
SS = 2                      # supersampling


def roots(deg, coefs, chunk=20000):
    """All roots of z^deg + a[deg-1] z^(deg-1) + ... + a[0], with every a[i] taken from coefs (in chunks)."""
    n = len(coefs) ** deg
    out = []
    c = np.array(coefs)
    for start in range(0, n, chunk):
        idx = np.arange(start, min(n, start + chunk))
        m = len(idx)
        a = np.empty((m, deg))
        for i in range(deg):
            a[:, i] = c[idx % len(coefs)]
            idx = idx // len(coefs)
        comp = np.zeros((m, deg, deg))
        comp[:, np.arange(1, deg), np.arange(0, deg - 1)] = 1.0
        comp[:, :, deg - 1] = -a
        out.append(np.linalg.eigvals(comp).ravel())
    return np.concatenate(out)


STOPS = [(0.00, (46, 230, 208)), (0.25, (74, 140, 255)), (0.50, (150, 110, 255)), (0.75, (255, 170, 100)), (1.00, (46, 230, 208))]


def palette(t):
    t = np.asarray(t)
    out = np.zeros(t.shape + (3,))
    for (t0, c0), (t1, c1) in zip(STOPS[:-1], STOPS[1:]):
        m = (t >= t0) & (t <= t1)
        f = ((t[m] - t0) / (t1 - t0))[:, None]
        out[m] = np.array(c0) * (1 - f) + np.array(c1) * f
    return out


def ribbon(z, w, h, span, gain):
    """Unwrap the plane: x = argument of the root, y = distance from the unit circle."""
    r = np.abs(z)
    ang = np.angle(z)
    keep = z.imag >= 0                       # the upper half plane is enough: the roots are symmetric about the real axis
    r, ang, z = r[keep], ang[keep], z[keep]
    x = (ang / np.pi * w).astype(np.int64)
    y = (h / 2 - (r - 1.0) * (h / span)).astype(np.int64)
    ok = (x >= 0) & (x < w) & (y >= 0) & (y < h)
    x, y, ang = x[ok], y[ok], ang[ok]
    flat = y * w + x
    cnt = np.bincount(flat, minlength=w * h).astype(np.float64)
    col = palette(ang / np.pi)
    rgb = np.stack([np.bincount(flat, weights=col[:, k], minlength=w * h) for k in range(3)], axis=1)
    rgb = rgb / np.maximum(cnt, 1)[:, None] / 255.0
    bright = (1.0 - np.exp(-cnt * gain)) ** 1.0
    return (rgb * bright[:, None]).reshape(h, w, 3)


def background(w, h):
    yy, xx = np.mgrid[0:h, 0:w]
    t = xx / w
    base = np.zeros((h, w, 3))
    left = np.array([7, 16, 26]) / 255.0
    right = np.array([10, 36, 46]) / 255.0
    base[:] = left * (1 - t)[..., None] + right * t[..., None]
    # graph paper
    step = 34 * SS
    grid = ((xx % step == 0) | (yy % step == 0)).astype(np.float64) * 0.05
    major = ((xx % (step * 5) == 0) | (yy % (step * 5) == 0)).astype(np.float64) * 0.05
    base += (grid + major)[..., None] * np.array([0.55, 0.9, 0.9])
    return base


def main(out):
    w, h = W * SS, H * SS
    img = background(w, h)
    z = np.concatenate([roots(10, [-1, 0, 1]), roots(11, [-1, 0, 1]), roots(8, [-2, -1, 0, 1, 2], 40000)])
    acc = ribbon(z, w, h, 0.72, 0.5)
    soft = Image.fromarray((np.clip(acc, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4 * SS))
    soft = np.asarray(soft).astype(np.float64) / 255.0
    comp = 1 - (1 - img) * (1 - np.clip(acc, 0, 1)) * (1 - soft * 0.6)
    # the ribbon is the picture: darken the top and bottom edge a little
    t = np.linspace(0, 1, h)
    v = 0.78 + 0.22 * np.sin(np.pi * t)
    comp = comp * v[:, None, None]
    im = Image.fromarray((np.clip(comp, 0, 1) * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
    im.save(out, quality=82, optimize=True, progressive=True)
    print("wrote", out, im.size)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "banner.jpg")
