# 1단계 출시 점검표 (W9 · 2026-11-01)

`docs/PLAN-stage1-2026-10-30.md` W9 "출시 관문". 코드에서 할 수 있는 것은 이 커밋에서 끝냈고, 나머지는 **누가·무엇을** 정해야 닫히는지 적었다.
스토어 심사 문구의 단일 출처는 `packages/shared/src/legal.ts` 다 — 앱 `/legal/[doc]`, 웹 `/legal/[doc]`, 스토어 콘솔 메모가 전부 여기서 나온다.

상태: ✅ 끝 · 🟡 코드는 끝, 외부 입력 대기 · ⬜ 아직

## 1. 심사용 리워드 문구

| # | 점검 | 상태 | 근거·남은 일 |
|---|---|---|---|
| 1 | 리워드가 "앱 내 결제·앱 마켓 결제와 무관한 활동 대가"임을 앱 안에서 말한다 | ✅ | 지갑 화면 하단 `rewardDisclaimer()`, 마이 탭 캡션, `/legal/reward` 1항 |
| 2 | 복권·도박·게임 요소가 없다고 심사 메모에 적는다 | ✅ | `STORE_LISTING.reviewNotes` |
| 3 | 검토용 빌드의 금액이 예시임을 표시한다 | ✅ | 지갑·마이 캡션, `/legal/reward` 6항 |
| 4 | 적립·출금·소멸·회수 기준을 문서로 둔다 | ✅ | `/legal/reward` 2~5항. 금액·오픈일은 운영 설정(`reward.reviewAmount`·`wallet.withdrawMin`·`wallet.withdrawOpenAt`)에서 채움 |
| 5 | 세금(기타소득 원천징수) 처리 기준 확정 | ⬜ | 대표님·세무. 출금 오픈(12월 1일) 전 `/legal/reward` 3항 문구 교체 |
| 6 | "가입 즉시 1,000P" 문구(웹 랜딩·로그인 화면)와 실제 규칙 일치 | ⬜ | `rules.ts` 에 가입 보너스 키가 없다. 지급할지 정하면 `reward.signupAmount` 추가, 아니면 문구 삭제 |
| 7 | 리워드 유효 기간 1년·소멸 30일 전 알림 | ⬜ | 문서에는 적었고 코드(소멸 처리·알림)는 W8 뒤 |

## 2. 개인정보·계정

| # | 점검 | 상태 | 근거·남은 일 |
|---|---|---|---|
| 1 | 개인정보처리방침을 가입 전에 볼 수 있다 | ✅ | 온보딩·로그인 화면 하단 링크 → `/legal/privacy`, 마이 > 약관·앱 정보 |
| 2 | 개인정보처리방침 공개 URL (스토어 등록 필수) | 🟡 | 웹 `/legal/privacy` 정적 생성. **배포 도메인 확정 후** 콘솔에 입력 |
| 3 | 수집 항목·목적·보유 기간 표 | ✅ | `COLLECTED_DATA` 5행 — App Privacy(Apple)·Data safety(Google) 답변도 이 표로 |
| 4 | 자녀 정보 미수집·만 14세 미만 가입 불가 | ✅ | `NOT_COLLECTED`, 약관 2항, 로그인·온보딩 캡션 |
| 5 | 제3자 제공(광고주 배송 정보)·처리 위탁(Supabase·카카오·푸시) 명시 | ✅ | `/legal/privacy` 4·5항 |
| 6 | 앱 안에서 계정 삭제를 시작할 수 있다 (Apple 5.1.1(v)·Google 정책) | 🟡 | 마이 > 약관·앱 정보 > 계정 삭제. 로그인 상태면 `auth.deleteAccount()` → 서버 RPC `delete_my_account` 호출, **W8 에서 RPC 구현**(없으면 세션만 끊고 접수 안내) |
| 7 | 응모 동의 문안을 실제 문안으로 교체 | ✅ | `CONSENT_SUMMARY` + "동의 내용 읽기" → `/legal/consent` |
| 8 | 사업자 정보 (상호·대표·주소·사업자번호·고객센터·개인정보 보호책임자) | ⬜ | `LEGAL_PLACEHOLDER` 〔 〕 6칸. 대표님이 주시면 한 곳만 바꾸면 됨 |
| 9 | 법률 검토 | ⬜ | 전 문서가 초안. `LEGAL_STATUS.stage` 를 `"published"` 로 바꾸면 "초안" 띠가 사라진다 |
| 10 | 권한 설명 | ✅ | 알림만 사용(expo-notifications). 위치·사진·연락처 권한 없음. iOS `ITSAppUsesNonExemptEncryption=false` (app.json) |

## 3. 빌드·스토어 등록

| # | 점검 | 상태 | 근거·남은 일 |
|---|---|---|---|
| 1 | 앱 이름·번들 ID | ✅ | `주부테크` · iOS `com.jubutech.app` · Android `com.jubutech.app` (app.json) |
| 2 | 스토어 설명·키워드·카테고리·심사 메모 초안 | ✅ | `STORE_LISTING` — 콘솔에 붙여 넣기 |
| 3 | 아이콘·스플래시 | ✅ | `apps/mobile/assets/images` (W1) |
| 4 | 스토어 스크린샷 | 🟡 | `docs/screenshots/stage1/` 에 에뮬레이터 캡처(1080×2400). 스토어 규격(iOS 6.7"·Android 16:9) 재촬영은 기기/빌드 확정 후 |
| 5 | EAS 빌드 설정(`eas.json`)·Apple 개발자 계정·Google Play 콘솔 | ⬜ | 계정이 없다. 대표님 명의로 등록 후 `eas build --profile preview` |
| 6 | 카카오 로그인 키·Redirect URL | ⬜ | `docs/KAKAO-LOGIN-setup.md`. 심사 빌드는 로그인 없이도 전부 둘러볼 수 있어 키 없이 제출 가능하나, 로그인 버튼이 실패 문구를 보이므로 키 등록 권장 |
| 7 | Supabase 프로젝트 ref (W8) | ⬜ | 없으면 데모 데이터로 심사 제출. 심사 메모에 "검토용 빌드" 고지 포함됨 |
| 8 | `npm run typecheck`·`npm run tokens:check` | ✅ | 2026-11-01 통과 (shared·web·mobile) |

## 4. 테스트 3명 결과

`docs/TEST-results-stage1.md` 에 기록 칸을 두었다. 아직 테스터 결과는 받지 못했고(앱을 건넨 적이 없다), 자체 점검에서 나온 것만 반영했다. 결과가 오면 그 파일 "반영" 열을 채우고 이 표를 갱신한다.

## 5. 심사 전 마지막 순서

1. 사업자 정보 → `LEGAL_PLACEHOLDER` 채우기 → 법률 검토 → `LEGAL_STATUS.stage = "published"`
2. 웹 배포 도메인 확정 → 콘솔 "개인정보처리방침 URL" = `https://<도메인>/legal/privacy`
3. 가입 1,000P·세금 처리 결정 → 문구 교체
4. EAS 빌드 → 스토어 규격 스크린샷 → `STORE_LISTING` 붙여 넣기 → 제출
