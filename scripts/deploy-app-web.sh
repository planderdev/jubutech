#!/usr/bin/env bash
# 모바일 앱(Expo)을 웹으로 내보내 Vercel `jubutech-app` 프로젝트에 올린다 (화면 검토용, PHP 데모와 나란히 비교).
#   scripts/deploy-app-web.sh          → 미리보기 배포
#   scripts/deploy-app-web.sh --prod   → 운영 주소(jubutech-app.vercel.app) 갱신 — 대표님 확인 후에만
# Supabase 주소·공개 키는 apps/mobile/.env.local(EXPO_PUBLIC_*)에서 빌드 때 번들에 들어간다. 공개 키라 노출돼도 되지만 RLS 가 전제다.
# 동적 경로(/article/:id 등)는 Expo 정적 내보내기가 `article/[id].html` 로 만들므로 vercel.json rewrites 로 연결한다.
# 목적지는 대괄호를 %5B·%5D 로 적고 .html 을 뺀다(cleanUrls). `[id].html` 그대로 쓰면 Vercel 이 404 를 낸다 (2026-11-12 확인).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(mktemp -d "${TMPDIR:-/tmp}/jubutech-app-web.XXXXXX")"
trap 'rm -rf "$OUT"' EXIT

(cd "$ROOT/apps/mobile" && npx expo export -p web --output-dir "$OUT/site")
cp "$OUT/site/+not-found.html" "$OUT/site/404.html"

# [param].html 파일마다 rewrite 를 만든다 (깊은 경로 먼저)
node - "$OUT/site" > "$OUT/site/vercel.json" <<'NODE'
const fs = require("fs"), path = require("path");
const root = process.argv[2], files = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (f.name.endsWith(".html")) files.push(path.relative(root, p)); } })(root);
const rewrites = files
  .filter((f) => f.includes("[") && !f.startsWith("("))
  .sort((a, b) => b.split("/").length - a.split("/").length)
  .map((f) => ({ source: "/" + f.replace(/\.html$/, "").replace(/\[(\w+)\]/g, ":$1"), destination: "/" + f.replace(/\.html$/, "").replace(/\[/g, "%5B").replace(/\]/g, "%5D") }));
process.stdout.write(JSON.stringify({ cleanUrls: true, trailingSlash: false, rewrites }, null, 2));
NODE

mkdir -p "$OUT/site/.vercel"
cd "$OUT/site"
JUBUTECH_APP_PROJECT_ID="${JUBUTECH_APP_PROJECT_ID:-prj_xSGSJ1pgPZ5Yohb0hJtnqCNFT6IR}"
if [[ -n "$JUBUTECH_APP_PROJECT_ID" ]]; then
  printf '{"projectId":"%s","orgId":"team_3GbbjHZZhXI73Tk7bz348kci","projectName":"jubutech-app"}\n' "$JUBUTECH_APP_PROJECT_ID" > .vercel/project.json
else
  vercel link --yes --scope planderdevs-projects --project jubutech-app >/dev/null
fi
vercel deploy --scope planderdevs-projects --yes "$@"
