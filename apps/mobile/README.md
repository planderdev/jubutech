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
  _layout.tsx              루트 Stack
  index.tsx                진입 → 마지막 서비스 홈으로 Redirect (기본 /finance)
  finance/                 재테크 정보: index(홈) · categories(정보) · community · my   ← PHP /finance, /finance/categories, /community, /mypage?mode=finance
  journal/                 주식매매일지: index(요약) · entries(일지) · analysis(분석) · my ← PHP /journal, /journal/entries, /journal/analysis
  campaigns/               체험단 응모: index(홈) · explore(탐색) · applications(내 응모) · my ← PHP /campaigns, /campaigns/explore, /applications
src/lib/service.ts         SERVICES(이름·설명·아이콘·탭 = PHP user.php 의 $modes·$navs), useService(), 마지막 서비스 저장
src/components/
  app-header.tsx           .top-nav--app — 서비스 전환 버튼(▾)·검색·알림
  service-sheet.tsx        mode-sheet — "어떤 일상을 시작할까요?" 바텀시트, 선택 시 router.replace(`/${service}`)
  service-tabs.tsx         서비스별 Tabs 레이아웃 (탭 구성은 SERVICES 에서)
  floating-tab-bar.tsx     .bottom-nav--floating — 떠 있는 알약형 하단 탭
  screen.tsx               AppScreen(헤더+스크롤, 탭바 여백) · ContentSection(거터)
  ui.tsx                   GroupCard · ListHeader · TextButton · IconButton · Badge · MenuRow · CardFooterLink · Button · Placeholder
  banner-slider.tsx        .banner-slider — 홈 배너 (슬라이드 너비 = 화면-48, 비율 1.55, "1 | 2")
  finance.tsx              HomeContext · CategoryShortcuts · ArticleRow (PHP financeHome 구성요소)
src/theme.ts               T(baseui.light 의미 색) · P(팔레트) · SP · RAD · CTRL · typo(name, weight, color) · ELEV · SHELL
assets/images/category/    PHP /assets/images/category/*.svg 복사본 (지원금·정책·절약·카드혜택·육아·반려)
assets/images/banners/     PHP 배너 이미지를 640px 로 줄인 webp
```

구현된 화면: 재테크 홈 1화면(`/finance`). 나머지 11개 탭은 `Placeholder` 로 PHP 대응 경로만 표시한다.
