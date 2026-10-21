# 주부테크 PHP 프론트 데모

Base UI 1.8.0을 적용한 모바일 사용자 앱과 PC 관리자 화면입니다. PHP 서버 렌더링과 Vanilla JS를 사용하며 Node 빌드, Composer, DB 설치 없이 실행합니다.

## 실행

PHP 8.2 이상을 권장합니다. 프로젝트 폴더에서 실행하세요.

```powershell
php -S 127.0.0.1:8088 -t public public/router.php
# 또는
powershell -ExecutionPolicy Bypass -File scripts/start.ps1
```

- 재테크: <http://127.0.0.1:8088/finance>
- 매매일지: <http://127.0.0.1:8088/journal>
- 체험단: <http://127.0.0.1:8088/campaigns>
- 관리자: <http://127.0.0.1:8088/admin> → 관리자 데모 시작
- 관리자 업무 기능표: [docs/admin-operations.md](docs/admin-operations.md)
- 관리자 구현·검수·변경 전후: [docs/admin-review/verification.md](docs/admin-review/verification.md)
- 세 화면 비교: <http://127.0.0.1:8088/dev/showcase>
- 본문 검수: <http://127.0.0.1:8088/dev/showcase?view=content>

문서 루트는 반드시 `public/`로 제한합니다. PHP 내장 서버는 로컬 검토용입니다.

## 구조와 편집

```text
public/
  index.php, router.php     진입점과 개발 서버 라우터
  assets/
    css/
      ds.css                Base UI 토큰·Reset·Base·Content·컴포넌트 원본
      app.css               화면 구성과 배치
    js/
      ds.js                 Base UI 공통 동작 원본
      app.js                앱 이벤트·입력 검증·개발 검수
      base-ui-adapters.js    날짜 선택과 기존 PHP 화면 연결
      sliders.js            Swiper 배너·추천·칩·주간 날짜
      motion.js, scroll.js   AOS·Lenis 초기화
      navigation-state.js   목록 위치·필터 복원
      media.js, form-steps.js 미디어·단계 폼
      *-qa.js               개발 검수 화면용 검사
    fonts/, icons/          폰트·아이콘
    images/, media/         로고·사진·영상
    vendor/                 버전 고정 외부 라이브러리
    NOTICE.txt              외부 자산 라이선스·미디어 출처 고지
app/                        PHP 화면·액션·세션 저장소·가상 데이터
scripts/                    실행·외부 라이브러리 확보·CSS 검사
tests/                     기능·스타일·인터랙션 회귀검사
```

CSS는 `public/assets/css/`, JS는 `public/assets/js/`에서 직접 편집합니다. 별도 생성 소스나 CSS 생성 단계는 없습니다.

- 공용 토큰과 컴포넌트 변경은 `css/ds.css`, 공통 동작 변경은 `js/ds.js`에서 수행합니다.
- `css/app.css`는 앱 화면 구성만 담당합니다. 공용 컴포넌트나 토큰을 다른 파일에서 덮어쓰지 않습니다.
- 관리자는 `assets/admin/css/admin-ds.css`·`admin.css`와 `assets/admin/js/admin.js`를 사용합니다. 사용자 CSS·JS를 중복 로드하지 않습니다. 어드민 브랜드는 블루 `#2563EB`이며 사용자 앱은 기존 핑크를 유지합니다.
- 브랜드 `#DB6287`과 같은 톤의 상태 색상, 채움 위 흰색, 기존 light/dark 의미 토큰을 유지합니다.
- 프라이머리 색상은 `--primary-normal`, `--primary-strong`, `--primary-heavy`, `--primary-soft`, `--inverse-primary`에서 관리합니다. 진행 막대는 `--primary-normal`을 사용합니다.
- 보조 버튼과 일반 안내문은 중립색을 사용하며, 회색 배경의 입력 폼은 흰색 콘텐츠 면으로 구분합니다. 섹션 사이 간격과 시트 좌우 여백은 24px를 기준으로 합니다.
- 기본 `<hr>`와 `.hr` 클래스는 높이 8px의 구분선입니다. 색상은 `--surface-alt`를 사용합니다.
- 레이아웃 간격은 8px 배수이며 0은 직접 작성합니다. 반응형 간격은 breakpoint별로 변경합니다.
- 각도·개별 모서리·비율·효과 시간을 무조건 전역 변수로 만들지 않습니다. 컴포넌트 전용 수치는 해당 CSS에서 관리하고, 기존 팔레트·타이포·공통 모션 토큰과 실제 키보드·뷰포트·CTA 측정값은 유지합니다.
- Reset, Base, `.post` Content 스타일은 `css/ds.css`의 기존 주석과 선택자에서 관리합니다.
- AOS 2.3.4, Lenis 1.3.27, Swiper 12.0.3은 필요한 화면에만 로드합니다.
- 외부 라이브러리의 원본 LICENSE와 폰트·아이콘·미디어의 고지는 배포 자산과 함께 보관합니다.

## 검증

서버가 켜진 상태에서 실행합니다. HTTP 검사는 별도 쿠키를 사용하므로 사용자 세션에 영향을 주지 않습니다.

```powershell
python -X utf8 tests/smoke.py
python -X utf8 tests/account_pages.py
python -X utf8 tests/followup.py
python -X utf8 tests/interactions.py
python -X utf8 -m unittest discover -s tests -p '*_*.py'
node --test tests/*.test.cjs
python -X utf8 tests/admin_operations.py
python -X utf8 tests/admin_design.py
# Playwright 설치 환경에서 PLAYWRIGHT_MODULE을 지정한 뒤:
node tests/admin-browser.cjs
python -X utf8 scripts/audit_spacing.py
python -X utf8 scripts/audit_tokens.py
Get-ChildItem app,public -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }
```

검사 결과는 `.runtime/audits/`와 `tests/results/`에 저장하며 배포할 필요가 없습니다.

## 데모 데이터

처음에는 가상 회원 서연맘(m1)으로 시작합니다. MY 설정에서 가상 계정을 바꿀 수 있습니다. 사용자와 관리자에서 같은 쿠키 세션을 공유하면 응모·선정·후기 상태가 연결됩니다. 관리자 운영 설정에서 데모를 초기화할 수 있습니다.

- 거래·응모·후기 등은 PHP 세션에만 저장합니다. 기준 시각은 `2026-10-21T12:00:00+09:00`으로 고정합니다.
- 실제 인증·DB 영구 보관·외부 메시지 발송·배송·쿠폰·주식 거래·시세는 연결하지 않았습니다.
- 가상 정보만 입력하세요. 사용자 앱 업로드는 로컬 미리보기입니다. 관리자 콘텐츠·배너의 PNG·WebP 업로드는 로컬 파일로 보관하며, 운영 저장소는 미연동입니다.
- 모드 선호만 localStorage에 저장합니다. 거래·응모 데이터는 브라우저 저장소에 복제하지 않습니다.
- 밀키트 체험단 상세는 Unsplash·Pixabay 음식 참고 사진 5장을 표시합니다. 갤러리 등록은 `app/data/campaign-galleries.php`, 사진 출처는 `public/assets/images/campaign-sources.json`에서 관리합니다. 다른 캠페인은 기존 분류 그래픽을 사용하며 출처·사용 조건은 `public/assets/NOTICE.txt`에 있습니다.
- 체험단 상세의 리뷰와 상품정보·상세이미지는 체험 소개에 속합니다. 승인된 후기만 공개하며 화면 확인용 리뷰는 `app/data/campaign-reviews.php`에서 관리하고 예시임을 표시합니다. 관심 있을 만한 상품은 탭 영역 아래에 배치하며 `/campaigns/{id}/recommendations`에서 2개씩 추가 로딩합니다. 현재 상품·비공개·모집 종료 항목을 제외하고 중복 없이 표시하며, 자바스크립트 없이도 더 보기 링크로 이어서 볼 수 있습니다.
