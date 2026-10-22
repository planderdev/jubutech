import type { Config } from "tailwindcss";
import tokens from "../../design/tokens.json";

const hex2rgb = (h: string) => { const n = parseInt(h.slice(1), 16); return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`; };
const red = tokens.color.red.scale as Record<string, string>;
const primary = red[tokens.color.red.primary];
const pastel = tokens.color.pastel;
const semantic = { success: tokens.color.semantic.success.hex, warning: tokens.color.semantic.warning.hex, info: tokens.color.semantic.info.hex };

/**
 * 주부테크 디자인 시스템 — 단일 소스는 design/tokens.json.
 * 시맨틱 색(canvas/paper/ink/red…)은 src/styles/tokens.css 의 :root 변수(자동 생성)를, 스케일·파스텔·섀도는 JSON을 직접 읽는다.
 * 원칙: 연회색 캔버스 + 흰 라운드 카드(보더 없음, 소프트 섀도) · 레드는 CTA·강조 · 블랙은 보조 CTA·반전 카드
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", md: "1.5rem", lg: "2rem" }, screens: { "2xl": "1200px" } },
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        serif: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        inset: "rgb(var(--inset) / <alpha-value>)",
        stage: "rgb(var(--stage) / <alpha-value>)",
        ink: { DEFAULT: "rgb(var(--ink) / <alpha-value>)", 2: "rgb(var(--ink-2) / <alpha-value>)", 3: "rgb(var(--ink-3) / <alpha-value>)" },
        hairline: "rgb(var(--hairline) / <alpha-value>)",
        edge: "rgb(var(--edge) / <alpha-value>)",
        red: { ...red, DEFAULT: "rgb(var(--red) / <alpha-value>)", hover: "rgb(var(--red-hover) / <alpha-value>)", pressed: "rgb(var(--red-pressed) / <alpha-value>)" },
        rose: { DEFAULT: pastel.rose.hex, soft: pastel.rose.soft },
        sage: { DEFAULT: pastel.sage.hex, soft: pastel.sage.soft },
        butter: { DEFAULT: pastel.butter.hex, soft: pastel.butter.soft },
        sky: { DEFAULT: pastel.sky.hex, soft: pastel.sky.soft },
        success: semantic.success,
        warning: semantic.warning,
        danger: primary,
        info: semantic.info,
        up: primary,
        down: semantic.info,
      },
      borderRadius: { xs: tokens.radius.xs, sm: tokens.radius.sm, md: tokens.radius.md, lg: tokens.radius.lg, xl: tokens.radius.xl, "2xl": tokens.radius["2xl"], arch: tokens.radius.arch },
      boxShadow: {
        soft: tokens.shadow.soft,
        card: tokens.shadow.card,
        float: tokens.shadow.float,
        red: tokens.shadow.red.template.replace("{primary}", hex2rgb(primary)),
        hard: tokens.shadow.card,
        "hard-red": tokens.shadow.red.template.replace("{primary}", hex2rgb(primary)),
        "hard-sm": tokens.shadow.soft,
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "slide-in-right": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: { "fade-up": "fade-up .45s ease-out both", marquee: "marquee 28s linear infinite" },
    },
  },
  plugins: [],
};
export default config;
