# 카카오 로그인 연결 절차 (모바일 · 2026-10-30)

앱 코드는 준비돼 있다(`apps/mobile/src/lib/auth.tsx`, `app/login.tsx`, `app/auth/callback.tsx`). 아래 값만 채우면 동작한다.
방식: **Supabase Auth 의 카카오 OAuth** — 네이티브 카카오 SDK 없이 시스템 브라우저로 로그인하므로 Expo Go 에서도 되고, 앱스토어 심사용 빌드에서도 같은 코드를 쓴다.

## 1. 카카오 개발자 콘솔 (https://developers.kakao.com)
1. 내 애플리케이션 → 애플리케이션 추가 (앱 이름 "주부테크", 회사명).
2. **앱 키** 에서 `REST API 키` 를 복사 (Supabase 에 넣을 값). 네이티브 앱 키는 지금 방식에선 안 쓴다.
3. 카카오 로그인 → **활성화 ON**.
4. 카카오 로그인 → Redirect URI 등록:
   - `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
5. 카카오 로그인 → 동의항목:
   - 닉네임(profile_nickname) **필수**, 프로필 사진(profile_image) 선택
   - 카카오계정(이메일) — Supabase 는 이메일을 사용자 식별에 쓰므로 **필수 동의** 권장. 이메일을 필수로 두려면 카카오 **비즈 앱 전환**(사업자 정보 등록)이 필요하다. 전환 전에는 "선택 동의"로 두고 테스트한다(이메일 없이 가입되면 Supabase 가 가짜 이메일 없이 user 를 만들며, 프로필 트리거는 닉네임으로 동작).
6. 보안 → **Client Secret 생성** 후 "활성화" 상태로. (Supabase 카카오 설정의 Client Secret 에 넣는다)
7. 플랫폼 → Web 에 사이트 도메인 `https://<SUPABASE_PROJECT_REF>.supabase.co` 추가 (웹 앱 도메인도 함께).
8. 팀원 추가: 테스트 단계(앱 미심사)에서는 **팀 멤버로 등록된 카카오 계정만 로그인된다**. 대표님·팀장·배우자 테스터 계정을 팀원으로 초대.

## 2. Supabase 대시보드
1. Authentication → Providers → **Kakao** ON
   - Client ID = 카카오 **REST API 키**
   - Client Secret = 1-6 에서 만든 값
2. Authentication → URL Configuration → **Redirect URLs** 에 앱 딥링크 추가 (둘 다):
   - `jubutech://auth/callback`  (빌드 앱, `app.json` scheme)
   - `exp://127.0.0.1:8081/--/auth/callback`  (Expo Go 개발 — 기기에서 실행할 땐 PC IP 로 바뀜. `exp://**` 와일드카드로 등록해도 됨)
3. SQL: `supabase/migrations/0001_init.sql` 의 `handle_new_user` 트리거가 가입 즉시 `profiles` 행과 가입 포인트를 만든다(이미 포함).

## 3. 앱 환경 변수 (`apps/mobile/.env`)
```
EXPO_PUBLIC_SUPABASE_URL=https://<SUPABASE_PROJECT_REF>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```
값이 비어 있으면 앱은 **데모 모드**(로그인 없이 서연맘)로 동작하고 로그인 화면에 "키 등록 전" 안내가 뜬다.

## 4. 동작 확인
1. `cd apps/mobile && npx expo start` → Expo Go 로 열기.
2. 온보딩 → "카카오로 시작" (또는 마이 탭 → 로그인) → 브라우저 창에서 카카오 동의 → 앱으로 돌아오면 마이 탭 프로필에 카카오 닉네임.
3. Supabase → Authentication → Users 에 사용자, `profiles` 에 행이 생겼는지 확인.
4. 실패 시: Supabase Auth Logs 에서 `redirect_to` 불일치(2-2 미등록) 또는 카카오 `KOE006`(Redirect URI 미등록)·`KOE101`(키 오류)을 본다.

## 5. 아직 안 한 것 / 결정 필요
- **웹과 계정 통합**: 웹(apps/web)은 Auth.js(JWT, `AUTH_KAKAO_ID`)로 카카오를 쓴다. 한 계정으로 합치려면 웹도 Supabase Auth 로 옮기는 것이 단순하다(W8 에서 함께).
- 응모·후기·지갑 데이터는 아직 데모 회원(서연맘) 기준. 로그인 사용자로 바꾸는 일은 Supabase 연결(W8)과 함께.
- 네이버 로그인은 Supabase 기본 제공자에 없어 2단계(커스텀 OIDC 또는 웹 전용)로 미룬다.
- 지역 인증(1-4 「내 지역 지원금」의 `User.region`)은 카카오 프로필에 주소가 없으므로 온보딩에서 직접 고르는 화면이 필요하다.
