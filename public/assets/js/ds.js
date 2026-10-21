/*! BASE UI 1.8.0 | Runtime source */
(function(global){
"use strict";
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const dispatch = (el, name, detail) =>
  el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
const initializers = [];
function registerInitializer(fn) {
  initializers.push(fn);
}
const UI = {
  version: "1.8.0",
  setTheme(theme, root = document.documentElement) {
    root.dataset.theme = theme === "dark" ? "dark" : "light";
    dispatch(root, "ui:theme", { theme: root.dataset.theme });
  },
  closeDialog(id, value = "") {
    const d = typeof id === "string" ? document.getElementById(id) : id;
    d?.close(value);
  },
  alert(title, message = "") {
    return UI.dialog({ title, message });
  },
  confirm(title, message = "") {
    return UI.dialog({ title, message, confirm: true });
  },
  dialog({ title, message = "", confirm = false }) {
    return new Promise((resolve) => {
      const d = document.createElement("dialog");
      d.className = "dialog " + (confirm ? "dialog--confirm" : "dialog--alert");
      const h = document.createElement("div");
      h.className = "dialog__header";
      const heading = document.createElement("h2");
      heading.id = "title-" + Math.random().toString(36).slice(2);
      heading.textContent = title;
      d.setAttribute("aria-labelledby", heading.id);
      h.append(heading);
      const body = document.createElement("div");
      body.className = "dialog__body";
      body.textContent = message;
      const footer = document.createElement("div");
      footer.className = "action-area";
      if (confirm) {
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = "button button--weak button--dark button--lg";
        cancel.textContent = "취소";
        cancel.onclick = () => d.close("cancel");
        footer.append(cancel);
      }
      const yes = document.createElement("button");
      yes.type = "button";
      yes.className = confirm ? "button button--lg" : "text-button";
      yes.textContent = "확인";
      yes.onclick = () => d.close("confirm");
      footer.append(yes);
      d.append(h, body, footer);
      document.body.append(d);
      UI.openDialog(d);
      d.addEventListener(
        "close",
        () => {
          resolve(d.returnValue === "confirm");
          d.remove();
        },
        { once: true },
      );
    });
  },
  addOpacity(color, opacity) {
    return `color-mix(in srgb, ${color} ${Math.max(0, Math.min(1, opacity)) * 100}%, transparent)`;
  },
  ariaHidden(element, hidden = true) {
    const prev = {
      inert: element.inert,
      aria: element.getAttribute("aria-hidden"),
    };
    element.inert = hidden;
    hidden
      ? element.setAttribute("aria-hidden", "true")
      : element.removeAttribute("aria-hidden");
    return () => {
      element.inert = prev.inert;
      prev.aria === null
        ? element.removeAttribute("aria-hidden")
        : element.setAttribute("aria-hidden", prev.aria);
    };
  },
  observeSize(el, callback) {
    const r = new ResizeObserver((entries) => callback(entries[0].contentRect));
    r.observe(el);
    return () => r.disconnect();
  },
  portal(el, target = document.body) {
    const parent = el.parentNode,
      next = el.nextSibling;
    target.append(el);
    return () => parent.insertBefore(el, next);
  },
  region(
    { language = "ko", direction = "ltr" } = {},
    root = document.documentElement,
  ) {
    root.lang = language;
    root.dir = direction;
  },
  navigate(url) {
    location.assign(url);
  },
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (!ok)
        throw Error(
          "복사를 지원하지 않는 환경입니다. 코드를 직접 선택해주세요.",
        );
    }
  },
  init(root = document) {
    initializers.forEach((initialize) => initialize(root));
    return root;
  },
};
function updateAgreement(g) {
  const all = $("[data-check-all]", g),
    items = $$("input[type=checkbox]:not([data-check-all])", g);
  if (!all) return;
  all.checked = items.length > 0 && items.every((i) => i.checked);
  all.indeterminate = items.some((i) => i.checked) && !all.checked;
  const required = items.filter((i) => i.required),
    target = g.dataset.agreement;
  if (target) {
    const b = document.getElementById(target);
    if (b) b.disabled = !required.every((i) => i.checked);
  }
}
function updateStepper(g) {
  const i = $("input", g);
  if (!i) return;
  const v = Number(i.value) || 0,
    min =
      i.getAttribute("min") === null
        ? -Infinity
        : Number(i.getAttribute("min")),
    max =
      i.getAttribute("max") === null ? Infinity : Number(i.getAttribute("max"));
  $$("[data-step]", g).forEach(
    (b) =>
      (b.disabled =
        g.getAttribute("aria-disabled") === "true" ||
        i.disabled ||
        (Number(b.dataset.step) < 0 ? v <= min : v >= max)),
  );
  const o = $("[data-spinner-output]", g);
  if (o) o.textContent = String(v);
}
function updateRating(g) {
  const r = $("input:checked", g);
  const v = Number(r?.value || 0);
  $$("label", g).forEach((l) =>
    l.classList.toggle("is-filled", Number($("input", l).value) <= v),
  );
}
function revealSegment(item) {
  const group=item.closest(".segmented");
  if (!group) return;
  const r=item.getBoundingClientRect(), g=group.getBoundingClientRect();
  if (r.left<g.left) group.scrollLeft-=g.left-r.left;
  else if (r.right>g.right) group.scrollLeft+=r.right-g.right;
}
document.addEventListener("change",e=>{
  const item=e.target.closest(".segmented__item");
  if (item) revealSegment(item);
});
function visibleBounds() {
  const v = window.visualViewport;
  return { left:v?.offsetLeft || 0, top:v?.offsetTop || 0,
    width:v?.width || window.innerWidth, height:v?.height || window.innerHeight };
}
function placePopover(panel, trigger) {
  if (!panel || panel.hidden) return;
  const v=visibleBounds(), parent=panel.offsetParent || panel.parentElement;
  if (!parent) return;
  panel.style.maxWidth=Math.max(0,v.width-32)+"px";
  panel.style.minWidth=Math.min(220,Math.max(0,v.width-32))+"px";
  panel.style.maxHeight=Math.max(0,v.height-32)+"px";
  const anchor=trigger.getBoundingClientRect(), r=panel.getBoundingClientRect(), p=parent.getBoundingClientRect();
  const x=Math.max(v.left+16,Math.min(anchor.left,v.left+v.width-r.width-16));
  const below=anchor.bottom+8;
  const candidate=below+r.height<=v.top+v.height-16 ? below : anchor.top-r.height-8;
  const y=Math.max(v.top+16,Math.min(candidate,v.top+v.height-r.height-16));
  panel.style.left=(x-p.left-(parent.clientLeft || 0)+(parent.scrollLeft || 0))+"px";
  panel.style.top=(y-p.top-(parent.clientTop || 0)+(parent.scrollTop || 0))+"px";
  panel.style.right="auto";
}
function placeTooltip(root) {
  const bubble=root?.querySelector(".tooltip__bubble");
  if (!bubble) return;
  const v=visibleBounds(), p=root.getBoundingClientRect();
  bubble.style.maxWidth=Math.max(0,Math.min(240,v.width-32))+"px";
  const r=bubble.getBoundingClientRect();
  const x=Math.max(v.left+16,Math.min(p.left+(p.width-r.width)/2,v.left+v.width-r.width-16));
  const y=p.top-r.height-8>=v.top+16 ? p.top-r.height-8 : p.bottom+8;
  bubble.style.left=(x-p.left)+"px";
  bubble.style.top=(Math.max(v.top+16,Math.min(y,v.top+v.height-r.height-16))-p.top)+"px";
  bubble.style.bottom="auto";
  bubble.style.transform="none";
}
function refreshFloating() {
  $$('[data-popover-trigger][aria-expanded="true"]').forEach(t=>placePopover(document.getElementById(t.getAttribute("aria-controls")),t));
  $$(".tooltip").forEach(placeTooltip);
}
window.addEventListener("resize",refreshFloating);
window.addEventListener("scroll",refreshFloating,{passive:true,capture:true});
window.visualViewport?.addEventListener("resize",refreshFloating);
window.visualViewport?.addEventListener("scroll",refreshFloating);
document.addEventListener("pointerover",e=>placeTooltip(e.target.closest(".tooltip")));
document.addEventListener("focusin",e=>placeTooltip(e.target.closest(".tooltip")));
function closePopovers(except) {
  $$("[data-popover-trigger][aria-expanded=true]")
    .filter((b) => b !== except)
    .forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      const p = document.getElementById(b.getAttribute("aria-controls"));
      if (p) p.hidden = true;
    });
}
document.addEventListener("click", (e) => {
  if (e.target.closest('[disabled],[aria-disabled="true"]')) return;
  const open = e.target.closest("[data-open]");
  if (open) UI.openDialog(open.dataset.open);
  const close = e.target.closest("[data-close]");
  if (close) UI.closeDialog(close.closest("dialog"), close.dataset.close);
  const toast = e.target.closest("[data-toast]");
  if (toast)
    UI.toast(toast.dataset.toast, {
      position: toast.dataset.toastPosition,
      icon: toast.dataset.toastIcon,
      higherThanCTA: toast.dataset.toastAbove === "true",
      animate: toast.dataset.toastAnimate === "true",
      actionLabel: toast.dataset.toastAction,
      action: toast.dataset.toastAction
        ? () => UI.toast("되돌렸어요.")
        : undefined,
    });
  const alert = e.target.closest("[data-alert]");
  if (alert)
    UI.alert(
      alert.dataset.alert,
      "필요한 내용을 확인한 뒤 다음 단계로 이동하세요.",
    );
  const confirm = e.target.closest("[data-confirm]");
  if (confirm)
    UI.confirm(confirm.dataset.confirm, "선택한 동작을 실행할까요?").then(
      (ok) => UI.toast(ok ? "확인했어요." : "취소했어요."),
    );
  const clear = e.target.closest("[data-clear]");
  if (clear) {
    const i = document.getElementById(clear.dataset.clear);
    i.value = "";
    i.dispatchEvent(new Event("input", { bubbles: true }));
    i.focus();
  }
  const pass = e.target.closest("[data-password]");
  if (pass) {
    const i = document.getElementById(pass.dataset.password),
      visible = i.type === "password";
    i.type = visible ? "text" : "password";
    pass.setAttribute("aria-pressed", String(visible));
    pass.setAttribute(
      "aria-label",
      visible ? "비밀번호 숨기기" : "비밀번호 보기",
    );
  }
  const tab = e.target.closest("[role=tab]");
  if (tab && tab.closest("[data-tabs]")) UI.selectTab?.(tab);
  const choice = e.target.closest("[data-choice]");
  if (choice) {
    const parent = choice.closest("[data-choice-group]");
    if (parent)
      $$("[data-choice]", parent).forEach((b) =>
        b.setAttribute("aria-pressed", String(b === choice)),
      );
    else
      choice.setAttribute(
        "aria-pressed",
        String(choice.getAttribute("aria-pressed") !== "true"),
      );
    if (parent?.classList.contains("segmented")) revealSegment(choice);
    dispatch(choice, "ui:change", {
      selected: choice.getAttribute("aria-pressed") === "true",
    });
  }
  const step = e.target.closest("[data-stepper] [data-step]");
  if (step && !step.disabled) {
    const g = step.closest("[data-stepper]"),
      i = $("input", g);
    const min =
        i.getAttribute("min") === null
          ? -Infinity
          : Number(i.getAttribute("min")),
      max =
        i.getAttribute("max") === null
          ? Infinity
          : Number(i.getAttribute("max")),
      increment = Number(i.getAttribute("step")) || 1;
    const next = (Number(i.value) || 0) + Number(step.dataset.step) * increment;
    i.value = String(
      Math.max(min, Math.min(max, Math.round(next * 1e10) / 1e10)),
    );
    i.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const pag = e.target.closest("[data-pagination] [data-page]");
  if (pag) {
    const g = pag.closest("[data-pagination]");
    $$("[data-page]", g).forEach((b) => b.removeAttribute("aria-current"));
    pag.setAttribute("aria-current", "page");
    const o = g.nextElementSibling;
    if (o?.matches("[data-page-output]"))
      o.textContent = pag.dataset.page + "페이지를 보고 있어요.";
    dispatch(g, "ui:page", { page: Number(pag.dataset.page) });
  }
  const dot = e.target.closest("[data-dot]");
  if (dot) {
    $$("[data-dot]", dot.parentElement).forEach((b) =>
      b.setAttribute("aria-current", String(b === dot)),
    );
    dispatch(dot.parentElement, "ui:slide", { index: Number(dot.dataset.dot) });
  }
  const trigger = e.target.closest("[data-popover-trigger]");
  if (trigger) {
    const panel = document.getElementById(
        trigger.getAttribute("aria-controls"),
      ),
      show = trigger.getAttribute("aria-expanded") !== "true";
    closePopovers(trigger);
    trigger.setAttribute("aria-expanded", String(show));
    panel.hidden = !show;
    if (show) requestAnimationFrame(() => placePopover(panel, trigger));
  } else if (!e.target.closest(".popover")) closePopovers();
  const menu = e.target.closest(".menu button");
  if (menu) closePopovers();
  const key = e.target.closest("[data-key]");
  if (key) {
    const group = key.closest("[data-keypad]"),
      input = document.getElementById(group.dataset.keypad);
    if (!input) return;
    const k = key.dataset.key;
    if (k === "backspace") input.value = input.value.slice(0, -1);
    else if (k === "clear") input.value = "";
    else if (input.maxLength < 0 || input.value.length < input.maxLength)
      input.value += k;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
});
document.addEventListener("change", (e) => {
  const g = e.target.closest("[data-agreement]");
  if (g) {
    if (e.target.hasAttribute("data-check-all"))
      $$("input[type=checkbox]", g).forEach(
        (i) => (i.checked = e.target.checked),
      );
    updateAgreement(g);
  }
  const step = e.target.closest("[data-stepper]");
  if (step) {
    const i = $("input", step);
    const min =
        i.getAttribute("min") === null
          ? -Infinity
          : Number(i.getAttribute("min")),
      max =
        i.getAttribute("max") === null
          ? Infinity
          : Number(i.getAttribute("max"));
    i.value = String(Math.min(max, Math.max(min, Number(i.value) || 0)));
    updateStepper(step);
  }
  const rating = e.target.closest("[data-rating]");
  if (rating) updateRating(rating);
});
document.addEventListener("input", (e) => {
  if (e.target.matches("[data-range]")) {
    const o = document.getElementById(e.target.dataset.range);
    if (o) o.textContent = e.target.value;
  }
  if (e.target.matches("[data-count]")) {
    const o = document.getElementById(e.target.dataset.count);
    if (o) o.textContent = e.target.value.length + " / " + e.target.maxLength;
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const b = $("[data-popover-trigger][aria-expanded=true]");
    if (b) {
      closePopovers();
      b.focus();
    }
  }
});

registerInitializer((root) => {
  $$("[data-indeterminate]", root).forEach((i) => (i.indeterminate = true));
  $$("[data-agreement]", root).forEach(updateAgreement);
  $$("[data-stepper]", root).forEach(updateStepper);
  $$("[data-rating]", root).forEach(updateRating);
});


/* Brand adapter — a single seed generates accessible solid/button and text colors. */
(function () {
  "use strict";
  const parse = (h) => {
    if (!/^#[\da-f]{6}$/i.test(h))
      throw new Error("HEX 컬러는 #RRGGBB 형식으로 입력하세요.");
    return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  };
  const hex = (a) =>
    "#" +
    a
      .map((n) => Math.round(n).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  const luminance = (h) =>
    parse(h)
      .map((x) => {
        x /= 255;
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      })
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
  const contrast = (a, b) => {
    const x = luminance(a),
      y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const mix = (a, b, f) =>
    hex(parse(a).map((v, i) => v * (1 - f) + parse(b)[i] * f));
  const ink = (color, bg, toward) => {
    let c = color;
    for (let i = 0; i < 100 && contrast(c, bg) < 4.5; i++)
      c = mix(color, toward, (i + 1) / 100);
    return c;
  };
  UI.brandConfig = function (color) {
    color = color.trim();
    if (/^#[\da-f]{3}$/i.test(color))
      color =
        "#" +
        color
          .slice(1)
          .split("")
          .map((c) => c + c)
          .join("");
    parse(color);
    color = color.toUpperCase();
    const on =
      contrast(color, "#FFFFFF") >= contrast(color, "#000000")
        ? "#FFFFFF"
        : "#000000";
    const standard = color === "#3182F6";
    return {
      seed: color,
      on,
      progress: standard ? "#4593FC" : mix(color, "#FFFFFF", 0.12),
      inkLight: standard ? "#1B64DA" : ink(color, "#FFFFFF", "#000000"),
      inkDark: standard ? "#64A8FF" : ink(color, "#191F28", "#FFFFFF"),
      hover: standard ? "#2272EB" : mix(color, "#000000", 0.09),
      pressed: standard ? "#1B64DA" : mix(color, "#000000", 0.18),
      tintLight: standard ? "#E8F3FF" : mix(color, "#FFFFFF", 0.9),
      tintDark: standard ? "#194AA6" : mix(color, "#191F28", 0.8),
      inverse: standard ? "#64A8FF" : mix(color, "#FFFFFF", 0.25),
      contrast: contrast(color, on),
    };
  };
  UI.brandCSS = function (c) {
    if (typeof c === "string") c = UI.brandConfig(c);
    return (
      "/* Project primary colors — generated by BASE UI. */\n:root {\n  --primary-normal: " +
      c.seed +
      ";\n  --primary-strong: " +
      c.hover +
      ";\n  --primary-heavy: " +
      c.pressed +
      ";\n  --primary-soft: " +
      c.tintLight +
      ";\n  --inverse-primary: " +
      c.inverse +
      ';\n}\n[data-theme="light"] { --primary-soft: ' +
      c.tintLight +
      '; }\n[data-theme="dark"] { --primary-soft: ' +
      c.tintDark +
      "; }\n"
    );
  };
  UI.applyBrand = function (color) {
    const c = UI.brandConfig(color);
    let s = document.getElementById("brand-custom");
    if (!s) {
      s = document.createElement("style");
      s.id = "brand-custom";
      document.head.append(s);
    }
    s.textContent = UI.brandCSS(c);
    UI.brandState = c;
    return c;
  };
  UI.color = { contrast, mix, luminance };
})();


/* Loading is a state on the existing element: its label stays in flow. */
(function () {
  "use strict";
  const previous = new WeakMap();
  UI.prepareButton = function (button) {
    if (!button.querySelector(".button__label")) {
      const label = document.createElement("span");
      label.className = "button__label";
      while (button.firstChild) label.append(button.firstChild);
      button.append(label);
    }
    if (!button.querySelector(".button__loader")) {
      const loader = document.createElement("span");
      loader.className = "button__loader";
      loader.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 3; i++) loader.append(document.createElement("i"));
      button.append(loader);
    }
    return button;
  };
  UI.setButtonLoading = function (target, loading = true) {
    const button =
      typeof target === "string" ? document.getElementById(target) : target;
    if (!button) return;
    UI.prepareButton(button);
    if (loading) {
      if (!previous.has(button))
        previous.set(button, {
          disabled: button.hasAttribute("data-loading-disabled")
            ? button.dataset.loadingDisabled === "true"
            : button.hasAttribute("disabled"),
          aria: button.getAttribute("aria-disabled"),
          tabindex: button.getAttribute("tabindex"),
        });
      const old = previous.get(button);
      button.dataset.loadingDisabled = String(
        old.disabled || old.aria === "true",
      );
      button.setAttribute("aria-busy", "true");
      button.classList.add("is-loading");
      if (button.tagName === "BUTTON") button.disabled = true;
      else {
        button.setAttribute("aria-disabled", "true");
        button.tabIndex = -1;
      }
    } else {
      const old = previous.get(button);
      button.removeAttribute("aria-busy");
      button.classList.remove("is-loading");
      button.removeAttribute("data-loading-disabled");
      if (old) {
        if (button.tagName === "BUTTON") button.disabled = old.disabled;
        old.aria === null
          ? button.removeAttribute("aria-disabled")
          : button.setAttribute("aria-disabled", old.aria);
        old.tabindex === null
          ? button.removeAttribute("tabindex")
          : button.setAttribute("tabindex", old.tabindex);
        previous.delete(button);
      }
    }
    return button;
  };
  registerInitializer((root) => {
    root
      .querySelectorAll('.button[aria-busy="true"],.button.is-loading')
      .forEach((b) => UI.setButtonLoading(b, true));
  });
  // Also guard keyboard and synthetic activation, not only pointer clicks.
  document.addEventListener(
    "click",
    (e) => {
      const b = e.target.closest(".button");
      if (
        b &&
        (b.getAttribute("aria-busy") === "true" ||
          b.getAttribute("aria-disabled") === "true" ||
          b.disabled)
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  document.addEventListener(
    "submit",
    (e) => {
      if (e.submitter?.matches('.button[aria-busy="true"],.button:disabled'))
        e.preventDefault();
    },
    true,
  );
})();


/* Mobile interaction adapters. No framework or remote assets. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const emit = (el, name, detail) =>
    el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const element = (x) =>
    typeof x === "string" ? document.getElementById(x) : x;
  const spritePath = (() => {
    const script = $('script[src$="/ds.js"],script[src="ds.js"]');
    return script
      ? script.getAttribute("src").replace(/js\/ds\.js$/, "icons/sprite.svg")
      : "";
  })();
  UI.icon = function (name) {
    if (!/^[a-z0-9-]+$/.test(name)) return document.createElement("span");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute(
      "href",
      (document.getElementById("lucide-" + name) ? "" : spritePath) +
        "#lucide-" +
        name,
    );
    svg.append(use);
    return svg;
  };
  UI.setProgress = function (target, value) {
    const p = element(target);
    if (!p) return;
    const n = Math.max(0, Math.min(1, Number(value) || 0));
    p.style.setProperty("--progress-value", n * 100 + "%");
    p.setAttribute("aria-valuenow", String(Math.round(n * 100)));
    p.setAttribute("aria-valuetext", Math.round(n * 100) + "%");
    if (p.tagName === "PROGRESS") {
      p.max = 100;
      p.value = n * 100;
    }
    return n;
  };
  UI.setBoardOpen = function (target, open) {
    const b = element(target),
      panel = b && document.getElementById(b.getAttribute("aria-controls"));
    if (!panel) return;
    b.setAttribute("aria-expanded", String(Boolean(open)));
    panel.hidden = !open;
    emit(b, "ui:board", { open: Boolean(open) });
  };
  UI.toast = function (
    message,
    {
      duration = 3000,
      action,
      actionLabel = "실행",
      kind = "status",
      position = "bottom",
      icon,
      higherThanCTA = false,
      animate = false,
      dismissible = false,
    } = {},
  ) {
    position = position === "top" ? "top" : "bottom";
    const key =
      position + (higherThanCTA && position === "bottom" ? "-above" : "");
    const host = $$("dialog[open]").at(-1) || document.body;
    let region = $(':scope > [data-toast-region="' + key + '"]', host);
    if (!region) {
      region = document.createElement("div");
      region.className =
        "toast-region" +
        (position === "top" ? " toast-region--top" : "") +
        (higherThanCTA && position === "bottom" ? " toast-region--above" : "");
      region.dataset.toastRegion = key;
      host.append(region);
      if (host !== document.body)
        host.addEventListener("close", () => region.remove(), { once: true });
    }
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", kind === "error" ? "alert" : "status");
    if (icon) {
      const i = UI.icon(icon);
      if (animate) i.style.animation = "cta-scale .4s ease-out";
      el.append(i);
    }
    const text = document.createElement("span");
    text.textContent = String(message);
    el.append(text);
    let timer;
    const remove = () => {
      clearTimeout(timer);
      el.remove();
      if (!region.children.length) region.remove();
    };
    if (action && position === "bottom") {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "toast__action";
      b.textContent = actionLabel;
      b.onclick = () => {
        action();
        remove();
      };
      el.append(b);
    }
    const close = document.createElement("button");
    close.type = "button";
    close.className = "toast__close";
    close.setAttribute("aria-label", "알림 닫기");
    close.append(UI.icon("x"));
    close.onclick = remove;
    if (dismissible) el.append(close);
    region.append(el);
    const start = () => {
      clearTimeout(timer);
      if (duration > 0) timer = setTimeout(remove, duration);
    };
    for (const ev of ["mouseenter", "focusin"])
      el.addEventListener(ev, () => clearTimeout(timer));
    for (const ev of ["mouseleave", "focusout"]) el.addEventListener(ev, start);
    start();
    return el;
  };
  function syncField(field) {
    if (!field) return;
    field.classList.toggle(
      "has-value",
      $$("input,textarea", field).some((i) => i.value.length > 0),
    );
  }
  UI.autosize = function (target) {
    const t = element(target);
    if (!t || t.hidden || !t.getClientRects?.().length) return;
    t.style.height = "auto";
    t.style.height = t.scrollHeight + "px";
  };
  const autosizeWidths=new WeakMap();
  const autosizeObserver=typeof ResizeObserver==="function" ? new ResizeObserver(entries=>{
    entries.forEach(({target,contentRect})=>{
      const width=contentRect?.width || target.getBoundingClientRect().width;
      if(autosizeWidths.get(target)!==width){
        autosizeWidths.set(target,width);
        UI.autosize(target);
      }
    });
  }) : null;
  function observeAutosize(target){
    UI.autosize(target);
    if(autosizeWidths.has(target)) return;
    autosizeWidths.set(target,target.getBoundingClientRect?.().width || 0);
    autosizeObserver?.observe(target);
  }
  window.addEventListener("resize",()=>$$("[data-autosize]").forEach(UI.autosize));
  function refreshInput(i) {
    syncField(i.closest(".text-field"));
    if (i.matches("[data-autosize]")) UI.autosize(i);
    if (i.dataset.counter) {
      const o = document.getElementById(i.dataset.counter);
      if (o) o.textContent = i.value.length + " / " + i.maxLength;
    }
  }
  UI.skeleton = function (
    target,
    {
      pattern = "topList",
      repeat = 3,
      custom,
      background = "grey",
      play = "show",
    } = {},
  ) {
    const container = element(target);
    if (!container) return;
    const patterns = {
      topList: ["title", "spacer(24)", "list"],
      topListWithIcon: ["title", "spacer(24)", "listWithIcon"],
      amountTopList: ["title", "subtitle", "spacer(24)", "list"],
      amountTopListWithIcon: [
        "title",
        "subtitle",
        "spacer(24)",
        "listWithIcon",
      ],
      subtitleList: ["subtitle", "spacer(24)", "list"],
      subtitleListWithIcon: ["subtitle", "spacer(24)", "listWithIcon"],
      listOnly: ["list"],
      listWithIconOnly: ["listWithIcon"],
      cardOnly: ["card"],
    };
    const parts =
      Array.isArray(custom) && custom.length
        ? custom
        : patterns[pattern] || patterns.topList;
    const count =
      repeat === "infinite"
        ? 30
        : Math.max(1, Math.min(30, Number(repeat) || 3));
    container.replaceChildren();
    container.classList.add("skeleton-pattern");
    container.classList.toggle(
      "skeleton-pattern--white",
      background === "white",
    );
    container.classList.toggle(
      "skeleton-pattern--opacity",
      background === "greyOpacity100",
    );
    container.hidden = play === "hide";
    container.setAttribute("role", "status");
    container.setAttribute("aria-label", "불러오는 중");
    const inner = document.createElement("div");
    inner.setAttribute("aria-hidden", "true");
    container.append(inner);
    function block(type) {
      const el = document.createElement("div");
      if (/^spacer\(\d+\)$/.test(type)) {
        el.style.height = Math.min(500, Number(type.match(/\d+/)[0])) + "px";
      } else if (type === "listWithIcon") {
        el.className = "skeleton-list-icon";
        el.innerHTML =
          '<span class="skeleton"></span><div class="grow"><span class="skeleton"></span><span class="skeleton"></span></div>';
      } else {
        el.className =
          "skeleton skeleton-" +
          (["title", "subtitle", "list", "card"].includes(type)
            ? type
            : "list");
      }
      return el;
    }
    parts.forEach((p, i) => {
      for (let n = 0; n < (i === parts.length - 1 ? count : 1); n++)
        inner.append(block(p));
    });
    return container;
  };
  const tracked = new WeakSet();
  function setupCTA(cta) {
    if (tracked.has(cta)) return;
    tracked.add(cta);
    if (cta.hasAttribute("data-cta-space")) {
      const spacer = document.createElement("div");
      spacer.className = "cta-space";
      spacer.setAttribute("aria-hidden", "true");
      cta.before(spacer);
      const update = () => {
        const height = cta.getBoundingClientRect().height;
        spacer.style.height = height + "px";
        document.documentElement.style.setProperty(
          "--cta-height",
          Math.max(height,...$$(".bottom-cta--fixed[data-cta-space]").map(el => el.hidden || el.classList.contains("is-hidden") ? 0 : el.getBoundingClientRect().height)) + "px",
        );
      };
      update();
      const observer = new ResizeObserver(update);
      observer.observe(cta);
      cta._cleanupCTA = () => {
        observer.disconnect();
        spacer.remove();
      };
    }
    if (cta.dataset.showDelay) {
      cta.style.visibility = "hidden";
      setTimeout(
        () => {
          cta.style.visibility = "";
          cta.classList.add(
            "bottom-cta--" +
              (["fade", "scale", "slide"].includes(cta.dataset.animation)
                ? cta.dataset.animation
                : "fade"),
          );
        },
        Math.max(0, Number(cta.dataset.showDelay) || 0),
      );
    }
  }
  function keyboardOffset() {
    const appFrame=$(".app-shell");
    if(appFrame)document.documentElement.style.setProperty("--app-frame-width",appFrame.getBoundingClientRect().width+"px");
    const v = window.visualViewport;
    const height=v?.height || window.innerHeight;
    const top=v?.offsetTop || 0;
    const keyboard=Math.max(0,window.innerHeight-height-top);
    document.documentElement.dataset.keyboardOpen=String(keyboard>100 && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||''));
    const style=document.documentElement.style;
    style.setProperty("--viewport-height",height+"px");
    style.setProperty("--viewport-width",(v?.width || window.innerWidth)+"px");
    style.setProperty("--viewport-top",top+"px");
    style.setProperty("--keyboard-offset",keyboard+"px");
    $$("[data-above-keyboard],.dialog--sheet").forEach((el) =>
      el.style.setProperty(
        "--keyboard-offset",
        (el.hasAttribute("data-above-keyboard") ||
        el.contains(document.activeElement)
          ? keyboard
          : 0) + "px",
      ),
    );
  }
  keyboardOffset();
  window.addEventListener("resize", keyboardOffset);
  document.addEventListener("focusin",keyboardOffset);
  document.addEventListener("focusout",keyboardOffset);
  window.visualViewport?.addEventListener("resize", keyboardOffset);
  window.visualViewport?.addEventListener("scroll", keyboardOffset);
  let lastScroll = window.scrollY || 0;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY || 0;
      $$(".bottom-cta[data-hide-on-scroll]").forEach((cta) => {
        if (cta.contains(document.activeElement)) return;
        const threshold = Number(cta.dataset.hideOnScroll) || 1;
        if (Math.abs(y - lastScroll) >= threshold)
          cta.classList.toggle("is-hidden", y > lastScroll && y > threshold);
      });
      lastScroll = y;
    },
    { passive: true },
  );
  document.addEventListener("click", (e) => {
    const board = e.target.closest("[data-board-toggle]");
    if (board)
      UI.setBoardOpen(board, board.getAttribute("aria-expanded") !== "true");
    const progress = e.target.closest("[data-progress-toggle]");
    if (progress) {
      const p = document.getElementById(progress.dataset.progressToggle);
      UI.setProgress(p, Number(p.getAttribute("aria-valuenow")) === 0 ? 1 : 0);
    }
    const effect = e.target.closest("[data-row-effect]");
    if (effect) {
      const row = document.getElementById(effect.dataset.rowTarget);
      const cls =
        effect.dataset.rowEffect === "blink" ? "is-blinking" : "is-shining";
      row.classList.remove(cls);
      void row.offsetWidth;
      row.classList.add(cls);
      setTimeout(() => row.classList.remove(cls), 2200);
    }
    const fill = e.target.closest("[data-fill-amount]");
    if (fill) {
      const i = document.getElementById(fill.dataset.fillAmount);
      i.value = "120000";
      i.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const select = e.target.closest("[data-field-choice]");
    if (select) {
      const value = document.getElementById("field-choice-value");
      if (value) value.textContent = select.dataset.fieldChoice;
    }
    const fixed = e.target.closest("[data-fixed-demo]");
    if (fixed) {
      const old = document.getElementById("fixed-cta-demo");
      if (old) {
        old._cleanupCTA?.();
        old.remove();
      }
      const c = document.createElement("div");
      c.id = "fixed-cta-demo";
      c.className =
        "bottom-cta bottom-cta--fixed" +
        (fixed.dataset.fixedDemo === "double" ? " bottom-cta--double" : "");
      c.setAttribute("data-cta-space", "");
      c.dataset.hideOnScroll = "24";
      if (fixed.dataset.fixedDemo === "single")
        c.setAttribute("data-above-keyboard", "");
      c.innerHTML =
        '<div class="bottom-cta__buttons">' +
        (fixed.dataset.fixedDemo === "double"
          ? '<button type="button" class="button button--weak button--dark button--xl" data-close-fixed>닫기</button>'
          : "") +
        '<button type="button" class="button button--xl" data-close-fixed>확인하고 닫기</button></div>';
      document.body.append(c);
      setupCTA(c);
    }
    const close = e.target.closest("[data-close-fixed]");
    if (close) {
      const c = close.closest(".bottom-cta");
      c._cleanupCTA?.();
      c.remove();
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-sheet-select]")) {
      const sheet = e.target.closest("dialog");
      emit(sheet, "ui:sheet-select", { value: e.target.value });
      UI.toast(e.target.value + "으로 정렬해요.");
      sheet.close(e.target.value);
    }
    if (e.target.matches(".segmented input"))
      emit(e.target.closest(".segmented"), "ui:change", {
        value: e.target.value,
      });
    refreshInput(e.target);
  });
  document.addEventListener("input", (e) => {
    const i = e.target,
      g = i.closest("[data-split]");
    if (g) {
      const fields = $$("input", g),
        idx = fields.indexOf(i);
      i.value = i.value
        .replace(/\D/g, "")
        .slice(0, Number(i.getAttribute("maxlength")) || Infinity);
      if (idx === 0 && i.value.length === Number(i.getAttribute("maxlength")))
        fields[1]?.focus();
    }
    refreshInput(i);
  });
  document.addEventListener("paste", (e) => {
    const i = e.target,
      g = i.closest("[data-split]");
    if (!g || !e.clipboardData) return;
    const value = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!value) return;
    e.preventDefault();
    const fields = $$("input", g),
      idx = fields.indexOf(i);
    let rest = value;
    for (let n = idx; n < fields.length; n++) {
      const max = Number(fields[n].getAttribute("maxlength"));
      fields[n].value = rest.slice(0, max);
      rest = rest.slice(max);
      refreshInput(fields[n]);
    }
    fields[fields.length - 1].focus();
    emit(g, "ui:change", {
      complete: fields.every(
        (x) => x.value.length === Number(x.getAttribute("maxlength")),
      ),
    });
  });
  document.addEventListener("keydown", (e) => {
    const g = e.target.closest("[data-split]");
    if (g && e.key === "Backspace" && !e.target.value) {
      const a = $$("input", g),
        idx = a.indexOf(e.target);
      if (idx > 0) a[idx - 1].focus();
    }
  });
  registerInitializer((root) => {
    $$(".text-field", root).forEach(syncField);
    $$("[data-autosize]", root).forEach(observeAutosize);
    $$(".bottom-cta--fixed", root).forEach(setupCTA);
  });
})();


/* Dialog lifecycle and bottom sheet gestures. */
(function () {
  "use strict";
  const ready = new WeakSet();
  let previousOverflow = "";
  UI.openDialog = function (target) {
    const d =
      typeof target === "string" ? document.getElementById(target) : target;
    if (!d || d.open) return;
    d._returnFocus = document.activeElement;
    if (!document.querySelector("dialog[open]"))
      previousOverflow = document.documentElement.style.overflow;
    d.showModal();
    document.documentElement.style.overflow = "hidden";
    d.addEventListener(
      "close",
      () => {
        if (!document.querySelector("dialog[open]"))
          document.documentElement.style.overflow = previousOverflow;
        d._returnFocus?.focus();
        dispatch(d, "ui:close", { value: d.returnValue });
      },
      { once: true },
    );
    if (!ready.has(d)) {
      ready.add(d);
      d.addEventListener("click", (e) => {
        if (e.target !== d || d.dataset.closeOnDimmer === "false") return;
        const r = d.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          d.close("cancel");
      });
      d.addEventListener("cancel", (e) => {
        if (d.dataset.closeOnEscape === "false") e.preventDefault();
      });
    }
    if (d.matches(".dialog--sheet")) setupSheet(d);
    dispatch(d, "ui:open", {});
  };
  function setupSheet(d) {
    const h = $("[data-sheet-handle]", d);
    if (!h || h.dataset.dragReady) return;
    h.dataset.dragReady = "true";
    let start = 0,
      drag = false,
      moved = false;
    h.addEventListener("pointerdown", (e) => {
      start = e.clientY;
      drag = true;
      moved = false;
      h.setPointerCapture?.(e.pointerId);
    });
    h.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const y = e.clientY - start;
      moved = moved || Math.abs(y) > 8;
      if (y > 0) d.style.transform = "translateY(" + y + "px)";
      else if (y < -10 && d.hasAttribute("data-sheet-expand"))
        d.classList.add("is-expanded");
    });
    const end = (e) => {
      if (!drag) return;
      drag = false;
      d.style.transform = "";
      if (e.clientY - start > 80) d.close("cancel");
    };
    h.addEventListener("pointerup", end);
    h.addEventListener("pointercancel", () => {
      drag = false;
      d.style.transform = "";
    });
    h.addEventListener("click", () => {
      if (!moved && d.hasAttribute("data-sheet-expand"))
        d.classList.toggle("is-expanded");
    });
  }
})();


/* Tab motion: one shared underline; selection stays native and accessible. */
(function () {
  "use strict";
  const states = new WeakMap();
  const selector = '.tabs[role="tablist"]';
  const reduced = () =>
    Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const items = (list) =>
    [...list.querySelectorAll('[role="tab"]')].filter(
      (t) => t.closest('[role="tablist"]') === list,
    );
  const enabled = (tab) =>
    !tab.disabled &&
    tab.getAttribute("aria-disabled") !== "true" &&
    !tab.hidden;
  function selection(list, tab) {
    items(list).forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) panel.hidden = !active;
    });
  }
  function position(state, animate = false) {
    const { list, indicator } = state,
      tab = items(list).find((t) => t.getAttribute("aria-selected") === "true");
    const bounds = list.getBoundingClientRect(),
      rect = tab?.getBoundingClientRect();
    if (list.closest("[hidden]") || !rect?.width || !bounds.width) {
      indicator.hidden = true;
      list.classList.remove("tabs--animated");
      state.visible = false;
      return;
    }
    // The indicator shares the list's scroll coordinates, so swiping does not detach it.
    const left =
      rect.left -
      bounds.left -
      (list.clientLeft || 0) +
      (list.scrollLeft || 0) +
      10;
    const width = Math.max(0, rect.width - 20);
    const instant = !animate || !state.visible || reduced();
    if (instant) list.classList.remove("tabs--animated");
    indicator.style.transform = `translate3d(${left}px,0,0)`;
    indicator.style.width = width + "px";
    indicator.hidden = false;
    if (instant) {
      void indicator.offsetWidth;
      list.classList.add("tabs--animated");
    }
    state.visible = true;
  }
  function reveal(list, tab) {
    if (list.scrollWidth <= list.clientWidth) return;
    const bounds = list.getBoundingClientRect(),
      rect = tab.getBoundingClientRect();
    const left =
      rect.left - bounds.left + (list.scrollLeft || 0) - (list.clientLeft || 0);
    const target = Math.max(
      0,
      Math.min(
        list.scrollWidth - list.clientWidth,
        left - (list.clientWidth - rect.width) / 2,
      ),
    );
    if (typeof list.scrollTo === "function")
      list.scrollTo({
        left: target,
        behavior: reduced() ? "instant" : "smooth",
      });
    else list.scrollLeft = target;
  }
  function setup(list) {
    let state = states.get(list);
    if (!state) {
      const indicator = document.createElement("span");
      indicator.className = "tabs__indicator";
      indicator.setAttribute("aria-hidden", "true");
      indicator.hidden = true;
      list.append(indicator);
      state = { list, indicator, visible: false, observed: new WeakSet() };
      states.set(list, state);
      if (typeof ResizeObserver !== "undefined") {
        state.observer = new ResizeObserver(() => position(state, true));
        state.observer.observe(list);
      }
      list.addEventListener("keydown", (e) => {
        const tab = e.target.closest('[role="tab"]');
        if (
          !tab ||
          tab.closest('[role="tablist"]') !== list ||
          e.altKey ||
          e.ctrlKey ||
          e.metaKey
        )
          return;
        const tabs = items(list).filter(enabled),
          index = tabs.indexOf(tab);
        if (index < 0 || !tabs.length) return;
        let next;
        const rtl = getComputedStyle(list).direction === "rtl";
        if (e.key === "ArrowRight")
          next = (index + (rtl ? -1 : 1) + tabs.length) % tabs.length;
        if (e.key === "ArrowLeft")
          next = (index + (rtl ? 1 : -1) + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next !== undefined) {
          e.preventDefault();
          UI.selectTab(tabs[next], { focus: true });
        }
      });
    }
    items(list).forEach((tab) => {
      if (!state.observed.has(tab)) {
        state.observer?.observe(tab);
        state.observed.add(tab);
      }
    });
    return state;
  }
  UI.refreshTabs = function (root = document) {
    const lists = [
      ...(root.matches?.(selector) ? [root] : []),
      ...root.querySelectorAll(selector),
    ];
    lists
      .filter((list) => list.closest("[data-tabs]"))
      .forEach((list) => {
        const state = setup(list),
          tabs = items(list);
        const selected =
          tabs.find(
            (t) => enabled(t) && t.getAttribute("aria-selected") === "true",
          ) || tabs.find(enabled);
        selection(list, selected);
        position(state);
      });
  };
  UI.selectTab = function (target, { focus = false, scroll = true } = {}) {
    const tab =
      typeof target === "string" ? document.getElementById(target) : target;
    const list = tab?.closest(selector);
    if (
      !tab?.matches('[role="tab"]') ||
      !enabled(tab) ||
      !list?.closest("[data-tabs]")
    )
      return;
    const state = setup(list);
    if (!state.visible) position(state);
    selection(list, tab);
    position(state, true);
    if (focus) tab.focus({ preventScroll: true });
    if (scroll) reveal(list, tab);
    return tab;
  };
  window.addEventListener("resize", () => UI.refreshTabs());
  document.fonts?.ready.then(() => UI.refreshTabs());
  registerInitializer((root) => UI.refreshTabs(root));
})();


/* Custom date picker. ISO values submit directly to PHP; calendar uses local dates. */
(function () {
  "use strict";
  const states = new WeakMap(),
    DAY = ["일", "월", "화", "수", "목", "금", "토"];
  let sequence = 0;
  const $ = (s, r) => r.querySelector(s);
  function date(y, m, d) {
    const x = new Date(0);
    x.setHours(12, 0, 0, 0);
    x.setFullYear(y, m, d);
    return x;
  }
  function parse(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
    const [y, m, d] = value.split("-").map(Number),
      x = date(y, m - 1, d);
    return y >= 1 &&
      y <= 9999 &&
      x.getFullYear() === y &&
      x.getMonth() === m - 1 &&
      x.getDate() === d
      ? x
      : null;
  }
  const iso = (x) =>
    String(x.getFullYear()).padStart(4, "0") +
    "-" +
    String(x.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(x.getDate()).padStart(2, "0");
  const today = () => {
    const n = new Date();
    return date(n.getFullYear(), n.getMonth(), n.getDate());
  };
  const limits = (s) => [
    parse(s.input.getAttribute("min")) || date(1, 0, 1),
    parse(s.input.getAttribute("max")) || date(9999, 11, 31),
  ];
  function allowed(s, d) {
    const [min, max] = limits(s);
    return !!d && d >= min && d <= max;
  }
  function clamp(s, d) {
    const [min, max] = limits(s);
    return d < min ? min : d > max ? max : d;
  }
  function shift(d, months) {
    const first = date(d.getFullYear(), d.getMonth() + months, 1);
    return date(
      first.getFullYear(),
      first.getMonth(),
      Math.min(
        d.getDate(),
        date(first.getFullYear(), first.getMonth() + 1, 0).getDate(),
      ),
    );
  }
  function button(text, cls, attr, value) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = text;
    if (attr) b.setAttribute(attr, value);
    return b;
  }
  function sync(s) {
    s.trigger.disabled = s.input.disabled || s.input.hasAttribute("readonly");
    s.trigger.setAttribute(
      "aria-label",
      s.input.value ? "날짜 변경, " + s.input.value : "날짜 선택",
    );
  }
  function validate(s, show = true) {
    const raw = s.input.value.trim(),
      d = parse(raw);
    let message = "";
    if (raw && !d) message = "올바른 날짜를 YYYY-MM-DD 형식으로 입력해주세요.";
    else if (raw && !allowed(s, d)) {
      const [min, max] = limits(s);
      message = iso(min) + " ~ " + iso(max) + " 사이의 날짜를 선택해주세요.";
    }
    s.input.setCustomValidity?.(message);
    if (show) {
      s.error.textContent = message;
      s.error.hidden = !message;
      message
        ? s.input.setAttribute("aria-invalid", "true")
        : s.input.removeAttribute("aria-invalid");
    }
    sync(s);
    return !message;
  }
  function place(s) {
    if (s.inline || !s.calendar.open) return;
    const c = s.calendar;
    c.style.left = "";
    c.style.top = "";
    c.style.right = "";
    c.style.bottom = "";
    c.style.margin = "";
    if (window.innerWidth < 600) return;
    const r = s.control.getBoundingClientRect(),
      w = c.getBoundingClientRect().width || 340,
      h = c.getBoundingClientRect().height || 424;
    const v=window.visualViewport, vx=v?.offsetLeft || 0, vy=v?.offsetTop || 0;
    const vw=v?.width || window.innerWidth, vh=v?.height || window.innerHeight;
    const left=Math.max(vx+16,Math.min(r.left,vx+vw-w-16));
    const candidate=r.bottom+8+h<=vy+vh-16 ? r.bottom+8 : r.top-h-8;
    const top=Math.max(vy+16,Math.min(candidate,vy+vh-h-16));
    c.style.left = left + "px";
    c.style.top = top + "px";
    c.style.right = "auto";
    c.style.bottom = "auto";
    c.style.margin = "0";
  }
  function commit(s, value) {
    if (
      s.input.disabled ||
      s.input.hasAttribute("readonly") ||
      (value && !allowed(s, parse(value)))
    )
      return false;
    s.input.value = value;
    validate(s);
    if (value) {
      s.focus = parse(value);
      s.view = date(s.focus.getFullYear(), s.focus.getMonth(), 1);
    }
    s.input.dispatchEvent(new Event("input", { bubbles: true }));
    s.input.dispatchEvent(new Event("change", { bubbles: true }));
    s.input.dispatchEvent(
      new CustomEvent("ui:date", { bubbles: true, detail: { value } }),
    );
    render(s);
    if (!s.inline && s.calendar.open) s.calendar.close("select");
    return true;
  }
  function render(s, focus = false) {
    const c = s.calendar,
      year = s.view.getFullYear(),
      month = s.view.getMonth();
    [...c.children]
      .filter((el) => el !== s.announce)
      .forEach((el) => el.remove());
    s.announce.textContent =
      year + "년 " + (s.mode === "months" ? "월 선택" : month + 1 + "월");
    const header = document.createElement("div");
    header.className = "calendar__header";
    if (s.mode === "months") {
      const label = document.createElement("label");
      label.className = "calendar__year-label";
      const input = document.createElement("input");
      input.type = "number";
      input.className = "calendar__year";
      input.value = String(year);
      input.min = "1";
      input.max = "9999";
      input.setAttribute("data-calendar-year", "");
      input.setAttribute("aria-label", "연도");
      label.append(input, document.createTextNode("년"));
      header.append(label);
    } else {
      const period = button(
        year + "년 " + (month + 1) + "월",
        "calendar__period",
        "data-calendar-period",
        "",
      );
      period.id = c.id + "-title";
      period.setAttribute(
        "aria-label",
        year + "년 " + (month + 1) + "월, 월과 연도 선택",
      );
      period.append(UI.icon("chevron-down"));
      header.append(period);
    }
    const nav = document.createElement("div");
    nav.className = "calendar__nav";
    for (const delta of [-1, 1]) {
      const b = button("", "icon-button", "data-calendar-move", String(delta));
      b.append(UI.icon(delta < 0 ? "chevron-left" : "chevron-right"));
      b.setAttribute(
        "aria-label",
        (delta < 0 ? "이전" : "다음") + (s.mode === "months" ? " 해" : " 달"),
      );
      const next = shift(s.view, delta * (s.mode === "months" ? 12 : 1));
      const [min, max] = limits(s);
      b.disabled =
        s.mode === "months"
          ? next.getFullYear() < min.getFullYear() ||
            next.getFullYear() > max.getFullYear()
          : date(next.getFullYear(), next.getMonth() + 1, 0) < min ||
            next > max;
      nav.append(b);
    }
    header.append(nav);
    c.append(header);
    if (s.mode === "months") {
      const months = document.createElement("div");
      months.className = "calendar__months";
      months.setAttribute("role", "group");
      months.setAttribute("aria-label", year + "년 월 선택");
      const [min, max] = limits(s);
      for (let m = 0; m < 12; m++) {
        const b = button(
          m + 1 + "월",
          "calendar__month",
          "data-calendar-month",
          String(m),
        );
        b.disabled = date(year, m + 1, 0) < min || date(year, m, 1) > max;
        b.setAttribute("aria-pressed", String(m === month));
        months.append(b);
      }
      c.append(months);
      c.append(
        button(
          "날짜 선택으로 돌아가기",
          "calendar__return",
          "data-calendar-return",
          "",
        ),
      );
    } else {
      const grid = document.createElement("table");
      grid.className = "calendar__grid";
      grid.setAttribute("role", "grid");
      grid.setAttribute("aria-labelledby", c.id + "-title");
      const thead = document.createElement("thead"),
        week = document.createElement("tr");
      DAY.forEach((day) => {
        const th = document.createElement("th");
        th.scope = "col";
        th.setAttribute("abbr", day + "요일");
        th.textContent = day;
        week.append(th);
      });
      thead.append(week);
      grid.append(thead);
      const body = document.createElement("tbody"),
        first = date(year, month, 1),
        start = date(year, month, 1 - first.getDay()),
        todayKey = iso(today());
      for (let row = 0; row < 6; row++) {
        const tr = document.createElement("tr");
        for (let col = 0; col < 7; col++) {
          const d = date(
              start.getFullYear(),
              start.getMonth(),
              start.getDate() + row * 7 + col,
            ),
            value = iso(d),
            td = document.createElement("td"),
            b = button(
              String(d.getDate()),
              "calendar__day",
              "data-calendar-date",
              value,
            );
          b.disabled =
            !allowed(s, d) ||
            s.input.disabled ||
            s.input.hasAttribute("readonly");
          b.tabIndex = value === iso(s.focus) && !b.disabled ? 0 : -1;
          b.classList.toggle("is-outside", d.getMonth() !== month);
          b.setAttribute(
            "aria-label",
            d.getFullYear() +
              "년 " +
              (d.getMonth() + 1) +
              "월 " +
              d.getDate() +
              "일 " +
              DAY[d.getDay()] +
              "요일",
          );
          if (value === todayKey) b.setAttribute("aria-current", "date");
          if (value === s.input.value) td.setAttribute("aria-selected", "true");
          td.append(b);
          tr.append(td);
        }
        body.append(tr);
      }
      grid.append(body);
      c.append(grid);
    }
    const footer = document.createElement("div");
    footer.className = "calendar__footer";
    const clear = button("선택 해제", "text-button", "data-calendar-clear", ""),
      now = button("오늘", "text-button", "data-calendar-today", "");
    clear.disabled =
      s.input.disabled ||
      s.input.hasAttribute("readonly") ||
      s.input.hasAttribute("required") ||
      !s.input.value;
    now.disabled =
      !allowed(s, today()) ||
      s.input.disabled ||
      s.input.hasAttribute("readonly");
    footer.append(clear, now);
    c.append(footer);
    const help = document.createElement("p");
    help.className = "calendar__help";
    help.textContent =
      s.mode === "months"
        ? "연도를 입력하고 원하는 월을 선택하세요."
        : "방향키로 이동 · Enter로 선택" + (s.inline ? "" : " · Esc로 취소");
    c.append(help);
    place(s);
    if (focus) {
      const target =
        s.mode === "months"
          ? $("[data-calendar-year]", c)
          : $('[data-calendar-date][tabindex="0"]', c);
      (target || $("[data-calendar-period]", c))?.focus({
        preventScroll: true,
      });
    }
  }
  function open(s) {
    sync(s);
    if (s.trigger.disabled || s.inline || s.calendar.open) return;
    s.mode = "days";
    s.focus = clamp(s, parse(s.input.value) || today());
    s.view = date(s.focus.getFullYear(), s.focus.getMonth(), 1);
    render(s);
    UI.openDialog(s.calendar);
    s.calendar._returnFocus = s.trigger;
    s.trigger.setAttribute("aria-expanded", "true");
    place(s);
    $('[data-calendar-date][tabindex="0"]', s.calendar)?.focus({
      preventScroll: true,
    });
  }
  function setup(root) {
    const input = $("input", root);
    if (!input) return;
    let s = states.get(input);
    if (s) {
      sync(s);
      return s;
    }
    const control = $(".date-picker__control", root);
    if (!control) return;
    if (!input.id) input.id = "date-input-" + ++sequence;
    const value = input.value;
    input.type = "text";
    input.value = value;
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("placeholder", "YYYY-MM-DD");
    input.setAttribute("pattern", "[0-9]{4}-[0-9]{2}-[0-9]{2}");
    input.maxLength = 10;
    const trigger = button("", "date-picker__trigger", "data-date-trigger", "");
    trigger.append(UI.icon("calendar-days"));
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-expanded", "false");
    control.append(trigger);
    const inline = root.hasAttribute("data-inline"),
      calendar = document.createElement(inline ? "div" : "dialog");
    calendar.className = "calendar" + (inline ? " calendar--inline" : "");
    calendar.id = input.id + "-calendar";
    calendar.setAttribute(
      "aria-label",
      ($("label", root)?.textContent || "날짜") + " 달력",
    );
    if (inline) calendar.setAttribute("role", "group");
    else calendar.setAttribute("aria-modal", "true");
    root.append(calendar);
    trigger.setAttribute("aria-controls", calendar.id);
    trigger.hidden = inline;
    const error = document.createElement("p");
    error.id = input.id + "-date-error";
    error.className = "date-picker__error";
    error.hidden = true;
    error.setAttribute("aria-live", "polite");
    control.after(error);
    input.setAttribute(
      "aria-describedby",
      ((input.getAttribute("aria-describedby") || "") + " " + error.id).trim(),
    );
    const announce = document.createElement("span");
    announce.className = "sr-only";
    announce.setAttribute("aria-live", "polite");
    announce.setAttribute("aria-atomic", "true");
    calendar.append(announce);
    s = {
      input,
      control,
      root,
      trigger,
      calendar,
      error,
      announce,
      inline,
      mode: "days",
      focus: parse(input.value) || today(),
    };
    s.focus = clamp(s, s.focus);
    s.view = date(s.focus.getFullYear(), s.focus.getMonth(), 1);
    states.set(input, s);
    trigger.addEventListener("click", () => open(s));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        open(s);
      }
    });
    input.addEventListener("input", () => {
      if (/^\d{8}$/.test(input.value))
        input.value =
          input.value.slice(0, 4) +
          "-" +
          input.value.slice(4, 6) +
          "-" +
          input.value.slice(6);
      validate(s, false);
    });
    input.addEventListener("change", () => {
      validate(s);
      const selected = parse(input.value);
      if (allowed(s, selected)) {
        s.focus = selected;
        s.view = date(selected.getFullYear(), selected.getMonth(), 1);
      }
      render(s);
    });
    input.addEventListener("blur", () => validate(s));
    input.form?.addEventListener("reset", (e) =>
      setTimeout(() => {
        if (e.defaultPrevented) return;
        validate(s);
        s.focus = clamp(s, parse(input.value) || today());
        s.view = date(s.focus.getFullYear(), s.focus.getMonth(), 1);
        s.mode = "days";
        render(s);
      }, 0),
    );
    calendar.addEventListener("close", () =>
      trigger.setAttribute("aria-expanded", "false"),
    );
    calendar.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.hasAttribute("data-calendar-date")) {
        commit(s, b.dataset.calendarDate);
        return;
      }
      if (b.hasAttribute("data-calendar-clear")) {
        commit(s, "");
        return;
      }
      if (b.hasAttribute("data-calendar-today")) {
        commit(s, iso(today()));
        return;
      }
      if (b.hasAttribute("data-calendar-period")) {
        s.mode = "months";
        render(s, true);
        return;
      }
      if (b.hasAttribute("data-calendar-month")) {
        s.view = date(s.view.getFullYear(), Number(b.dataset.calendarMonth), 1);
        s.focus = clamp(s, s.view);
        s.mode = "days";
        render(s, true);
        return;
      }
      if (b.hasAttribute("data-calendar-return")) {
        s.mode = "days";
        s.focus = clamp(s, date(s.view.getFullYear(), s.view.getMonth(), 1));
        s.view = date(s.focus.getFullYear(), s.focus.getMonth(), 1);
        render(s, true);
        return;
      }
      if (b.hasAttribute("data-calendar-move")) {
        s.view = shift(
          s.view,
          Number(b.dataset.calendarMove) * (s.mode === "months" ? 12 : 1),
        );
        s.focus = clamp(
          s,
          date(
            s.view.getFullYear(),
            s.view.getMonth(),
            Math.min(
              s.focus.getDate(),
              date(s.view.getFullYear(), s.view.getMonth() + 1, 0).getDate(),
            ),
          ),
        );
        render(s);
        $(
          '[data-calendar-move="' + b.dataset.calendarMove + '"]',
          calendar,
        )?.focus();
      }
    });
    calendar.addEventListener("change", (e) => {
      if (e.target.hasAttribute("data-calendar-year")) {
        const [min, max] = limits(s),
          year = Math.max(
            min.getFullYear(),
            Math.min(
              max.getFullYear(),
              Number(e.target.value) || s.view.getFullYear(),
            ),
          );
        s.view = date(year, s.view.getMonth(), 1);
        render(s, true);
      }
    });
    calendar.addEventListener("keydown", (e) => {
      const b = e.target.closest("[data-calendar-date]");
      if (!b || e.altKey || e.ctrlKey || e.metaKey) return;
      const current = parse(b.dataset.calendarDate);
      let next;
      const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (e.key in delta)
        next = date(
          current.getFullYear(),
          current.getMonth(),
          current.getDate() + delta[e.key],
        );
      if (e.key === "Home")
        next = date(
          current.getFullYear(),
          current.getMonth(),
          current.getDate() - current.getDay(),
        );
      if (e.key === "End")
        next = date(
          current.getFullYear(),
          current.getMonth(),
          current.getDate() + 6 - current.getDay(),
        );
      if (e.key === "PageUp" || e.key === "PageDown")
        next = shift(
          current,
          (e.key === "PageUp" ? -1 : 1) * (e.shiftKey ? 12 : 1),
        );
      if (next) {
        e.preventDefault();
        s.focus = clamp(s, next);
        s.view = date(s.focus.getFullYear(), s.focus.getMonth(), 1);
        render(s, true);
      }
    });
    if (typeof MutationObserver !== "undefined") {
      s.observer = new MutationObserver(() => {
        sync(s);
        validate(s, false);
        s.focus = clamp(s, s.focus);
        s.view = date(s.focus.getFullYear(), s.focus.getMonth(), 1);
        render(s);
      });
      s.observer.observe(input, {
        attributes: true,
        attributeFilter: ["disabled", "readonly", "min", "max", "required"],
      });
    }
    sync(s);
    validate(s, false);
    render(s);
    return s;
  }
  UI.openDatePicker = function (target) {
    const input =
      typeof target === "string" ? document.getElementById(target) : target;
    const root = input?.closest("[data-datepicker]");
    if (root) open(setup(root));
  };
  UI.setDate = function (target, value) {
    const input =
      typeof target === "string" ? document.getElementById(target) : target;
    const root = input?.closest("[data-datepicker]");
    return root ? commit(setup(root), String(value)) : false;
  };
  registerInitializer((root) => {
    const list = [
      ...(root.matches?.("[data-datepicker]") ? [root] : []),
      ...root.querySelectorAll("[data-datepicker]"),
    ];
    list.forEach(setup);
  });
  function repositionCalendars() {
    document.querySelectorAll("[data-datepicker] input").forEach(input=>{
      const s=states.get(input);
      if(s) place(s);
    });
  }
  window.addEventListener("resize",repositionCalendars);
  window.addEventListener("scroll",repositionCalendars,{passive:true,capture:true});
  window.visualViewport?.addEventListener("resize",repositionCalendars);
  window.visualViewport?.addEventListener("scroll",repositionCalendars);
})();


/* Local time picker: form values use HH:mm, without the native OS picker. */
(function () {
  const states = new WeakMap();
  const pad = (n) => String(n).padStart(2, "0");
  const parse = (value) =>
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
      ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3))
      : null;
  const format = (value) => pad(Math.floor(value / 60)) + ":" + pad(value % 60);
  function allowed(s, value) {
    const min = parse(s.input.getAttribute("min") || s.input.dataset.min || ""),
      max = parse(s.input.getAttribute("max") || s.input.dataset.max || "");
    const range =
      min !== null && max !== null && min > max
        ? value >= min || value <= max
        : (min === null || value >= min) && (max === null || value <= max);
    return range && (value - (min ?? 0)) % s.step === 0;
  }
  function validate(s) {
    const value = parse(s.input.value);
    const valid = !s.input.value || (value !== null && allowed(s, value));
    s.input.setCustomValidity?.(
      valid ? "" : "선택 가능한 시간을 HH:mm 형식으로 입력해 주세요.",
    );
    s.input.setAttribute("aria-invalid", String(!valid));
    return valid;
  }
  function render(s) {
    s.hours.replaceChildren();
    s.minutes.replaceChildren();
    for (let h = 0; h < 24; h++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "timepicker__option";
      b.textContent = pad(h);
      b.setAttribute("aria-label", h + "시");
      b.setAttribute("aria-pressed", String(h === Math.floor(s.draft / 60)));
      b.disabled = !Array.from({ length: 60 }, (_, m) => h * 60 + m).some((v) =>
        allowed(s, v),
      );
      b.onclick = () => {
        const candidates = Array.from(
          { length: 60 },
          (_, m) => h * 60 + m,
        ).filter((v) => allowed(s, v));
        s.draft = candidates.reduce(
          (a, b) =>
            Math.abs((b % 60) - (s.draft % 60)) <
            Math.abs((a % 60) - (s.draft % 60))
              ? b
              : a,
          candidates[0],
        );
        render(s);
        s.hours.children[h]?.focus();
      };
      s.hours.append(b);
    }
    for (let m = 0; m < 60; m++) {
      const value = Math.floor(s.draft / 60) * 60 + m;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "timepicker__option";
      b.textContent = pad(m);
      b.setAttribute("aria-label", m + "분");
      b.setAttribute("aria-pressed", String(m === s.draft % 60));
      b.disabled = !allowed(s, value);
      b.onclick = () => {
        s.draft = value;
        render(s);
        s.minutes.children[m]?.focus();
      };
      s.minutes.append(b);
    }
    s.output.textContent = format(s.draft);
    s.confirm.disabled = !allowed(s, s.draft);
  }
  function commit(s, value) {
    if (s.input.disabled || s.input.readOnly) return false;
    if (value !== "" && (parse(value) === null || !allowed(s, parse(value))))
      return false;
    const changed = s.input.value !== value;
    s.input.value = value;
    validate(s);
    if (changed) {
      s.input.dispatchEvent(new Event("input", { bubbles: true }));
      s.input.dispatchEvent(new Event("change", { bubbles: true }));
      dispatch(s.input, "ui:timechange", { value });
    }
    return true;
  }
  function open(s) {
    if (s.input.disabled || s.input.readOnly) return;
    const current = parse(s.input.value),
      first = Array.from({ length: 1440 }, (_, i) => i).find((v) =>
        allowed(s, v),
      );
    s.draft = current !== null && allowed(s, current) ? current : (first ?? 0);
    const theme = s.root.closest("[data-theme]")?.dataset.theme;
    if (theme) s.dialog.dataset.theme = theme;
    else delete s.dialog.dataset.theme;
    render(s);
    UI.openDialog(s.dialog);
    const active = s.hours.querySelector('[aria-pressed="true"]');
    active?.focus();
    active?.scrollIntoView?.({ block: "nearest" });
    s.minutes
      .querySelector('[aria-pressed="true"]')
      ?.scrollIntoView?.({ block: "nearest" });
  }
  function setup(root) {
    const input = root.querySelector("input");
    if (!input) return null;
    if (states.has(input)) return states.get(input);
    input.type = "text";
    input.placeholder = "HH:mm";
    input.inputMode = "numeric";
    input.maxLength = 5;
    input.pattern = "([01][0-9]|2[0-3]):[0-5][0-9]";
    const step = Number(
      root.dataset.minuteStep || Number(input.getAttribute("step") || 60) / 60,
    );
    const s = {
      root,
      input,
      step: Number.isInteger(step) && step > 0 ? step : 1,
    };
    states.set(input, s);
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "timepicker__trigger";
    trigger.setAttribute("aria-label", "시간 선택 열기");
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.innerHTML =
      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
    root.append(trigger);
    const d = document.createElement("dialog");
    d.className = "dialog timepicker__dialog";
    d.id = "time-dialog-" + (input.id || Math.random().toString(36).slice(2));
    d.setAttribute("aria-labelledby", d.id + "-title");
    d.innerHTML =
      '<div class="timepicker__head"><h2 id="' +
      d.id +
      '-title">시간 선택</h2><output class="timepicker__value"></output></div><div class="timepicker__labels"><span>시</span><span>분</span></div><div class="timepicker__columns"><div class="timepicker__hours" role="group" aria-label="시 선택"></div><div class="timepicker__minutes" role="group" aria-label="분 선택"></div></div><div class="timepicker__actions"><button type="button" class="button button--weak" data-time-clear>선택 해제</button><button type="button" class="button" data-time-confirm>확인</button></div>';
    root.append(d);
    s.dialog = d;
    s.hours = d.querySelector(".timepicker__hours");
    s.minutes = d.querySelector(".timepicker__minutes");
    s.output = d.querySelector("output");
    s.confirm = d.querySelector("[data-time-confirm]");
    trigger.setAttribute("aria-controls", d.id);
    trigger.setAttribute("aria-expanded", "false");
    trigger.disabled = input.disabled || input.readOnly;
    trigger.onclick = () => open(s);
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        open(s);
      }
    });
    input.addEventListener("input", () => validate(s));
    input.addEventListener("change", () => {
      if (/^\d{4}$/.test(input.value))
        input.value = input.value.slice(0, 2) + ":" + input.value.slice(2);
      validate(s);
    });
    s.confirm.onclick = () => {
      if (commit(s, format(s.draft))) d.close("confirm");
    };
    d.querySelector("[data-time-clear]").onclick = () => {
      if (commit(s, "")) d.close("clear");
    };
    d.addEventListener("ui:open", () =>
      trigger.setAttribute("aria-expanded", "true"),
    );
    d.addEventListener("close", () =>
      trigger.setAttribute("aria-expanded", "false"),
    );
    for (const column of [s.hours, s.minutes])
      column.addEventListener("keydown", (e) => {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const options = [...column.querySelectorAll("button:not(:disabled)")],
          index = options.indexOf(e.target);
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? options.length - 1
              : Math.max(
                  0,
                  Math.min(
                    options.length - 1,
                    index + (e.key === "ArrowDown" ? 1 : -1),
                  ),
                );
        options[next]?.focus();
      });
    if (typeof MutationObserver !== "undefined")
      new MutationObserver(() => {
        trigger.disabled = input.disabled || input.readOnly;
        if (trigger.disabled && d.open) d.close("cancel");
      }).observe(input, {
        attributes: true,
        attributeFilter: ["disabled", "readonly"],
      });
    input.form?.addEventListener("reset", () =>
      setTimeout(() => validate(s), 0),
    );
    validate(s);
    return s;
  }
  UI.openTimePicker = (target) => {
    const input =
      typeof target === "string" ? document.getElementById(target) : target;
    const root = input?.closest("[data-timepicker]");
    if (root) open(setup(root));
  };
  UI.setTime = (target, value) => {
    const input =
      typeof target === "string" ? document.getElementById(target) : target;
    const root = input?.closest("[data-timepicker]");
    return root ? commit(setup(root), String(value)) : false;
  };
  registerInitializer((root) => {
    const list = [
      ...(root.matches?.("[data-timepicker]") ? [root] : []),
      ...root.querySelectorAll("[data-timepicker]"),
    ];
    list.forEach(setup);
  });
})();

/* Reading tables retain native table semantics inside a keyboard scroll region. */
function contentTables(root) {
  $$(".post table", root).forEach(table => {
    let region = table.parentElement;
    if (!region.classList.contains("table-wrap")) {
      region = document.createElement("div");
      region.className = "table-wrap";
      table.before(region);
      region.append(table);
    }
    region.tabIndex = 0;
    region.setAttribute("role", "region");
    if (!region.hasAttribute("aria-label") && !region.hasAttribute("aria-labelledby")) {
      region.setAttribute("aria-label", table.caption?.textContent.trim() || "본문 표");
    }
  });
}
registerInitializer(contentTables);

/* Progressive sharing: native chooser, clipboard, then a selectable address. */
UI.shareLink = async function ({title = document.title, url = location.href, onProgress = () => {}} = {}) {
  // Embedded browsers can expose Web Share/Clipboard without settling the promise.
  // Offer a manual route without ever treating a timeout as a successful share.
  const timedOut = Symbol("share-timeout");
  const bounded = (promise, delay) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(timedOut), delay);
    Promise.resolve(promise).then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
  let nativePending = false;
  if (navigator.share) {
    onProgress("native");
    try { if (await bounded(navigator.share({title, url}), 3000) !== timedOut) return "shared"; nativePending = true; }
    catch (error) { if (error.name === "AbortError") return "cancelled"; }
  }
  if (!nativePending) {
    onProgress("clipboard");
    try { if (await bounded(navigator.clipboard.writeText(url), 1500) !== timedOut) return "copied"; } catch {}
  }
  let dialog = document.getElementById("ui-share-link");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "ui-share-link";
    dialog.className = "dialog dialog--sheet";
    dialog.setAttribute("aria-labelledby", "ui-share-title");
    dialog.innerHTML = '<div class="dialog__header"><h2 id="ui-share-title">링크 공유</h2><button type="button" class="text-button" data-close>닫기</button></div><div class="dialog__body"><div class="field"><label class="label" for="ui-share-url">공유할 주소</label><input id="ui-share-url" class="input" readonly><p class="help" role="status" data-share-status>주소를 선택해 복사한 뒤 원하는 앱에 붙여 넣으세요.</p></div></div><div class="bottom-cta"><div class="bottom-cta__buttons"><button type="button" class="button" data-copy-link>링크 복사</button></div></div>';
    const input = dialog.querySelector("input"), status = dialog.querySelector("[data-share-status]");
    input.addEventListener("click", () => input.select());
    dialog.querySelector("[data-copy-link]").addEventListener("click", async () => {
      try { if (await bounded(navigator.clipboard.writeText(input.value), 1500) === timedOut) throw new Error("Clipboard timeout"); status.textContent = "링크를 복사했어요."; }
      catch { input.focus(); input.select(); status.textContent = "자동 복사를 사용할 수 없어요. 선택된 주소를 직접 복사해 주세요."; }
    });
    document.body.append(dialog);
  }
  dialog.querySelector("input").value = url;
  dialog.querySelector("[data-share-status]").textContent = nativePending ? "공유창 응답이 늦어지고 있어요. 주소를 직접 복사하거나 링크 복사를 눌러 주세요." : "주소를 선택해 복사한 뒤 원하는 앱에 붙여 넣으세요.";
  UI.openDialog(dialog);
  dialog.querySelector("input").focus();
  dialog.querySelector("input").select();
  return "displayed";
};

global.UI=UI;
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>UI.init(),{once:true});else UI.init();
})(window);
