# 주부테크 모바일 앱 (Expo · React Native)

PHP 데모(`app/pages/*.php`, `public/assets/css/ds.css`)를 **UI/UX 사양**으로 삼아 구현한다. 화면 구조·문구·간격은 PHP 데모의 같은 라우트를 기준으로 한다.

- 실행: 저장소 루트에서 `npm run mobile` (Expo Dev Server) → Expo Go 앱으로 QR 스캔, 또는 `apps/mobile` 에서 `npx expo start --android` (AVD `Medium_Phone_API_36`) / `--ios`(Xcode 필요)
- 웹 미리보기: `npx expo start --web` (react-native-web)
- 공용 코드: `@jubutech/shared` — 타입·목 데이터·유틸·토큰(`tokens.baseui`)·PHP 픽스처형 데모 데이터(`fixtures.ts`, `DEMO_*`)
- 토큰: `ds.css` → `design/tokens.json` → `packages/shared/src/tokens.ts` (`npm run tokens`). 화면 코드에 hex 를 직접 쓰지 않는다 (`npm run tokens:check`)
- 아이콘: PHP 데모와 같은 lucide 아이콘(`lucide-react-native`). `src/components/icon.tsx` 에 쓰는 것만 등록

## 구조 (2026-10-25)

```text
src/app/
  _layout.tsx              루트 Stack: index · onboarding · (tabs) · 상세 라우트(campaign/[id]*, application/[id]*, wallet)
  index.tsx                진입 → 첫 실행이면 /onboarding, 아니면 마지막 서비스 홈(기본 /campaigns)
  onboarding.tsx           1-4 온보딩 "어떤 일상을 시작할까요?" — 목적 하나 → 기본 서비스 저장(미선택 시 체험단), 카카오로 시작
  login.tsx                로그인(모달) — 카카오 버튼 + 키 등록 전 데모 둘러보기. `next` 로 복귀
  auth/callback.tsx        OAuth 콜백 딥링크(jubutech://auth/callback) 처리
  (tabs)/_layout.tsx       하단 5탭 (B안): campaigns(체험단) · finance(지원금) · journal(주식) · community · my
  (tabs)/campaigns/        체험단 Stack: index(홈) · explore(탐색) · applications(내 응모) ← PHP /campaigns, /campaigns/explore, /applications
  (tabs)/finance/          지원금 Stack: index(홈) · categories(정보)                       ← PHP /finance, /finance/categories
  (tabs)/journal/          주식 Stack: index(요약) · entries(일지) · analysis(분석)           ← PHP /journal, /journal/entries, /journal/analysis
  (tabs)/community.tsx     커뮤니티 탭(자리) ← PHP /community
  (tabs)/my.tsx            마이 탭(공용) ← PHP /mypage
src/lib/service.ts         SERVICES(서비스 이름·상단 세그먼트 = PHP $navs 에서 마이·커뮤니티 제외), ROOT_TABS(하단 5탭), useService(), 마지막 서비스·온보딩 저장
src/components/
  app-header.tsx           .top-nav--app — 제목(서비스 이름 또는 heading)·검색·알림. B안이라 서비스 드롭다운(▾)은 없음
  service-stack.tsx        서비스 탭 안의 Stack(홈·하위 화면)
  service-segments.tsx     서비스 상단 세그먼트(.chip) — PHP 서비스별 하단 탭이 옮겨 온 자리. replace 로 전환
  floating-tab-bar.tsx     .bottom-nav--floating — 떠 있는 알약형 하단 탭 (루트 5탭)
  kakao-button.tsx         카카오 로그인 버튼(카카오 가이드 색 — theme.BRAND)
  money-cards.tsx          1-4 「돈 되는 일 카드」 3종(마감 임박 체험단·내 지역 지원금·지갑 요약) — 각 서비스 홈 상단
  screen.tsx               AppScreen(헤더+스크롤, 탭바 여백) · ContentSection(거터)
  ui.tsx                   GroupCard · ListHeader · TextButton · IconButton · Badge · MenuRow · CardFooterLink · Button · Placeholder
  banner-slider.tsx        .banner-slider — 홈 배너 (슬라이드 너비 = 화면-48, 비율 1.55, "1 | 2")
  finance.tsx              HomeContext · CategoryShortcuts · ArticleRow (PHP financeHome 구성요소)
  campaign.tsx             CampaignVisual · CampaignCard/Grid(.card--product, 2열) · CampaignShortcuts · ChipRow · EmptyState(.result) · Pagination · PageTitle · MissionRow · DateRow · Stars
  form.tsx                 Field(.field) · SearchInput(.input-wrap) · Checkbox · InfoBox(.box) · Accordion · BottomCta(.bottom-cta--app, 고정 CTA, tone=error 로 오류 문구)
  review.tsx               MissionChecklist(미션 카드 → 행, 검사 결과로 통과/미달/운영팀 확인 표시) · CheckResultList · PhotoStepper
  wallet.tsx               useWallet(집계·다음 할 일) · WalletCard(마이 탭 "오늘 번 돈" 카드) · NextActionRow · WalletEntryRow · Stat
  my-page.tsx              MyPage(mode) — PHP myPage(): 프로필 → 지갑 카드(PHP 포인트 패널 자리) → 나의 활동 → 주부테크와 함께. 세 서비스의 my.tsx 가 공용
src/lib/auth.tsx           AuthProvider/useAuth — Supabase Auth + 카카오 OAuth(PKCE, expo-web-browser). 키 없으면 status="demo". 절차: docs/KAKAO-LOGIN-setup.md
src/lib/demo-store.tsx     DemoProvider/useDemo — PHP DemoRepository 역할(응모·후기·저장을 AsyncStorage 에), submitReview/decideReview
src/lib/reminders.ts       후기 기한 로컬 알림(expo-notifications, rules.mission.reminderDaysBefore) — Expo Go 에서는 건너뜀
src/theme.ts               T(baseui.light 의미 색) · P(팔레트) · SP · RAD · CTRL · typo(name, weight, color) · ELEV · SHELL
assets/images/category/    PHP /assets/images/category/*.svg 복사본 (지원금·정책·절약·카드혜택·육아·반려)
assets/images/banners/     PHP 배너 이미지를 640px 로 줄인 webp (+ discovery-gift.svg)
assets/images/campaigns/   PHP campaign-cp1-0*.webp 를 720px 로 줄인 것 — 사진이 있는 캠페인은 cp1 뿐, 나머지는 분류 일러스트(PHP objectArt 대신)
```

구현된 화면 (2026-10-30): 온보딩(`/onboarding`), 재테크 홈(`/finance`), 체험단 홈·탐색·내 응모(`/campaigns*`), 체험단 상세·응모·응모 내역·후기 제출(`/campaign/[id]*`, `/application/[id]`, `/application/[id]/review`), 마이(`/my`)·나의 지갑(`/wallet`). 커뮤니티·정보·매매일지 화면은 `Placeholder` 로 PHP 대응 경로만 표시한다.

탭 구조 메모(W6, B안): PHP 데모는 상단 드롭다운으로 서비스를 바꾸고 서비스마다 하단 4탭이지만, 앱은 하단 5탭 고정 + 서비스 상단 세그먼트다(대표님 결정, 팀장과 공유 필요). 서비스 탭을 다시 누르면 마지막 세그먼트가 유지된다(중첩 Stack).

지갑 메모(W4): 집계·"다음 할 일"·출금 상태는 shared `wallet.ts`(walletSummary·walletNextAction·walletWithdrawState). 후기 승인(`decideReview` approved)이 `reward.reviewAmount` 를 `points` 에 쌓고, 캠페인 `benefitValue` 가 있으면 "받은 제품 가치"를 따로 기록한다. 금액 시각은 데모 시계 `DEMO_NOW` 기준. 출금은 `wallet.withdrawOpenAt` 전엔 안내 버튼만.

후기 제출 메모(W3): 미션 체크리스트는 입력에 따라 실시간으로 `checkReview`(shared) 결과를 보여 주고, CTA 는 링크 HEAD 확인 뒤 다시 검사해 미달이면 결과 시트(수정 / 그대로 제출)를 띄운다. 사진은 업로드 대신 장수만 센다(W8 뒤). AI 교정 버튼은 `rules.assist.aiReviewEdit` 가 켜질 때까지 자리만. 응모 내역의 "검토용 데모" 버튼(`__DEV__`)은 관리자 검수를 기기에서 흉내 내는 용도다.

상세 화면 메모: 히어로 갤러리·앵커 탭은 스크롤 위치 기반, PHP 의 sticky 는 미적용. 공유 버튼은 자리만. 추천 상품 '더 보기'는 2개씩 추가.
