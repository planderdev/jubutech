import { tokens } from "@jubutech/shared";
/** 디자인 토큰 — design/tokens.json → packages/shared/src/tokens.ts (npm run tokens) */
export const C = tokens.color;
export const R = tokens.radius;
export const SH = tokens.shadow;
export const F = tokens.font;
export const text = {
  display28: { fontFamily: F.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.8, color: C.ink },
  display22: { fontFamily: F.extrabold, fontSize: 22, lineHeight: 28, letterSpacing: -0.5, color: C.ink },
  title18: { fontFamily: F.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.3, color: C.ink },
  title16: { fontFamily: F.bold, fontSize: 16, lineHeight: 22, letterSpacing: -0.2, color: C.ink },
  body15: { fontFamily: F.regular, fontSize: 15, lineHeight: 22, color: C.ink },
  body14: { fontFamily: F.regular, fontSize: 14, lineHeight: 21, color: C.ink2 },
  body13: { fontFamily: F.regular, fontSize: 13, lineHeight: 19, color: C.ink2 },
  label13: { fontFamily: F.semibold, fontSize: 13, lineHeight: 17, color: C.ink },
  label12: { fontFamily: F.semibold, fontSize: 12, lineHeight: 16, color: C.ink2 },
  label11: { fontFamily: F.semibold, fontSize: 11, lineHeight: 14, color: C.ink3 },
  num20: { fontFamily: F.bold, fontSize: 20, lineHeight: 24, letterSpacing: -0.3, color: C.ink, fontVariant: ["tabular-nums"] as const },
  num14: { fontFamily: F.semibold, fontSize: 14, lineHeight: 18, color: C.ink, fontVariant: ["tabular-nums"] as const },
} as const;
