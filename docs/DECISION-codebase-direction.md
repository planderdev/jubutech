# 기준 코드베이스·토큰·Supabase 제안 (2026-10-22)

> **결정(2026-10-22, 사용자)**: **(a)** PHP 데모는 UI/UX 사양으로만 쓰고, 사용자 앱은 Expo(React Native), 관리자는 Next.js로 구현한다. 이전 모노레포(`apps/web`·`apps/mobile`·`packages/shared`·`supabase`)를 이 저장소로 가져와 PHP 데모 옆에 둔다. 디자인 토큰 원본은 `ds.css`(3절). Primary는 팀장 값 `#DB6287` 기준(변경 시 ds.css 수정).

`docs/HANDOFF-app-direction.md`의 세 가지 결정 사항에 대한 조사 결과와 제안이다. 결정 전까지 두 코드베이스를 합치거나 삭제하지 않는다.

## 0. 확인한 것

- 로컬 PHP 8.5.10으로 `php -S 127.0.0.1:8088 -t public public/router.php` 실행. `/`, `/finance`, `/journal`, `/campaigns`, `/community`, `/mypage`, `/finance/categories`, `/campaigns/cp1`, `/journal/entries/new`, `/dev/showcase` 모두 200. `/admin`은 `/admin/login`으로 303 후 데모 시작 버튼으로 대시보드·체험단 목록 진입 확인.
- 모바일 뷰포트(375px)에서 재테크·매매일지·체험단·커뮤니티·마이 5개 홈 화면 캡처 확인. 서비스 전환 드롭다운(재테크 정보 ▾)으로 하단 탭 구성이 서비스별로 바뀌는 구조(재테크: 홈·정보·커뮤니티·마이 / 매매일지: 요약·일지·분석·마이 / 체험단: 홈·탐색·내 응모·마이).

## 1. 두 코드베이스 비교

| 항목 | 팀장 PHP 데모 (이 저장소) | 이전 모노레포 (`/Users/plander/jubutech`) |
|---|---|---|
| 사용자 화면 | 라우트 48개, 전 기능 흐름(응모→선정→후기, 일지 작성·분석·공유, 포인트 교환, 문의, 알림, 검색) | 웹 사용자 화면 6종 + Expo 5탭 스켈레톤(내용 없음) |
| 관리자 | 16개 리소스, 검색·필터·벌크·CSV·검수 이력, 검수 문서·스크린샷 | Next.js `/admin7` 10페이지, Vercel 배포 중 |
| 디자인 시스템 | Base UI 1.8.0 파생 `ds.css` 7,708줄 · 변수 799개 · 컴포넌트 183종 · light/dark 완비 · 관리자 전용 `admin-ds.css` | `design/tokens.json`(색 29·라운드·섀도) → `tokens.ts`·`tokens.css` 생성기, 피그마 변수 47개 |
| 브랜드 색 | Primary `#DB6287` (soft `#FBEFF3`, strong `#C7597B`, heavy `#B4506F`, 다크 `#E489A5`) | Primary 로즈 `#C77991` (50~950 스케일, hover `#B95574`) |
| 서체 | Pretendard(로컬 woff2) | Pretendard(variable CDN / otf 번들) |
| 데이터 | PHP 세션 + `app/data/fixtures.php` 22개 엔티티, DB 없음 | Supabase 마이그레이션 `0001_init.sql` 테이블 16개 + RLS + 가입 트리거 |
| 검증 | smoke/HTTP/unittest/node test/Playwright | typecheck |
| 네이티브 앱 적합성 | 서버 렌더링 HTML이라 그대로는 스토어 앱 불가(WebView 래핑 시 가능) | Expo SDK 57 + expo-router 준비됨 |

핵심: **화면·흐름·컴포넌트 사양은 PHP 데모가 압도적으로 완성도가 높고**, **네이티브 앱 실행 기반과 백엔드 스키마는 이전 모노레포에만 있다.** 두 쪽이 겹치는 영역은 관리자 웹과 브랜드 색뿐이다.

## 2. 기준 코드베이스 제안 — (c) 혼합

| 영역 | 기준 | 이유 |
|---|---|---|
| 사용자 앱 UI/UX 사양 | **PHP 데모** (`app/pages/*.php`, `ds.css`, `/dev/showcase`) | 피그마 9화면보다 넓고, 상태·빈 화면·검수 기준까지 있음 |
| 사용자 앱 구현 | **Expo(React Native)** 신규 — 이 저장소에 `apps/mobile` 추가 | 방향(iOS·Android 네이티브) 확정. 이전 Expo 스켈레톤은 5탭 껍데기뿐이라 구조만 가져오고 화면은 PHP 사양대로 새로 만듦 |
| 관리자 웹 | **PHP 관리자 유지·발전** → Supabase Postgres에 PDO(pgsql)로 연결 | 16개 리소스·벌크·검수 이력이 이미 있고 팀장 작업분과 같은 스택. Next.js `/admin7`은 참고용으로만 보관 |
| 백엔드 | **Supabase**(무료 조직 신규) | 이전 마이그레이션 재사용 가능, Expo·PHP 모두 접속 가능 |
| 디자인 토큰 원본 | **`ds.css`** (3절) | 아래 |

대안과 버리는 것:
- (a) Expo만: 관리자까지 다시 만들어야 해서 PHP 관리자 16개 리소스를 버리게 된다.
- (b) PHP 발전: 사용자 앱을 WebView로 감싸는 하이브리드가 되어 푸시·네이티브 제스처·스토어 심사에서 불리하다. 빠른 출시가 최우선이면 중간 단계로는 가능하다.
- 관리자를 Next.js로 할지 PHP로 할지는 팀장의 선호가 결정 요인이다. PHP 관리자가 Supabase에 붙으려면 `pdo_pgsql` 확장과 서비스 키 관리가 필요하며, RLS를 우회하는 서버 역할이므로 관리자 로그인(Supabase Auth 또는 자체)이 선행돼야 한다.

## 3. 디자인 토큰 통합 — `ds.css`를 원본으로, JSON은 생성물로

이전 세션의 `tokens.json → tokens.css/tokens.ts` 생성 방향을 뒤집는다. 이유: `ds.css`는 Base UI 1.8.0 파생물로 팔레트→의미(label/background/line/status/accent/elevation)→별칭(`--text`, `--surface`…) 3계층과 light/dark가 이미 완성돼 있고, 팀장이 직접 편집하는 파일이다. 799개 변수를 JSON에서 재생성하는 것은 위험이 크다.

절차:
1. `scripts/export_tokens.py`(저장소가 이미 Python 검사 스크립트를 씀) — `ds.css`의 `:root`, `[data-theme="light"]`, `[data-theme="dark"]` 블록을 파싱해 `design/tokens.json`(생성물, 커밋)과 `apps/mobile/src/theme/tokens.ts`를 출력. `var()` 참조는 해석해 실값으로, `color-mix`·`clamp`는 RN용으로 근사값 계산.
2. RN 타이포는 `--font-size-*`/`--line-height-*`/`--letter-spacing-*`(display·title·heading·headline·body·label·caption)을 그대로 스타일 객체로 매핑.
3. 이전 `tokens.json`의 라운드(카드 20)·섀도·파스텔 4색은 `ds.css`에 동등 토큰이 있는지 확인 후 없으면 **ds.css에 추가**하는 식으로만 반영(JSON 직접 편집 금지).
4. `scripts/audit_tokens.py`에 "JSON이 ds.css와 일치하는가" 검사를 붙여 회귀 방지.

**결정 필요 1 — Primary 색상**: 팀장 `#DB6287`(선명한 핑크) vs 이전 `#C77991`(차분한 로즈). 하나로 정해야 하며, 바꾸는 쪽은 `ds.css` 4개 변수(`--primary-soft/normal/strong/heavy`)와 `--inverse-primary`, 로고 파생 아이콘만 손보면 된다. 추천: 팀장 값 유지(관리자 블루와의 대비, 상태 색 톤이 이미 맞춰져 있음). 이전 피그마 변수는 추후 `ds.css` 기준으로 재동기화.

## 4. Supabase 연결 순서

전제: 사용자가 무료 조직·프로젝트(리전 ap-northeast-2 서울)를 만들고 프로젝트 ref를 알려준다. 그때까지는 3절 토큰 작업과 Expo 스캐폴드를 진행한다.

1. **스키마 조정 마이그레이션 `0002`** — 이전 `0001_init.sql` 16개 테이블을 PHP 데모의 22개 엔티티에 맞춘다. 추가: `categories`, `checklist`(버전 스냅샷), `reviews`(응모와 분리, pending/revision/approved/rejected), `rewards`/`exchanges`, `inquiries`, `banners`(유형·위치·기간), `settings`, `journal goals`. 변경: `applications.status`를 PHP의 `applied/selected/not_selected/cancelled`로, `campaigns`에 `publicationStatus`·노출 기간·질문·미션 분리. 삭제 검토: `advertiser` 역할·`profile_channels`(PHP 데모에 광고주 센터가 없음).
2. **시드** — `app/data/fixtures.php`를 SQL 시드로 변환해 앱·관리자가 같은 가상 데이터를 보게 한다(기준 시각 2026-10-21 12:00 KST 유지).
3. **MCP로 적용·타입 생성** — `apply_migration` → `generate_typescript_types` → `packages/shared/database.ts` 갱신, `get_advisors`로 RLS 누락 확인.
4. **Expo 연결** — 이전 `apps/mobile/src/lib/supabase.ts`(AsyncStorage 세션) 재사용, `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY`.
5. **PHP 관리자 연결** — `DemoRepository`와 같은 인터페이스의 `PostgresRepository`를 만들어 환경변수로 전환(세션 데모 모드는 그대로 남겨 검수 스크립트 유지).
6. 소셜 로그인(네이버·카카오)은 Supabase Auth 커스텀 OAuth가 아니라 서버 교환이 필요하므로 별도 단계.

## 5. 결정 후 첫 작업 순서(제안)

1. `scripts/export_tokens.py` + `design/tokens.json` 생성 (반나절)
2. `apps/mobile` Expo 스캐폴드: 서비스 전환 + 서비스별 하단 탭 셸, 재테크 홈 1화면을 PHP 사양대로 (1~2일)
3. Supabase 프로젝트 생성 후 `0002` 마이그레이션·시드 (1일)
4. 체험단 흐름(탐색→상세→응모→내 응모) 앱 구현 — 데이터 연동 첫 수직 슬라이스

## 6. (a) 결정 후 이 세션에서 한 일 (2026-10-22, 미커밋)

- 이전 모노레포에서 `apps/web`·`apps/mobile`·`packages/shared`·`supabase/`·`design/`·`scripts/{tokens.mjs,logo.py,supabase-check.mjs,capture-landing.sh}`·`docs/{BRAND.md,benchmark-daangn.md,benchmark/}`를 복사(이전 git 이력은 가져오지 않음, `/Users/plander/jubutech`에 그대로 남아 있음). 루트 `package.json`(npm workspaces)·`package-lock.json`·`.gitignore` 추가 항목. PHP 데모 파일은 건드리지 않음.
- `scripts/export_tokens.py` 신규: `ds.css`의 `:root`/light/dark 블록 → `design/tokens.json`. 최상위 `color/radius/shadow/font`는 기존 웹 토큰 파이프라인(`tokens.mjs`·Tailwind·`logo.py`) 호환 계층, `baseui`는 Base UI 의미 토큰 전체(팔레트·light/dark 126개·타이포 19+20종·radius·space·control). `--check`로 일치 검사.
- `scripts/tokens.mjs`가 `packages/shared/src/tokens.ts`에 `baseui` export를 추가 생성. 웹 `tokens.css`·가이드·공유 토큰 재생성(Primary `#DB6287`, canvas `#F7F7F9`, ink `#191F28`). `apps/mobile/app.json` 아이콘 배경·로고 파생 아이콘도 새 Primary로 재생성.
- 루트 스크립트 `npm run tokens | tokens:check | typecheck | dev | mobile | php`. `.claude/launch.json`에 `php-demo`·`web` 실행 설정. README 말미에 "앱 작업분" 절 추가.
- 검증: `npm run typecheck` 3개 워크스페이스 통과, Next.js dev `/`·`/landing`·`/admin7/login`·`/info`·`/campaigns` 200, PHP `tests/smoke.py` 119건 통과, `tokens:check` 통과.

## 7. 다음 단계

1. Supabase 무료 조직·프로젝트 생성(사용자) → `0002` 마이그레이션(4절) · 시드.
2. Expo 앱 셸: 서비스 전환 + 서비스별 하단 탭, 재테크 홈 1화면을 PHP 사양대로 `baseui` 토큰으로 구현.
3. Next.js 관리자를 PHP 관리자 16개 리소스 사양(`docs/admin-operations.md`)에 맞춰 재구성.
4. 첫 커밋 메시지에 팀장 작업분과 구분해 명시, push 전 사용자 확인.
