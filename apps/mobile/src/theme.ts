import type { TextStyle } from "react-native";
import { tokens } from "@jubutech/shared";

/**
 * 디자인 토큰 — 원본은 PHP 데모의 `public/assets/css/ds.css`(Base UI 1.8.0).
 * `npm run tokens` 가 `design/tokens.json` → `packages/shared/src/tokens.ts` 의 `baseui` 로 내보낸 값만 쓴다.
 * 화면 코드에 hex 를 직접 적지 않는다.
 */
const { baseui } = tokens;

/** 의미 색 (light) — label / background / line / status / fill / primary … */
export const T = baseui.light;
/** 팔레트 — grey/blue/red/orange/yellow/green/teal/purple 50~900 */
export const P = baseui.palette;
/** 간격 8·16·24·32·40·48·56·64·72·80 */
export const SP = baseui.space;
/** 라운드 xs 4 · sm 8 · md 12 · lg 16 · xl 24 · full */
export const RAD = baseui.radius;
/** 컨트롤 높이 sm 32 · md 40 · lg 48 · xl 56 */
export const CTRL = baseui.control;
export const TOUCH = baseui.touchTarget;
export const F = tokens.font;

export type Weight = keyof Pick<typeof F, "regular" | "medium" | "semibold" | "bold" | "extrabold">;
export type TypeName = keyof typeof baseui.typography;

/** ds.css `--font-size-*`/`--line-height-*`/`--letter-spacing-*` 를 RN 텍스트 스타일로 */
export function typo(name: TypeName, weight: Weight = "regular", color: string = T.label.normal): TextStyle {
  const t = baseui.typography[name];
  return { fontFamily: F[weight], fontSize: t.fontSize, lineHeight: t.lineHeight, letterSpacing: t.letterSpacing, color };
}

/** ds.css `--elevation-shadow-normal-*` 근사 (RN 은 단일 그림자만 지원) */
export const ELEV = {
  small: { shadowColor: P.grey[900], shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  medium: { shadowColor: P.grey[900], shadowOpacity: 0.07, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  large: { shadowColor: P.grey[900], shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
} as const;

/** 앱 셸 치수 — ds.css/app.css 의 `.top-nav--app`·`.bottom-nav--floating`·`.app-nav-frame` */
export const SHELL = {
  headerHeight: SP[64],
  /** 모바일 `--responsive-space-24` = 16 */
  gutter: SP[16],
  navHeight: SP[80],
  navBottomGap: SP[16],
  /** `.app-main::after` — 플로팅 탭바에 가리지 않도록 본문 끝에 두는 여백 */
  contentBottomSpace: SP[80] + SP[16] + SP[24],
} as const;

/** 외부 브랜드 색 — 카카오 로그인 버튼은 카카오 디자인 가이드 색을 그대로 써야 한다 (Base UI 토큰 밖, 유일한 예외) */
export const BRAND = { kakao: "#FEE500", kakaoLabel: "#191600" } as const;
