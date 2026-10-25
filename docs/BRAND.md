# 주부테크 (JubuTech) 브랜드 시스템 레퍼런스 — v2

> v2 (2026-09-16 전면 개편): 사용자 제공 두 번째 무드보드 — 연분홍 캔버스 위 흰 라운드 카드 앱 UI, 비비드 레드 + 블랙 CTA, 플랫 일러스트(레드 액센트·스파클), 스텝 진행바, 하단 3탭 내비, Pretendard 단일 서체
> (v1 "크림 종이 + 레드 선 + 세리프" 시스템은 폐기)
> 사업기획 mindmap: `/Users/plander/Desktop/[작업 진행중]/주부테크/jubutech_business_mindmap.md`
> 웹 가이드: `public/design-system/index.html` (→ `/design-system`) · 모든 주부테크 사이트·배너·에셋·PPT 작업의 단일 소스

## 브랜드 코어
- **정의**: 주부의 소비·공부·부업·정보공유 활동에 가치를 부여하는 생활경제 커뮤니티 플랫폼 (투자 플랫폼이 아니라 생활경제·소득 플랫폼)
- **메인 메시지**: 주부의 일상이 돈이 되는 곳
- **서브 메시지**: 현명한 소비도, 소소한 공부도 모두 재테크가 됩니다
- **확장 메시지**: 돈 버는 방법을 알려주는 곳에서, 돈 벌 기회를 주는 곳으로
- **사용자 가치 5축**: SAVE(아끼기) · LEARN(공부하기) · EARN(벌기, 핵심) · GROW(불리기) · CAREER(다시 일하기)
- **타깃**: 30~45세 기혼 여성, 경력단절·휴직 중 재택 소득을 원하는 주부 / 2차: 신혼·자녀교육비 가구·반려가구·재테크 입문자
- **톤앤보이스**: 다정하지만 또렷하게(Warm & Clear) · 생활 언어(Everyday) · 과장 없는 숫자(Honest) · 종목 추천 금지, 기준·원칙 중심
- **인스타 핸들**: @jubutech2026

## 무드 키워드
Clean(깨끗한) · Rounded(부드러운 라운드) · Vivid(선명한 레드 포인트) · Friendly(친근한 플랫 일러스트) · App-like(앱 같은 카드 UI)

## 컬러
- **Canvas**: `#FFFFFF` (흰색 페이지 바닥, 2026-09-24; 300 `#EAC3CF`은 Primary light로 강조 면에 사용) · **Paper** `#FFFFFF` (카드·헤더·시트) · **Inset** `#F6F7FA` (일러스트 타일·인풋 바닥)
- **Stage (Black)**: `#17171A` — 블랙 히어로 카드·보조 CTA("완료"·"닫기")·활성 네비
- **Rose (Primary)**: `#C77991` (600, 2026-09-24 사용자 지정) — 600을 기준으로 HSL(342°, 41%)에서 50~950을 파생: 50 #FCF5F7 · 100 #F9EBF0 · 200 #F3DBE2 · 300 #EAC3CF · 400 #DDA7B7 · 500 #D18FA3 · 600 #C77991 · 700 #B95574 · 800 #9C405C · 900 #773147 · 950 #50212F — Primary CTA·강조 숫자·활성 탭·배지. hover `#B95574`(700), pressed `#9C405C`(800)
- Red 스케일: 50 `#FFF1F2` · 100 `#FFE0E3` · 200 `#FFC2C7` · 300 `#FF94A0` · 400 `#F85B6A` · **500 `#E8232F`** · 600 `#C81C27` · 700 `#A5161F` · 800 `#7E1118` · 900 `#570C10`
- **Ink**: `#1A1A1E` (텍스트) · Ink-2 `#545660` (보조) · Ink-3 `#9A9CA8` (뮤트·플레이스홀더) · Hairline `#EEEFF3` (카드 안 구분선) · Edge `#F9EBF0` (셸 가장자리·상단바·하단탭 경계 = Rose 100)
- **Support (soft/base)**: Rose `#FFE9EE`/`#FFB3C0` · Sage `#E6F5EC`/`#9ED1B0` · Butter `#FFF4D6`/`#FFD98A` · Sky `#E6F0FD`/`#9CC4F5`
- **Status**: Success `#1F9D55` · Warning `#D9840D` · Danger `#E8232F` · Info `#2F6FE8`
- **주식 손익**: 수익 = Red `#E8232F` · 손실 = Blue `#2F6FE8`
- 원칙: 캔버스는 연회색, 면은 흰색, **레드는 CTA·강조·배지에만**. 블랙은 히어로 카드와 보조 CTA. 넓은 면에 레드를 칠할 때는 반드시 흰 글자(대비 4.6:1).

## 타이포그래피 — Pretendard 단일
- **Pretendard Variable** (npm `pretendard` 동적 서브셋) — 서체 하나로 위계는 굵기·크기·자간으로만
- Display 800 (자간 -3%, 줄간격 120%) · Heading 700 (자간 -2%) · Body 400/500 (자간 -1%, 줄간격 150%) · Label 600 12px
- 스케일: Display 1–3 = 52/40/32 · H1–H4 = 34/26/22/18 · Body L/M/S = 17/15/14 · Label/Caption = 12/11
- 숫자는 `tabular-nums` (가격·수익률·포인트)
- 영문 대문자 장식·모노스페이스·세리프 사용 금지

## 형태·간격
- Radius: xs 6 · sm 10 · md 12 (버튼·인풋) · lg 16 · xl 20 (카드) · 2xl 24 (히어로 카드) · pill 999 (칩·배지)
- Shadow: soft `0 2px 12px rgba(20,20,30,.05)` (기본 카드) · card `0 6px 20px rgba(20,20,30,.07)` (강조 카드) · float `0 12px 32px rgba(20,20,30,.12)` (시트·드로어) · red `0 8px 20px rgba(232,35,47,.28)` (Primary 버튼)
- 카드는 **보더 없이** 흰 면 + 소프트 섀도. 구분은 Hairline 1px 또는 Inset 면으로
- Spacing 4pt 그리드: 4/8/12/16/24/32/48/64
- Container: max 1200px, 거터 16(mobile)/24(tablet)/32(desktop) · Breakpoints sm 640 · md 768 · lg 1024 · xl 1280

## 그래픽 모티프
- **Illust tile**: 연회색(Inset) 라운드 20px 타일 위 흰 라운드 칩 + 레드 라인 아이콘, 주변에 레드 스파클(짧은 대시·점)
- **Black hero card**: 블랙 24px 라운드 카드 + 흰 헤드라인 + 레드 강조어 + 레드 원형 화살표
- **Step bar**: 상단 2px 진행바(레드 채움) + "STEP 1 / STEP 2" 라벨
- **Red pill badge**: D-day·상태 표시 레드 알약 배지
- **Stat card**: 흰 카드 안 큰 숫자(Bold, tabular) + 회색 라벨
- 아이콘: 24 그리드 stroke 1.6 라운드 캡, currentColor (기본 Red)

## 로고 (공식 자산 — 임의 재현 금지)
- 원본: `design/logo-source.png`(한글 워드마크 "주부테크", 402×102) · `design/logo-source-en.png`(영문 "JUBUTECH", 580×88) — 2026-09-24 사용자 제공, 가는 획 레드 `#DE082F`. `npm run logo`로 `public/logo/*` 생성. 원본 해상도가 낮아 OG·아이콘이 흐릴 수 있으니 고해상도/SVG 원본을 받으면 같은 파일명으로 교체 후 재실행
- 변형: `jubutech-wordmark-white.png`(블랙·레드 배경용) · `jubutech-wordmark-ink.png`(단색) · 영문 `jubutech-wordmark-en(-white/-ink).png` (`<Logo en />`) · `app-icon-512/192.png`·`apple-touch-icon.png`(레드 라운드 스퀘어 + 흰 "주") · `src/app/icon.png`(파비콘) · `src/app/opengraph-image.png`
- 로고 레드 실측 `#DD092F`(v2.1) → 2026-09-17 웹 컬러 스케일 도입으로 Primary `#D73B50`(600)·Primary light `#FFD7D7`(300)로 교체. 스케일: 50 #FFF7F7 · 100 #FFEFEF · 200 #FFE7E7 · 300 #FFD7D7 · 400 #F59EAC · 500 #E36176 · 600 #D73B50 · 700 #BC2B44 · 800 #9E3844 · 900 #7D3033 · 950 #5F1C23
- 2026-09-24: 사용자 지정 Primary `#C77991`(로즈)로 교체, 스케일은 HSL(342°, 41%) 파생. 워드마크 PNG는 여전히 옛 레드라 새 로고 교체 전까지 색이 다름
- 최소 높이: 화면 20px · 최소 여백: 글자 높이의 1/2 · 텍스트 워드마크를 서체로 조판해 대체하지 않는다

## 컴포넌트 규정
- Button: primary(레드 면·흰 글자·레드 섀도) · ink(블랙) · secondary(흰 면·hairline) · soft(Inset 면) · ghost · danger(Red-50 면·레드 글자). 라운드 12(md)/16(lg), 높이 44/52
- Card: 흰 면 + rounded-xl(20) + shadow-soft, hover 시 -2px 리프트 + shadow-card
- Chip: pill, 흰 면·hairline, 선택 시 블랙 반전
- Badge: pill soft 배경 (모집중 레드 / 선정발표 버터 / 미션진행 세이지 / 마감 뮤트 / 검수중 스카이)
- Tab: 하단 2px 레드 언더라인
- Input: Inset 면 + 라운드 12, focus 시 흰 면 + 레드 보더 + 레드 12% 링
- Mobile: 하단 5탭 바(홈·정보·커뮤니티·체험단·MY) 흰 면 + 상단 그림자, 활성 탭 레드

## 카피 규정
- 브랜드명: 주부테크 / JubuTech (J·T 대문자)
- 금지: "수익 보장", "종목 추천", "확정 수익" 류 표현. 금융 정보에는 출처·기준일 표기
- 광고·협찬·제휴는 반드시 [광고] [체험단] 표시

## 교체 절차 — 디자인 시스템 / 로고 갱신 (2026-09-17 준비)

새 디자인 시스템과 로고가 오면 아래 순서대로 한다. 색·서체·라디우스·섀도는 **`design/tokens.json` 한 곳**만 고친다.

**받아야 할 것**
- 로고: 투명 배경 PNG(가로형 워드마크, 긴 변 1500px 이상) 또는 SVG → PNG 내보내기. 앱 아이콘 심볼이 따로 있으면 정사각 PNG 1장 추가.
- 컬러: Primary 스케일(50~950) + 캔버스/페이퍼/잉크/구분선 + 시맨틱(success/warning/info) HEX.
- 서체: 이름과 로드 방식(npm 패키지 또는 CDN CSS). 굵기 사용 범위.
- 라디우스·섀도 값(있으면). 없으면 현행 유지.

**순서**
1. `design/tokens.json` 수정 — `color.base.*.hex`, `color.red.scale`(스케일 전체), `color.red.primary/primaryLight/hover/pressed`(단계 번호), `pastel`, `semantic`, `radius`, `shadow`, `font.body`, `meta.version/updated`.
2. `npm run tokens` — `src/styles/tokens.css`(앱 :root), `public/design-system/tokens.css`(가이드), 가이드 컬러 섹션·웹 토큰 블록·버전 표기가 재생성된다. `tailwind.config.ts`·`src/app/layout.tsx`(themeColor)는 JSON을 직접 읽으므로 손댈 것 없음.
3. `npm run tokens:check` — 토큰 밖에 하드코딩된 HEX가 있으면 파일:줄로 보고한다(카카오·네이버 버튼색은 허용).
4. 서체가 바뀌면 `src/app/layout.tsx`의 Pretendard CSS import와 가이드 `<link>`(Pretendard CDN)를 새 서체로 교체하고 `font.body`를 맞춘다. `tailwind.config.ts`는 `--font-body`만 참조하므로 그대로.
5. 로고: 원본 PNG를 `design/logo-source.png`로 저장(심볼 파일은 `design/logo-mark.png` + `logo.mark.mode`를 `file`로) → `npm run logo`. 워드마크 3종·앱 아이콘 4종·파비콘·OG가 재생성되고 실측 색을 출력한다. `Logo` 컴포넌트(`src/components/layout/logo.tsx`)는 파일명을 고정 참조하므로 코드 수정 없음. 로고 비율이 크게 달라지면 `Logo`의 size 높이표(20/24/32/44)만 조정.
6. 반영 확인: `npm run dev` → `/`, `/stock`, `/campaigns`, `/design-system`, `/landing`, `/admin7`(로컬 키 `dev`) 점검. 일러스트 `public/illust/*.svg`와 `public/landing/*.webp`는 색이 박혀 있으므로 필요 시 SVG 색 교체 후 `npm run capture`로 목업 재캡처.
7. 이 문서(BRAND.md)의 색 표·로고 절 수치와 `README.md` 디자인 절을 갱신하고, `vercel deploy --prod` 한 번 실행(단일 프로젝트 `jubutech`).

**토큰이 닿지 않는 곳(교체 시 직접 확인)**
- `public/illust/hero-mom.svg` 등 일러스트의 fill 값
- `public/landing/app-*.webp` 앱 스크린샷(재캡처)
- `src/app/login/page.tsx` 카카오·네이버 브랜드 버튼색(브랜드 가이드라 고정)
- `public/logo/*`·`src/app/icon.png`·`src/app/opengraph-image.png`(`npm run logo`가 생성)
