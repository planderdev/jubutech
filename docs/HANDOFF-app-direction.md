# 주부테크 앱 개발 전용 작업 — 인수인계 (2026-10-22)

이 문서는 이전 Claude 세션(`/Users/plander/jubutech` 모노레포 작업)에서 넘기는 맥락이다. 이 저장소(`planderdev/jubutech`, 팀장 작업분)는 **PHP 서버 렌더링 + Base UI 1.8.0 데모**(모바일 사용자 앱 + PC 관리자)이며, 이전 세션의 Next.js/Expo 모노레포와는 커밋 이력이 겹치지 않는 별개 코드베이스다. 어느 쪽을 기준으로 삼을지는 이 세션에서 사용자와 정한다.

## 1. 두 코드베이스 현황
| | 이 저장소 (팀장, GitHub `planderdev/jubutech`) | 이전 세션 (`/Users/plander/jubutech`, 로컬 git, 원격 없음) |
|---|---|---|
| 스택 | PHP 8.2+ 서버 렌더링, Vanilla JS, Base UI 1.8.0, Node 빌드 없음 | npm workspaces 모노레포: `apps/web`(Next.js 15 관리자·랜딩·API, Vercel 배포 중), `apps/mobile`(Expo SDK 57 스켈레톤, Android 에뮬레이터 확인됨), `packages/shared`(타입·목·토큰) |
| 화면 | 재테크/돈되는정보, 매매일지(목록·작성·분석·공유), 체험단(탐색·상세·응모·후기), 커뮤니티, 마이(포인트·미션·배지·설정), 포인트 교환, 공지, 문의, 검색, 알림, 관리자 전체 | 웹 사용자 화면(홈·정보·커뮤니티·체험단·매매일지 캘린더·MY) + 관리자 센터(/admin7) + 랜딩. 모바일은 5탭 스켈레톤만 |
| 실행 | `php -S 127.0.0.1:8088 -t public public/router.php` (로컬 PHP 8.5 확인됨) | `npm run dev`(웹) / `npm run mobile`(Expo) |
| 배포 | 없음 | https://jubutech.vercel.app (관리자 /admin7, 키는 Vercel env `ADMIN_ACCESS_KEY`) |
| 문서 | `README.md`, `docs/admin-operations.md`, `docs/admin-review/verification.md` | `README.md`, `BRAND.md`, `docs/benchmark-daangn.md` |

## 2. 이전 세션에서 확정된 결정·자산 (재사용 가능)
- **방향**: 클라이언트는 iOS·Android 네이티브 앱, 관리자는 웹. 스택은 Expo(React Native)로 잡았으나 팀장 작업분(PHP)과의 관계는 미정.
- **브랜드/디자인 토큰** 단일 소스: `/Users/plander/jubutech/design/tokens.json` (Primary 로즈 `#C77991`, 스케일 50~950, 캔버스 흰색, Pretendard, 라운드 20 카드, 영문 로고 JUBUTECH). 생성기 `npm run tokens`, 로고 파생 `npm run logo`.
- **피그마 앱 UI**: https://www.figma.com/design/qFDiIqCREL6o8cPtZKjXP9 (Foundations 변수 47개 · Components · 390px 화면 9개). 이 세션에서는 Figma 플러그인 재인증 필요.
- **Supabase**: 조직 `planderdev's Org`는 Pro($10/월 추가)라 사용자가 **무료 조직을 새로 만들기로** 함(아직 미생성). 초기 마이그레이션 `supabase/migrations/0001_init.sql`(RLS·가입 트리거 포함), 웹/모바일 클라이언트 코드, 연결 점검 스크립트는 이전 저장소에 준비돼 있음.
- **소셜 로그인**: 네이버·카카오 키 미등록. **Expo/EAS** 미로그인. **Xcode** 미설치(iOS 시뮬레이터 불가, Expo Go/EAS로 대체). Android SDK + AVD `Medium_Phone_API_36`(Google Play 이미지) 사용 가능.
- **당근 벤치마크**: `/Users/plander/jubutech/docs/benchmark-daangn.md` — 지역 1차 키, 인기 검색어 칩, 랭킹형 홈, 구조화 알바(부업) 카드, 광고주 신뢰 블록. 앱 전용 흐름 관찰은 에뮬레이터 Play 스토어 로그인 대기 중.
- **REA**(morluto/rea) CLI: `node ~/.npm/_npx/af752b90495482d7/node_modules/rea-agents/scripts/rea.mjs ...`. MCP 등록은 미완료.

## 3. 이 세션에서 먼저 정할 것
1. 기준 코드베이스: 팀장 PHP 데모를 **UI/UX 사양**으로 삼고 Expo 앱에 구현할지, PHP 데모 자체를 발전시킬지.
2. 디자인 시스템 충돌: 팀장분은 Base UI 토큰(`public/assets/css/ds.css`), 이전분은 로즈 토큰. 하나로 합칠 것.
3. 백엔드: Supabase 무료 조직 생성 후 연결(이전 저장소의 마이그레이션 재사용 가능).

## 4. 관련 경로
- 이 저장소: `/Users/plander/jubutech-team` (GitHub `planderdev/jubutech`, 커밋 `e26213e`)
- 이전 모노레포: `/Users/plander/jubutech` (커밋 `e358242`까지, 원격 없음)
- 이전 세션 메모리: `~/.claude/projects/-Users-plander-jubutech/memory/` (프로젝트·브랜드·배포 3개 파일)
