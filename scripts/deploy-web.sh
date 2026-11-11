#!/usr/bin/env bash
# 관리자 웹(apps/web)을 Vercel 프로젝트 `jubutech`(Root Directory = apps/web)에 배포한다.
# 저장소 루트의 vercel.json·.vercelignore 는 팀장 PHP 데모(`jubutech-php-demo`)용이라 apps 를 업로드에서 뺀다.
# 그래서 웹에 필요한 파일만 임시 폴더에 모아 그 폴더를 올린다. PHP 데모 설정은 건드리지 않는다.
#   사용: scripts/deploy-web.sh          → 미리보기
#         scripts/deploy-web.sh --prod   → 운영 (jubutech.vercel.app 이 바뀐다)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/jubutech-web-deploy.XXXXXX")"
trap 'rm -rf "$STAGE"' EXIT

rsync -a \
  --exclude '.git' --exclude 'node_modules' --exclude '.next' --exclude '.expo' --exclude '.vercel' \
  --exclude '.env' --exclude '.env.*' --exclude '.claude' \
  --exclude '/app' --exclude '/public' --exclude '/tests' --exclude '/api' \
  --exclude '/vercel.json' --exclude '/.vercelignore' \
  --exclude 'docs/screenshots' --exclude 'apps/mobile/assets' \
  "$ROOT/" "$STAGE/"
# 다른 apps/*/.env.example 은 남아도 되지만 실제 키 파일은 위에서 뺐다
mkdir -p "$STAGE/.vercel"
printf '{"projectId":"prj_DvJQiVCgelGAUQADdVvxQy8rtNIg","orgId":"team_3GbbjHZZhXI73Tk7bz348kci","projectName":"jubutech"}\n' > "$STAGE/.vercel/project.json"
echo "staged: $(du -sh "$STAGE" | cut -f1)"
cd "$STAGE"
vercel deploy --scope planderdevs-projects --yes "$@"
