#!/usr/bin/env bash
# 랜딩페이지 폰 목업(apps/web/public/landing/app-*.webp) 재캡처 — 앱 UI가 바뀔 때마다 실행
# 사전 조건: 개발 서버 실행 중 (기본 http://localhost:3017), Google Chrome, Pillow
set -euo pipefail
cd "$(dirname "$0")/.."
BASE="${BASE:-http://localhost:3017}"
C="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
curl -sf -o /dev/null "$BASE/" || { echo "개발 서버가 없습니다: $BASE (npm run dev 후 재시도)"; exit 1; }
for pair in "home:/" "stock:/stock" "campaigns:/campaigns"; do
  n=${pair%%:*}; u=${pair#*:}
  "$C" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=20000 --window-size=390,844 --screenshot="apps/web/public/landing/app-$n.png" "$BASE$u" >/dev/null 2>&1
done
python3 - <<'PY'
from PIL import Image; import os
for n in ["app-home","app-stock","app-campaigns"]:
    p=f"apps/web/public/landing/{n}.png"; im=Image.open(p).convert("RGB").crop((0,0,390,844)); im.save(f"apps/web/public/landing/{n}.webp","WEBP",quality=88); os.remove(p); print(n, os.path.getsize(f"apps/web/public/landing/{n}.webp"))
PY
