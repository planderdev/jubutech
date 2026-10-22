#!/usr/bin/env python3
"""
public/assets/css/ds.css (Base UI 1.8.0, 팀장 작업분) → design/tokens.json 추출기.

디자인 토큰의 단일 원본은 ds.css 다. 이 스크립트는 :root / [data-theme="light"] / [data-theme="dark"]
블록의 CSS 변수를 읽어 var() 참조를 실값으로 풀고, 다음 두 계층을 가진 JSON을 생성한다.

  1) 호환 계층 (최상위 meta·font·color·radius·shadow·logo)
     기존 scripts/tokens.mjs · apps/web/tailwind.config.ts · scripts/logo.py 가 읽는 형태.
     값은 모두 ds.css 에서 유도한다 (canvas=surface-alt, ink=label-normal, primary=--primary-normal …).
  2) baseui 계층 (tokens.baseui)
     팔레트, light/dark 의미 토큰(label/background/line/status/fill/inverse/accent/alias), 타이포, 간격,
     라운드, 모션, 컨트롤 치수. React Native 테마(packages/shared → apps/mobile)가 사용한다.

사용:  python3 scripts/export_tokens.py            # design/tokens.json 재생성
       python3 scripts/export_tokens.py --check    # 생성 결과가 현재 JSON과 같은지만 확인 (CI·검사용)
이후:  npm run tokens                               # JSON → 웹 tokens.css · 가이드 · packages/shared tokens.ts
"""
from __future__ import annotations
import colorsys, json, re, sys, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DS = ROOT / "public/assets/css/ds.css"
OUT = ROOT / "design/tokens.json"
LOGO_SRC = ROOT / "design/logo-source.png"

# ── 1. CSS 블록 파싱 ─────────────────────────────────────────────────────────
def block(css: str, selector: str) -> dict[str, str]:
    """selector 로 시작하는 첫 번째 규칙 블록의 --변수 선언을 순서대로 반환."""
    i = css.find(selector + " {")
    if i < 0:
        sys.exit(f"ds.css 에 '{selector}' 블록이 없습니다")
    j = css.index("}", i)
    out: dict[str, str] = {}
    for line in css[i:j].splitlines():
        m = re.match(r"\s*(--[\w-]+)\s*:\s*(.+?);\s*$", line)
        if m:
            out[m.group(1)] = m.group(2).strip()
    return out

css = DS.read_text(encoding="utf-8")
root_vars = block(css, ":root")
light_vars = {**root_vars, **block(css, '[data-theme="light"]')}
dark_vars = {**root_vars, **block(css, '[data-theme="dark"]')}

# ── 2. 값 해석 ───────────────────────────────────────────────────────────────
HEX = re.compile(r"^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$")

def hex_to_rgb(h: str) -> tuple[int, int, int]:
    n = int(h[1:7], 16)
    return (n >> 16) & 255, (n >> 8) & 255, n & 255

def rgb_to_hex(r: float, g: float, b: float) -> str:
    return "#%02X%02X%02X" % (round(r), round(g), round(b))

def parse_color(v: str):
    """hex / rgb() / rgba() → (r,g,b,a) 또는 None."""
    m = HEX.match(v)
    if m:
        r, g, b = hex_to_rgb(v)
        a = int(m.group(2), 16) / 255 if m.group(2) else 1.0
        return r, g, b, a
    m = re.match(r"rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)", v)
    if m:
        return float(m[1]), float(m[2]), float(m[3]), float(m[4]) if m[4] else 1.0
    if v == "transparent":
        return 0.0, 0.0, 0.0, 0.0
    return None

def fmt_color(c) -> str:
    r, g, b, a = c
    return rgb_to_hex(r, g, b) if a >= 0.999 else f"rgba({round(r)}, {round(g)}, {round(b)}, {round(a, 3)})"

def resolve(name: str, scope: dict[str, str], seen=()) -> str:
    if name in seen:
        sys.exit(f"순환 참조: {' → '.join(seen + (name,))}")
    raw = scope.get(name)
    if raw is None:
        sys.exit(f"알 수 없는 변수 {name}")
    return resolve_value(raw, scope, seen + (name,))

def resolve_value(raw: str, scope: dict[str, str], seen=()) -> str:
    def sub_var(m):
        inner = m.group(1)
        ref, _, fallback = inner.partition(",")
        ref = ref.strip()
        if ref in scope:
            return resolve(ref, scope, seen)
        if fallback:
            return resolve_value(fallback.strip(), scope, seen)
        sys.exit(f"알 수 없는 변수 {ref}")
    # var() 안에 var() 가 중첩되지 않는 전제 (ds.css 현재 구조)
    v = re.sub(r"var\(([^()]*)\)", sub_var, raw)
    # color-mix(in srgb, C P%, transparent) → rgba 근사
    m = re.fullmatch(r"color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%\s*,\s*transparent\)", v.strip())
    if m:
        c = parse_color(m[1].strip())
        if c:
            r, g, b, a = c
            return fmt_color((r, g, b, a * float(m[2]) / 100))
    v = v.strip()
    return v.upper() if HEX.match(v) else v

def group(scope: dict[str, str], prefix: str, strip: str | None = None) -> dict[str, str]:
    """--prefix-* 변수를 {나머지 이름: 실값} 으로. 이름은 camelCase 로 바꾼다."""
    strip = prefix if strip is None else strip
    out = {}
    for k in scope:
        if k.startswith("--" + prefix + "-"):
            key = k[len("--" + strip + "-"):]
            out[camel(key)] = resolve(k, scope)
    return out

def camel(s: str) -> str:
    parts = s.split("-")
    return parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:])

def px(v: str) -> int | float | str:
    m = re.fullmatch(r"(-?[\d.]+)px", v)
    if not m:
        return v
    f = float(m[1])
    return int(f) if f.is_integer() else f

def em_to_px(v: str, size: int | float) -> float:
    m = re.fullmatch(r"(-?[\d.]+)em", v)
    return round(float(m[1]) * size, 2) if m else 0.0

# ── 3. 팔레트 ────────────────────────────────────────────────────────────────
palette: dict[str, dict] = {}
for k, raw in root_vars.items():
    m = re.fullmatch(r"--palette-([a-z]+)-(\d+)", k)
    if m:
        palette.setdefault(m[1], {})[m[2]] = resolve(k, root_vars)
    m = re.fullmatch(r"--palette-grey-opacity-(\d+)", k)
    if m:
        palette.setdefault("greyOpacity", {})[m[1]] = resolve(k, root_vars)
for k in ("--palette-background", "--palette-grey-background", "--palette-layered-background", "--palette-floated-background"):
    palette.setdefault("background", {})[camel(k[len("--palette-"):])] = resolve(k, root_vars)
palette.pop("grey-opacity", None)
mobile_palette = {camel(k[len("--mobile-palette-"):]): resolve(k, root_vars) for k in root_vars if k.startswith("--mobile-palette-")}

# ── 4. 의미 토큰 (light / dark) ──────────────────────────────────────────────
SEMANTIC_GROUPS = ["label", "background", "line", "status", "interaction", "inverse", "fill", "material", "accent"]
ALIAS = ["text", "muted", "surface", "surface-alt", "surface-raised", "border", "focus", "success", "warning", "danger", "disabled-bg", "disabled-text", "static-white", "static-black"]

def theme(scope: dict[str, str]) -> dict:
    t: dict = {"primary": {}}
    for k in ("soft", "normal", "strong", "heavy"):
        t["primary"][k] = resolve(f"--primary-{k}", scope)
    t["primary"]["inverse"] = resolve("--inverse-primary", scope)
    for g in SEMANTIC_GROUPS:
        t[g] = group(scope, g)
    t["inverse"].pop("primary", None)
    t["alias"] = {camel(a): resolve("--" + a, scope) for a in ALIAS}
    t["elevation"] = {camel(k[len("--elevation-shadow-"):]): resolve(k, scope) for k in scope if k.startswith("--elevation-shadow-")}
    return t

light = theme(light_vars)
dark = theme(dark_vars)

# ── 5. 타이포·치수 ───────────────────────────────────────────────────────────
typography: dict[str, dict] = {}
for k in root_vars:
    m = re.fullmatch(r"--font-size-([a-z0-9-]+)", k)
    if not m:
        continue
    name = m[1]
    size = px(resolve(k, root_vars))
    entry = {"fontSize": size, "lineHeight": px(resolve(f"--line-height-{name}", root_vars))}
    ls = root_vars.get(f"--letter-spacing-{name}")
    if ls:
        entry["letterSpacing"] = em_to_px(resolve_value(ls, root_vars), size)  # px, RN 용
        entry["letterSpacingEm"] = ls
    typography[camel(name)] = entry
mobile_type = {k[len("mobile"):][:1].lower() + k[len("mobile"):][1:]: v for k, v in typography.items() if k.startswith("mobile")}
typography = {k: v for k, v in typography.items() if not k.startswith("mobile")}

font_family = resolve("--font-family", root_vars)
dims = {
    "space": {k[len("--space-"):]: px(resolve(k, root_vars)) for k in root_vars if re.fullmatch(r"--space-\d+", k)},
    "radius": {k[len("--radius-"):]: px(resolve(k, root_vars)) for k in root_vars if k.startswith("--radius-")},
    "duration": {k[len("--duration-"):]: resolve(k, root_vars) for k in root_vars if k.startswith("--duration-")},
    "ease": {k[len("--ease-"):]: resolve(k, root_vars) for k in root_vars if k.startswith("--ease-")},
    "z": {k[len("--z-"):]: int(resolve(k, root_vars)) for k in root_vars if k.startswith("--z-")},
    "control": {k[len("--control-"):]: px(resolve(k, root_vars)) for k in root_vars if k.startswith("--control-")},
    "touchTarget": px(resolve("--touch-target", root_vars)),
    "container": px(resolve("--container", root_vars)),
    "ctaHeight": px(resolve("--cta-height", root_vars)),
    "breakpoint": {k[len("--breakpoint-"):]: px(resolve(k, root_vars)) for k in root_vars if k.startswith("--breakpoint-")},
    "opacity": {k[len("--opacity-"):]: float(resolve(k, root_vars)) for k in root_vars if k.startswith("--opacity-")},
}

# ── 6. 호환 계층 — Primary 스케일 파생 ──────────────────────────────────────
P = light["primary"]
def hsl(h: str):
    r, g, b = hex_to_rgb(h)
    return colorsys.rgb_to_hls(r / 255, g / 255, b / 255)  # (h, l, s)

h0, l0, s0 = hsl(P["normal"])
LIGHTNESS = {"50": None, "100": 0.95, "200": 0.90, "300": 0.82, "400": 0.72, "500": 0.63, "600": None, "700": None, "800": None, "900": 0.33, "950": 0.22}
scale: dict[str, str] = {}
for step, L in LIGHTNESS.items():
    if step == "50":
        scale[step] = P["soft"]
    elif step == "600":
        scale[step] = P["normal"]
    elif step == "700":
        scale[step] = P["strong"]
    elif step == "800":
        scale[step] = P["heavy"]
    else:
        sat = s0 * (0.85 if L > 0.8 else 1.0)
        r, g, b = colorsys.hls_to_rgb(h0, L, sat)
        scale[step] = rgb_to_hex(r * 255, g * 255, b * 255)

def base(key: str, hexv: str, label: str, desc: str):
    return {"hex": hexv, "label": label, "desc": desc}

A, LB, BG, LN = light["alias"], light["label"], light["background"], light["line"]
compat_color = {
    "base": {
        "canvas": base("canvas", A["surfaceAlt"], "Canvas", "페이지 바닥 · ds.css --surface-alt(--background-normal-alternative)"),
        "paper": base("paper", A["surface"], "Paper", "카드·헤더·시트 · --surface(--background-normal-normal)"),
        "inset": base("inset", BG["elevatedAlternative"], "Inset", "인풋 바닥·타일 · --background-elevated-alternative"),
        "stage": base("stage", light["inverse"]["background"], "Stage", "반전 무대 · --inverse-background"),
        "ink": base("ink", LB["normal"], "Ink", "본문 텍스트 · --label-normal"),
        "ink-2": base("ink-2", LB["alternative"], "Ink-2", "보조 텍스트 · --label-alternative"),
        "ink-3": base("ink-3", LB["assistive"], "Ink-3", "뮤트·플레이스홀더 · --label-assistive"),
        "hairline": base("hairline", LN["solidNeutral"], "Hairline", "카드 안 구분선 · --line-solid-neutral"),
        "edge": base("edge", LN["solidNormal"], "Edge", "셸 경계·상단바·하단탭 · --line-solid-normal(--border)"),
    },
    "red": {"scale": scale, "primary": "600", "primaryLight": "300", "hover": "700", "pressed": "800",
            "note": "50=--primary-soft · 600=--primary-normal · 700=--primary-strong · 800=--primary-heavy, 나머지는 HSL 파생"},
    "pastel": {
        "rose": {"hex": palette["red"]["100"], "soft": palette["red"]["50"]},
        "sage": {"hex": palette["green"]["100"], "soft": palette["green"]["50"]},
        "butter": {"hex": palette["yellow"]["100"], "soft": palette["yellow"]["50"]},
        "sky": {"hex": palette["blue"]["100"], "soft": palette["blue"]["50"]},
    },
    "semantic": {
        "success": {"hex": light["status"]["positive"], "label": "Success · --status-positive"},
        "warning": {"hex": light["status"]["cautionary"], "label": "Warning · --status-cautionary"},
        "danger": {"hex": light["status"]["negative"], "label": "Danger · --status-negative"},
        "info": {"hex": palette["blue"]["500"], "label": "Info · --palette-blue-500"},
        "up": {"hex": P["normal"], "label": "Up(수익) · --primary-normal"},
        "down": {"hex": palette["blue"]["500"], "label": "Down(손실) · --palette-blue-500"},
    },
}
R = dims["radius"]
compat_radius = {"xs": f'{R["xs"]}px', "sm": f'{R["sm"]}px', "md": f'{R["md"]}px', "lg": f'{R["lg"]}px', "xl": f'{R["xl"]}px',
                 "2xl": f'{R["xl"]}px', "arch": f'{R["lg"]}px', "pill": f'{R["full"]}px', "default": f'{R["md"]}px'}
E = light["elevation"]
pr, pg, pb = hex_to_rgb(P["normal"])
compat_shadow = {"soft": E["normalSmall"], "card": E["normalMedium"], "float": E["normalLarge"],
                 "red": {"template": "0 8px 20px rgba({primary}, .28)"}}

# 로고 설정은 기존 JSON 값을 유지한다 (ds.css 에 없는 항목)
prev = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
logo = prev.get("logo") or {"source": "design/logo-source.png", "sourceEn": "design/logo-source-en.png", "primary": "en",
                            "mark": {"mode": "crop", "cropRatio": 0.255}, "iconBg": "primary",
                            "og": {"width": 1200, "height": 630, "background": "paper", "wordmarkWidth": 760}}

tokens = {
    "meta": {
        "name": "주부테크 Design System",
        "version": "3.0",
        "updated": datetime.date.today().isoformat(),
        "source": "public/assets/css/ds.css (Base UI 1.8.0 파생, 팀장 작업분)",
        "note": "자동 생성 — 직접 수정 금지. 값을 바꾸려면 ds.css 를 고친 뒤 `python3 scripts/export_tokens.py && npm run tokens`. "
                "최상위 color/radius/shadow/font 는 웹(tokens.mjs·tailwind)·logo.py 호환 계층이고, baseui 는 Base UI 의미 토큰 전체(RN 테마용)다.",
    },
    "font": {
        "body": font_family,
        "mono": resolve("--font-mono", root_vars),
        "package": "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css",
        "cdn": "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css",
    },
    "color": compat_color,
    "radius": compat_radius,
    "shadow": compat_shadow,
    "logo": logo,
    "baseui": {
        "palette": palette,
        "mobilePalette": mobile_palette,
        "light": light,
        "dark": dark,
        "typography": typography,
        "mobileTypography": mobile_type,
        **dims,
    },
}

text = json.dumps(tokens, ensure_ascii=False, indent=2) + "\n"
if "--check" in sys.argv:
    cur = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
    # updated 날짜만 다른 경우는 같은 것으로 본다
    norm = lambda s: re.sub(r'"updated": "[^"]+"', '"updated": ""', s)
    if norm(cur) != norm(text):
        print("✗ design/tokens.json 이 ds.css 와 다릅니다 → python3 scripts/export_tokens.py 실행")
        sys.exit(1)
    print("✓ design/tokens.json 이 ds.css 와 일치")
    sys.exit(0)

OUT.write_text(text, encoding="utf-8")
n_vars = sum(len(v) if isinstance(v, dict) else 1 for v in light.values())
print(f"ds.css → design/tokens.json  (primary {P['normal']}, canvas {A['surfaceAlt']}, 의미 토큰 light {n_vars}개, 타이포 {len(typography)}종, 모바일 타이포 {len(mobile_type)}종)")
