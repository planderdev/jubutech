# Supabase 연결 절차 (1단계 W8)

프로젝트 ref 가 생기면 이 순서대로 한다. 2026-11-10 기준 준비는 끝났고, **프로젝트 생성만 남았다.**

## 0. 지금 준비된 것

| 항목 | 위치 | 확인 방법 |
|---|---|---|
| 스키마 4개 | `supabase/migrations/0001_init.sql` ~ `0004_app_model.sql` | `npm run db:check` 가 임베디드 Postgres(PGlite)에 전부 적용 |
| 데모 시드 | `supabase/seed.sql` (생성 파일) | `npm run db:seed` 로 다시 만든다 |
| 행 ↔ 앱 객체 변환 | `packages/shared/src/db-map.ts` | `npm run db:check` 가 시드를 다시 읽어 `DEMO_*` 와 같은지 비교 (회원·체험단·응모·후기·정보·글·댓글·지갑·생활력·일지) |
| 규칙 판단 | `packages/shared/src/*.ts` | `npm run check:shared` |
| 클라이언트 | `apps/mobile/src/lib/supabase.ts`, `apps/web` | 환경 변수가 비면 데모 모드로 동작 |

## 1. 프로젝트 만들기 (대표님 결정)

- 조직 `planderdev's Org` 에 새로 만들면 **월 $10** 이 든다(2026-11-10 Supabase 비용 조회).
- 다른 무료 조직이나 기존 프로젝트를 쓰려면 ref 만 알려 주면 된다. 다른 서비스 프로젝트에 섞지 않는다.
- 지역은 다른 프로젝트처럼 `ap-northeast-2`(서울).

## 2. 스키마·시드 적용

1. `0001` → `0002` → `0003` → `0004` 순서로 적용한다(MCP `apply_migration` 또는 `supabase db push`).
2. **개발용 프로젝트에만** `seed.sql` 을 넣는다. 데모 회원은 비밀번호 없는 계정이라 로그인할 수 없다.
3. 타입을 만든다: MCP `generate_typescript_types` 결과로 `packages/shared/src/database.ts` 를 교체.
4. 보안 점검: MCP `get_advisors`(security) 결과의 RLS 경고를 0003·0004 에서 정리.

## 3. 환경 변수

| 앱 | 키 |
|---|---|
| 모바일 `apps/mobile/.env` | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| 웹 `apps/web/.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`(서버 전용) |

카카오 로그인은 `docs/KAKAO-LOGIN-setup.md` (REST 키·시크릿, Redirect URL).

## 4. 데이터 어댑터 교체 (코드 작업)

- 모바일 `lib/demo-store.tsx`: 로그인 상태면 `hydrate` 에서 AsyncStorage 대신 DB 를 읽고(`rowTo*`), 각 동작은 `*ToRow` 로 쓴다. 비로그인은 지금처럼 기기 데모.
- 웹 `lib/store.ts`(zustand): admin7·광고주 센터부터 같은 변환 함수로 바꾼다. 이때 앱과 관리자가 처음으로 같은 데이터를 본다.
- 운영 규칙: `app_settings` 를 읽어 `resolveRules` 로 덮어쓴다(앱 `useRules`, 웹 `useRules`).
- 후기 승인·리워드·생활력은 한 번에 처리하는 RPC(`decide_review`)로 묶는다(0003 주석).

## 5. 결정이 필요한 것 (연결과 함께)

- **가입 축하 1,000P:** `0001` 가입 트리거가 가입 즉시 1,000포인트와 원장 행을 만든다. 운영 규칙 키에는 없고, 점검표 1-6 "가입 즉시 1,000P 문구"와 같은 문제다. 지급하려면 `reward.signupAmount` 키로 옮기고, 아니면 트리거에서 뺀다. (시드는 이 행을 지운다)
- **계정 삭제 RPC:** `0003` 의 `delete_my_account` 는 세무 보존 기록(5년)과 충돌하는지 확인 후 적용.
- **광고주 평가 시드:** `DEMO_BRAND_RATINGS` 는 실제 응모 없는 예시라 시드에 넣지 않았다.

## 6. 웹 배포 (Vercel `jubutech`, 2026-11-12 확인)

- 기존 Vercel 프로젝트 `jubutech`(https://jubutech.vercel.app, Root Directory `apps/web`)를 이어 쓴다.
- 저장소 루트의 `vercel.json`·`.vercelignore` 는 팀장 PHP 데모(`jubutech-php-demo`)용이라 `apps` 를 업로드에서 뺀다. 루트에서 `vercel deploy` 하면 "Root Directory apps/web does not exist" 로 실패한다.
- 그래서 `scripts/deploy-web.sh` 가 웹에 필요한 파일만 임시 폴더에 모아 올린다. 미리보기는 그대로, 운영은 `--prod`.
- 환경 변수 `ADMIN_ACCESS_KEY`·`AUTH_SECRET` 은 Production 에만 있다. 미리보기에서는 `/admin7` 이 404, `/api/auth/session` 이 500 이다(설계대로). 미리보기에서도 관리자를 보려면 두 값을 Preview 대상에도 추가한다.
- `/Users/plander/jubutech`(이전 모노레포 폴더)도 같은 프로젝트에 연결돼 있다. 거기서 배포하면 이 코드를 덮어쓴다.
