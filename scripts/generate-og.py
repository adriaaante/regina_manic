#!/usr/bin/env python3
"""Генерирует og-обложку 1200x630 (assets/img/og-cover.png) и иконку
apple-touch-icon 180x180 в палитре сайта. В обложку вставляется
портрет assets/img/regina/hero.jpg.

Запуск из корня репо: python3 scripts/generate-og.py  (нужен Pillow).
Шрифты — системные DejaVu (есть кириллица). Запускать после смены
имени/города/подписи бренда.
"""
from PIL import Image, ImageDraw, ImageFont

BG = (251, 246, 242)
BLUSH = (241, 218, 213)
BERRY = (142, 47, 77)
BERRY_DARK = (95, 25, 50)
GOLD = (201, 163, 106)
GOLD_PALE = (243, 230, 207)
MUTED = (122, 106, 111)
INK = (42, 29, 34)
SS = 2  # суперсэмплинг для гладких краёв


def nail(d, cx, bottom, w, h, fill, s=1):
    """Ноготь-типса овальной формы с бликом глянца."""
    cx, bottom, w, h = cx * s, bottom * s, w * s, h * s
    d.ellipse([cx - w / 2, bottom - h, cx + w / 2, bottom], fill=fill)
    d.line([(cx - w * .22, bottom - h * .3), (cx - w * .18, bottom - h * .72)], fill=(255, 255, 255), width=int(w * .1))


def sparkle(d, cx, cy, r, fill, s=1):
    cx, cy, r = cx * s, cy * s, r * s
    q = r * .28
    d.polygon([(cx, cy - r), (cx + q, cy - q), (cx + r, cy), (cx + q, cy + q),
               (cx, cy + r), (cx - q, cy + q), (cx - r, cy), (cx - q, cy - q)], fill=fill)


# ---------- og-cover ----------
W, H = 1200, 630
img = Image.new("RGB", (W * SS, H * SS), BG)
d = ImageDraw.Draw(img)
d.ellipse([(W - 560) * SS, -200 * SS, (W + 140) * SS, 500 * SS], fill=BLUSH)
d.ellipse([-200 * SS, (H - 240) * SS, 260 * SS, (H + 200) * SS], fill=GOLD_PALE)

# портрет Регины в арке (assets/img/regina/hero.jpg)
ph = Image.open("assets/img/regina/hero.jpg").convert("RGB")
aw, ah, ax, ay = 340, 425, 790, 120
ph = ph.resize((aw * SS, ah * SS), Image.LANCZOS)
mask = Image.new("L", ph.size, 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle([0, aw * SS // 2, aw * SS, ah * SS], radius=26 * SS, fill=255)
md.ellipse([0, 0, aw * SS, aw * SS], fill=255)
md.rectangle([0, aw * SS // 2, aw * SS, ah * SS - 30 * SS], fill=255)
b = 8  # белая рамка
d.rounded_rectangle([(ax - b) * SS, (ay + aw // 2) * SS, (ax + aw + b) * SS, (ay + ah + b) * SS], radius=32 * SS, fill=(255, 255, 255))
d.ellipse([(ax - b) * SS, (ay - b) * SS, (ax + aw + b) * SS, (ay + aw + b) * SS], fill=(255, 255, 255))
img.paste(ph, (ax * SS, ay * SS), mask)
# типсы и искры вокруг арки
for x, y, c in [(752, 470, (242, 212, 203)), (1150, 170, (200, 16, 46)), (1160, 430, BERRY)]:
    nail(d, x, y, 34, 70, c, SS)
for x, y, r in [(770, 120, 16), (1160, 300, 11), (720, 560, 13)]:
    sparkle(d, x, y, r, GOLD, SS)

serif_b = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 92 * SS)
serif = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 40 * SS)
sans = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26 * SS)
tx = 80
d.text((tx * SS, 150 * SS), "Regina", font=serif_b, fill=INK)
d.text((tx * SS, 255 * SS), "Nails", font=serif_b, fill=BERRY)
d.text((tx * SS, 385 * SS), "Маникюр в Краснодаре", font=serif, fill=INK)
d.text((tx * SS, 450 * SS), "гель-лак · наращивание · дизайн · педикюр", font=sans, fill=MUTED)
d.rectangle([24 * SS, 24 * SS, (W - 24) * SS, (H - 24) * SS], outline=GOLD, width=2 * SS)
img.resize((W, H), Image.LANCZOS).save("assets/img/og-cover.png", optimize=True)

# ---------- apple-touch-icon ----------
S = 180
ic = Image.new("RGB", (S * SS, S * SS), BG)
d = ImageDraw.Draw(ic)
d.ellipse([12 * SS, 12 * SS, (S - 12) * SS, (S - 12) * SS], outline=GOLD, width=5 * SS)
nail(d, 90, 148, 64, 116, BERRY, SS)
sparkle(d, 132, 52, 14, GOLD, SS)
ic.resize((S, S), Image.LANCZOS).save("assets/img/apple-touch-icon.png", optimize=True)
print("ok: assets/img/og-cover.png, assets/img/apple-touch-icon.png")
