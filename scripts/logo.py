#!/usr/bin/env python3
"""로고 원본 1장 → 모든 파생 자산 생성 (Pillow 필요: pip3 install pillow)

  npm run logo                      # design/logo-source.png 사용
  npm run logo -- --src 새로고.png   # 다른 원본
  npm run logo -- --mark design/logo-mark.png   # 앱 아이콘 심볼을 별도 파일로

원본 조건: 투명 배경 PNG(또는 SVG를 PNG로 내보낸 것), 가로형 워드마크, 여백 있어도 됨(자동 트리밍). 영문판은 design/logo-source-en.png (선택).
생성물:
  public/logo/jubutech-wordmark.png        트리밍 원본색
  public/logo/jubutech-wordmark-white.png  흰색판 (블랙·레드 배경용)
  public/logo/jubutech-wordmark-ink.png    잉크 단색판
  public/logo/app-icon-512.png / app-icon-192.png / apple-touch-icon.png(180)  Primary 라운드 스퀘어 + 흰 심볼
  src/app/icon.png (64)                    파비콘
  src/app/opengraph-image.png (1200×630)   OG 이미지
색은 design/tokens.json 의 Primary·Ink·Paper 를 따른다. 워드마크 실측 색을 출력하므로 토큰과 다르면 tokens.json 을 맞출 것.
"""
import argparse, json, os, sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "design/tokens.json")))
hx = lambda h: tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
PRIMARY = hx(T["color"]["red"]["scale"][T["color"]["red"]["primary"]])
INK = hx(T["color"]["base"]["ink"]["hex"]); PAPER = hx(T["color"]["base"]["paper"]["hex"])
L = T["logo"]

ap = argparse.ArgumentParser(); ap.add_argument("--src", default=os.path.join(ROOT, L["source"])); ap.add_argument("--mark"); ap.add_argument("--crop-ratio", type=float, default=L["mark"]["cropRatio"])
a = ap.parse_args()
if not os.path.exists(a.src): sys.exit(f"원본이 없습니다: {a.src}\n→ 새 로고 PNG(투명 배경)를 design/logo-source.png 로 두거나 --src 로 지정하세요.")

src = Image.open(a.src).convert("RGBA"); wm = src.crop(src.getchannel("A").getbbox())
px = [wm.getpixel((x, y)) for x in range(0, wm.width, 5) for y in range(0, wm.height, 5)]; solid = [p for p in px if p[3] > 250]
mr, mg, mb = (sum(p[i] for p in solid) // len(solid) for i in range(3))
print(f"워드마크 {wm.size} · 실측 색 #{mr:02X}{mg:02X}{mb:02X} (토큰 Primary #{PRIMARY[0]:02X}{PRIMARY[1]:02X}{PRIMARY[2]:02X})")
out = os.path.join(ROOT, "apps/web/public/logo"); os.makedirs(out, exist_ok=True)
wm.save(f"{out}/jubutech-wordmark.png", optimize=True)
def tint(rgb):
    im = Image.new("RGBA", wm.size, rgb + (0,)); im.putalpha(wm.getchannel("A")); return im
tint((255, 255, 255)).save(f"{out}/jubutech-wordmark-white.png", optimize=True)
tint(INK).save(f"{out}/jubutech-wordmark-ink.png", optimize=True)

# 영문 워드마크를 먼저 읽어 primary=en 이면 아이콘·OG 기준으로 사용
en_src = os.path.join(ROOT, L.get("sourceEn", "design/logo-source-en.png")); en = None
if os.path.exists(en_src):
    e = Image.open(en_src).convert("RGBA"); en = e.crop(e.getchannel("A").getbbox())
    en.save(f"{out}/jubutech-wordmark-en.png", optimize=True)
    for name, rgb in (("white", (255, 255, 255)), ("ink", INK)):
        im = Image.new("RGBA", en.size, rgb + (0,)); im.putalpha(en.getchannel("A")); im.save(f"{out}/jubutech-wordmark-en-{name}.png", optimize=True)
    print(f"영문 워드마크 {en.size} → jubutech-wordmark-en(-white/-ink).png")
main = en if (L.get("primary") == "en" and en is not None) else wm
print("아이콘·OG 기준:", "영문" if main is en else "한글")

# 앱 아이콘 심볼: 별도 파일 또는 워드마크 첫 글자 크롭
if a.mark or L["mark"]["mode"] == "file":
    mp = a.mark or os.path.join(ROOT, "design/logo-mark.png"); m = Image.open(mp).convert("RGBA"); mark = m.crop(m.getchannel("A").getbbox())
else:
    # 첫 글자 자동 검출: 잉크가 있는 열이 시작된 뒤 처음 만나는 빈 열 구간(폭의 1.5% 이상)까지
    A = main.getchannel("A"); W, Hh = main.size
    cols = [any(A.getpixel((x, y)) > 40 for y in range(0, Hh, 2)) for x in range(W)]
    start = next(i for i, c in enumerate(cols) if c); gap = max(3, int(W * 0.015)); end = None; run = 0
    for x in range(start, W):
        run = run + 1 if not cols[x] else 0
        if run >= gap: end = x - run + 1; break
    if end is None or end - start < W * 0.08: end = int(W * a.crop_ratio)
    mark = main.crop((start, 0, end, Hh)); mark = mark.crop(mark.getchannel("A").getbbox())
    print(f"앱 아이콘 심볼: 워드마크 x {start}~{end} (자동 검출)")
def icon(size):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=PRIMARY + (255,))
    tw = int(size * 0.62); th = int(mark.height * tw / mark.width)
    if th > size * 0.62: th = int(size * 0.62); tw = int(mark.width * th / mark.height)
    g = mark.resize((tw, th), Image.LANCZOS); wh = Image.new("RGBA", g.size, (255, 255, 255, 255)); wh.putalpha(g.getchannel("A"))
    im.alpha_composite(wh, ((size - tw) // 2, (size - th) // 2)); return im
icon(512).save(f"{out}/app-icon-512.png"); icon(192).save(f"{out}/app-icon-192.png"); icon(180).save(f"{out}/apple-touch-icon.png"); icon(64).save(os.path.join(ROOT, "apps/web/src/app/icon.png"))
# 모바일 앱 아이콘(1024)·안드로이드 전경·스플래시
mob = os.path.join(ROOT, "apps/mobile/assets/images"); os.makedirs(mob, exist_ok=True)
icon(1024).save(f"{mob}/icon.png"); icon(1024).save(f"{mob}/android-icon-foreground.png")
sp = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0)); g2 = main.resize((700, int(main.height * 700 / main.width)), Image.LANCZOS); sp.alpha_composite(g2, (162, (1024 - g2.height) // 2)); sp.save(f"{mob}/splash-icon.png")

if main.width < 1200: print(f"⚠ 원본 폭 {wm.width}px — OG·아이콘이 흐릴 수 있음. 가능하면 폭 1500px 이상 또는 SVG 원본 사용")

# OG
og_c = L["og"]; bg = PAPER if og_c["background"] == "paper" else hx(T["color"]["base"][og_c["background"]]["hex"])
og = Image.new("RGBA", (og_c["width"], og_c["height"]), bg + (255,)); w = og_c["wordmarkWidth"]; h = int(main.height * w / main.width)
og.alpha_composite(main.resize((w, h), Image.LANCZOS), ((og_c["width"] - w) // 2, (og_c["height"] - h) // 2 - 20))
og.convert("RGB").save(os.path.join(ROOT, "apps/web/src/app/opengraph-image.png"), optimize=True)
print("생성 완료: public/logo/* · src/app/icon.png · src/app/opengraph-image.png  → 확인 후 `vercel deploy --prod`")
