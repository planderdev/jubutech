#!/usr/bin/env node
/**
 * design/tokens.json → 파생 파일 생성기
 *   (design/tokens.json 자체는 public/assets/css/ds.css 에서 scripts/export_tokens.py 가 생성한다 — 원본은 ds.css)
 *   src/styles/tokens.css            앱용 :root (RGB 삼중값 — Tailwind alpha 지원) + hex 변수
 *   public/design-system/tokens.css  가이드 페이지용 :root (hex)
 *   public/design-system/index.html  컬러 섹션(<!-- tokens:colors -->)과 웹 토큰 코드 블록(#tokens) 재생성
 * 옵션: --check  src/ 안의 토큰 밖 하드코딩 hex를 찾아 보고(수정하지 않음)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const T = JSON.parse(fs.readFileSync(path.join(root, "design/tokens.json"), "utf8"));

const hex2rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const triplet = (h) => hex2rgb(h).join(" ");
const resolveRef = (ref) => {
  const [g, k] = ref.split(".");
  if (g === "red") return T.color.red.scale[k];
  if (g === "semantic") return semantic[k];
  if (g === "base") return T.color.base[k].hex;
  throw new Error("unknown ref " + ref);
};
const red = T.color.red;
const primary = red.scale[red.primary], hover = red.scale[red.hover], pressed = red.scale[red.pressed], primaryLight = red.scale[red.primaryLight];
const semantic = {};
for (const [k, v] of Object.entries(T.color.semantic)) semantic[k] = v.hex ?? resolveRef(v.ref);
const shadowRed = T.shadow.red.template.replace("{primary}", hex2rgb(primary).join(", "));

// ── 1) 앱용 tokens.css
let app = `/* 자동 생성 — design/tokens.json 에서 \`npm run tokens\` 로 생성. 직접 수정 금지. (v${T.meta.version} · ${T.meta.updated}) */\n:root {\n`;
app += `  --font-body: ${T.font.body};\n\n`;
for (const [k, v] of Object.entries(T.color.base)) app += `  --${k}: ${triplet(v.hex)};`.padEnd(30) + `/* ${v.hex} ${v.desc} */\n`;
app += `  --red: ${triplet(primary)};`.padEnd(30) + `/* ${primary} Primary — Red ${red.primary} */\n`;
app += `  --red-hover: ${triplet(hover)};`.padEnd(30) + `/* ${hover} Red ${red.hover} */\n`;
app += `  --red-pressed: ${triplet(pressed)};`.padEnd(30) + `/* ${pressed} Red ${red.pressed} */\n\n`;
app += `  --radius: ${T.radius.default};\n  color-scheme: light;\n}\n`;
fs.writeFileSync(path.join(root, "apps/web/src/styles/tokens.css"), app);

// ── 2) 가이드용 tokens.css (hex)
let g = `/* 자동 생성 — design/tokens.json (v${T.meta.version} · ${T.meta.updated}). 직접 수정 금지. */\n:root{\n`;
g += "  " + Object.entries(T.color.base).map(([k, v]) => `--${k}:${v.hex};`).join("") + "\n";
g += `  --red:${primary};--red-hover:${hover};--red-pressed:${pressed};--red-light:${primaryLight};\n`;
g += "  " + Object.entries(red.scale).map(([k, v]) => `--red-${k}:${v};`).join("") + "\n";
g += "  " + Object.entries(T.color.pastel).map(([k, v]) => `--${k}:${v.hex};--${k}-soft:${v.soft};`).join("") + "\n";
g += "  " + Object.entries(semantic).map(([k, v]) => `--${k}:${v};`).join("") + "\n";
g += `  --font:${T.font.body};\n`;
g += "  " + Object.entries(T.radius).filter(([k]) => k !== "default" && k !== "arch").map(([k, v]) => `--r-${k}:${v};`).join("") + "\n";
g += `  --sh-soft:${T.shadow.soft};--sh-card:${T.shadow.card};--sh-float:${T.shadow.float};--sh-red:${shadowRed};\n}\n`;
fs.writeFileSync(path.join(root, "apps/web/public/design-system/tokens.css"), g);

// ── 3) 가이드 HTML 컬러 섹션 + 웹 토큰 블록
const sw = (hex, label, extra = "", cls = "") => `      <div class="sw${cls}" data-hex="${hex}"><div class="c" style="background:${hex}${extra}"></div><div class="t"><b>${label}</b>${hex}</div></div>`;
const light = (hex) => { const [r, gg, b] = hex2rgb(hex); return r + gg + b > 720 ? ";border-bottom:1px solid var(--hairline)" : ""; };
let colors = `<!-- tokens:colors:start (자동 생성 — design/tokens.json) -->\n`;
colors += `    <p class="label" style="color:var(--ink-3);margin:0 0 8px">Base</p>\n    <div class="grid g5" style="margin-bottom:24px">\n`;
colors += Object.values(T.color.base).map((v) => sw(v.hex, v.label, light(v.hex))).join("\n") + "\n    </div>\n";
colors += `    <p class="label" style="color:var(--ink-3);margin:0 0 8px">Web Color — 웹용 색상 스케일 (HEX)</p>\n    <div class="grid" style="grid-template-columns:repeat(6,1fr);margin-bottom:24px">\n`;
colors += Object.entries(red.scale).map(([k, v]) => {
  const tag = k === red.primary ? " · Primary" : k === red.primaryLight ? " · Primary light" : k === red.hover ? " · hover" : k === red.pressed ? " · pressed" : "";
  return sw(v, k + tag, light(v), tag.includes("Primary") ? " primary" : "");
}).join("\n") + "\n    </div>\n";
colors += `    <p class="label" style="color:var(--ink-3);margin:0 0 8px">Pastel (일러스트·태그 보조)</p>\n    <div class="grid g4" style="margin-bottom:24px">\n`;
colors += Object.entries(T.color.pastel).map(([k, v]) => `      <div class="sw" data-hex="${v.hex}"><div class="c" style="background:linear-gradient(90deg,${v.soft} 50%,${v.hex} 50%)"></div><div class="t"><b>${k[0].toUpperCase() + k.slice(1)}</b>${v.soft} / ${v.hex}</div></div>`).join("\n") + "\n    </div>\n";
colors += `    <p class="label" style="color:var(--ink-3);margin:0 0 8px">Semantic</p>\n    <div class="grid g4">\n`;
colors += Object.entries(T.color.semantic).filter(([, v]) => v.label).map(([k, v]) => sw(semantic[k], v.label)).join("\n") + "\n    </div>\n";
colors += `    <!-- tokens:colors:end -->`;

let pre = `<pre id="tokens">/* src/styles/tokens.css — design/tokens.json 에서 자동 생성 */\n:root {\n`;
for (const [k, v] of Object.entries(T.color.base)) pre += `  --${k}: ${triplet(v.hex)};`.padEnd(28) + `/* ${v.hex} ${v.desc} */\n`;
pre += `  --red: ${triplet(primary)};`.padEnd(28) + `/* ${primary} Primary (Red ${red.primary}) */\n`;
pre += `  --font-body: ${T.font.body.split(",").slice(0, 2).join(",")}, system-ui, sans-serif;\n  --radius: ${T.radius.default};\n}\n/* Tailwind: bg-canvas bg-paper bg-inset bg-stage text-ink text-ink-2 text-ink-3 border-hairline border-edge text-red bg-red · red-50~950 · rounded-{xs..2xl} · shadow-{soft,card,float,red} */</pre>`;

const gp = path.join(root, "apps/web/public/design-system/index.html");
let html = fs.readFileSync(gp, "utf8");
const cs = html.indexOf("<!-- tokens:colors:start"), ce = html.indexOf("<!-- tokens:colors:end -->");
if (cs < 0 || ce < 0) throw new Error("가이드에 tokens:colors 마커가 없습니다");
html = html.slice(0, cs) + colors + html.slice(ce + "<!-- tokens:colors:end -->".length);
html = html.replace(/<pre id="tokens">[\s\S]*?<\/pre>/, pre);
html = html.replace(/Design System v[\d.]+ · [\d.]+/, `Design System v${T.meta.version} · ${T.meta.updated.replace(/-/g, ".")}`);
html = html.replace(/Primary #[0-9A-F]{6}/, `Primary ${primary}`).replace(/Canvas #[0-9A-F]{6}/, `Canvas ${T.color.base.canvas.hex}`);
fs.writeFileSync(gp, html);

// ── 2b) 공유 패키지용 tokens.ts (모바일 앱이 import)
const sharedTs = `// 자동 생성 — design/tokens.json 에서 \`npm run tokens\` 로 생성. 직접 수정 금지. (v${T.meta.version} · ${T.meta.updated})
export const color = ${JSON.stringify({ ...Object.fromEntries(Object.entries(T.color.base).map(([k, v]) => [k.replace("-", ""), v.hex])), primary, primaryHover: hover, primaryPressed: pressed, primaryLight, primaryTint: red.scale["100"], ...semantic, rose: red.scale, pastel: Object.fromEntries(Object.entries(T.color.pastel).map(([k, v]) => [k, { base: v.hex, soft: v.soft }])) }, null, 2)} as const;
export const radius = ${JSON.stringify(Object.fromEntries(Object.entries(T.radius).map(([k, v]) => [k, typeof v === "string" ? parseInt(v) : v])), null, 2)} as const;
export const shadow = { soft: { shadowColor: "#14141E", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 1 }, card: { shadowColor: "#14141E", shadowOpacity: 0.07, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 3 }, float: { shadowColor: "#14141E", shadowOpacity: 0.12, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 8 } } as const;
export const font = { family: "Pretendard", regular: "Pretendard-Regular", medium: "Pretendard-Medium", semibold: "Pretendard-SemiBold", bold: "Pretendard-Bold", extrabold: "Pretendard-ExtraBold" } as const;
export const space = [4, 8, 12, 16, 20, 24, 32] as const;
/** Base UI 1.8.0 의미 토큰 전체 (ds.css 원본) — palette · light/dark(label/background/line/status/fill/inverse/accent/alias/elevation) · typography · radius · space · control */
export const baseui = ${JSON.stringify(T.baseui, null, 2)} as const;
export type BaseUiTheme = typeof baseui.light;
`;
fs.mkdirSync(path.join(root, "packages/shared/src"), { recursive: true });
fs.writeFileSync(path.join(root, "packages/shared/src/tokens.ts"), sharedTs);

console.log(`tokens v${T.meta.version}: primary ${primary} · canvas ${T.color.base.canvas.hex} → apps/web tokens.css · 가이드 · packages/shared/src/tokens.ts 갱신`);

// ── 4) --check: 토큰 밖 하드코딩 hex 탐지
if (process.argv.includes("--check")) {
  const allow = new Set(["#FEE500", "#191600", "#03C75A"]); // 카카오·네이버 브랜드 버튼
  const known = new Set([...Object.values(T.color.base).map((v) => v.hex), ...Object.values(red.scale), ...Object.values(semantic), ...Object.values(T.color.pastel).flatMap((v) => [v.hex, v.soft])].map((h) => h.toUpperCase()));
  const files = [];
  (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : /\.(tsx?|css)$/.test(f) && !p.endsWith("tokens.css") && files.push(p); } })(path.join(root, "apps/web/src"));
  let n = 0;
  for (const f of files) fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    for (const m of line.match(/#[0-9A-Fa-f]{6}\b/g) ?? []) { const h = m.toUpperCase(); if (allow.has(h)) continue; n++; console.log(`  ${path.relative(root, f)}:${i + 1}  ${m}${known.has(h) ? "  (토큰 값과 같음 → 클래스/변수로 교체 권장)" : "  (토큰에 없는 색)"}`); }
  });
  console.log(n ? `⚠ 하드코딩 hex ${n}건` : "✓ 토큰 밖 하드코딩 hex 없음");
}
