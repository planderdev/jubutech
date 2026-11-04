"use client";
import { useMemo, useState } from "react";
import { DEFAULT_RULES, RULE_KEYS, RULE_META, flattenRules, isValidRuleValue, type RuleKey, type RuleMeta } from "@jubutech/shared";
import { useRules, useStore } from "@/lib/store";
import { AdminHeader } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Notice, type NoticeState } from "@/components/ui/notice";

const GROUPS: RuleMeta["group"][] = ["리워드·지갑", "미션·기한", "생활력", "초대·운영", "광고주"];

/** 입력칸의 글자 → 저장할 값. 형식이 틀리면 undefined */
function parse(meta: RuleMeta, raw: string): unknown {
  const t = raw.trim();
  switch (meta.type) {
    case "number": return t === "" || Number.isNaN(Number(t)) ? undefined : Number(t);
    case "numbers": { const parts = t.split(/[,\s]+/).filter(Boolean).map(Number); return parts.some(Number.isNaN) ? undefined : parts; }
    case "date": return t === "" ? null : t;
    case "boolean": return t === "true";
    default: return t;
  }
}
function show(value: unknown): string {
  if (value === null || value === undefined) return "";
  return Array.isArray(value) ? value.join(", ") : String(value);
}

/**
 * 운영 설정 (`app_settings`) — `RULE_META` 로 입력란을 자동으로 만든다. 다음 회의에서 숫자가 정해지면 여기서만 고친다.
 * 지금은 이 브라우저에만 저장되고, 1단계 W8(Supabase) 뒤에는 `app_settings` 행을 쓰고 읽어 앱·웹이 같은 값을 본다.
 */
export default function AdminSettings() {
  const rules = useRules();
  const overrides = useStore((s) => s.ruleOverrides);
  const adminSetRule = useStore((s) => s.adminSetRule);
  const current = useMemo(() => flattenRules(rules), [rules]);
  const defaults = useMemo(() => flattenRules(DEFAULT_RULES), []);
  const [drafts, setDrafts] = useState<Partial<Record<RuleKey, string>>>({});
  const [notice, setNotice] = useState<NoticeState>(null);
  const valueOf = (k: RuleKey) => drafts[k] ?? show(current[k]);
  const dirty = RULE_KEYS.filter((k) => drafts[k] !== undefined && drafts[k] !== show(current[k]));
  const invalid = (k: RuleKey) => drafts[k] !== undefined && !isValidRuleValue(k, parse(RULE_META[k], drafts[k] ?? ""));

  const saveAll = () => {
    const bad = dirty.filter(invalid);
    if (bad.length) return setNotice({ ok: false, text: `형식을 확인해 주세요: ${bad.map((k) => RULE_META[k].label).join(", ")}` });
    dirty.forEach((k) => adminSetRule(k, parse(RULE_META[k], drafts[k] ?? "")));
    setDrafts({});
    setNotice({ ok: true, text: `${dirty.length}개 값을 저장했어요. 운영 로그에 남았어요.` });
  };
  const reset = (k: RuleKey) => {
    adminSetRule(k, undefined);
    setDrafts((d) => { const n = { ...d }; delete n[k]; return n; });
  };

  return (
    <div>
      <AdminHeader title="운영 설정" count={RULE_KEYS.length} description="기획안에서 미정인 숫자를 모은 곳입니다. '초안'은 코드 기본값이고, 회의에서 정해지면 여기서 바꿉니다." action={<Button onClick={saveAll} disabled={dirty.length === 0}>저장{dirty.length ? ` ${dirty.length}` : ""}</Button>} />
      <p className="mb-4 rounded-xl bg-inset p-3 text-[13px] text-ink-2">Supabase 연결 전이라 이 브라우저에만 저장됩니다. 앱에는 아직 반영되지 않고, 연결 뒤 `app_settings` 로 함께 읽습니다.</p>
      <Notice notice={notice} className="mb-3" />
      <div className="space-y-6">
        {GROUPS.map((g) => (
          <section key={g} className="bg-paper rounded-xl shadow-soft">
            <h2 className="px-4 pt-4 pb-2 text-[15px] font-bold">{g}</h2>
            <ul className="divide-y divide-hairline">
              {RULE_KEYS.filter((k) => RULE_META[k].group === g).map((k) => {
                const m = RULE_META[k];
                const changed = k in overrides;
                return (
                  <li key={k} className="px-4 py-3 grid md:grid-cols-[1fr_220px_auto] gap-2 md:gap-4 items-center">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold flex items-center gap-1.5">{m.label}{changed ? <Badge tone="sage">변경됨</Badge> : <Badge tone="mute">초안</Badge>}</p>
                      <p className="text-[12px] text-ink-3">{m.note} · <code className="text-[11px]">{k}</code></p>
                    </div>
                    <div>
                      {m.type === "boolean" ? (
                        <Select aria-label={m.label} value={valueOf(k)} onChange={(e) => setDrafts((d) => ({ ...d, [k]: e.target.value }))}><option value="true">켜기</option><option value="false">끄기</option></Select>
                      ) : m.type === "choice" ? (
                        <Select aria-label={m.label} value={valueOf(k)} onChange={(e) => setDrafts((d) => ({ ...d, [k]: e.target.value }))}>{(m.choices ?? []).map((c) => <option key={c} value={c}>{c}</option>)}</Select>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Input aria-label={m.label} aria-invalid={invalid(k)} type={m.type === "date" ? "date" : "text"} inputMode={m.type === "number" ? "decimal" : undefined} value={valueOf(k)} onChange={(e) => setDrafts((d) => ({ ...d, [k]: e.target.value }))} className={invalid(k) ? "num !border-red" : "num"} />
                          {m.unit && <span className="text-[12px] text-ink-3 shrink-0">{m.unit}</span>}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <button type="button" disabled={!changed} onClick={() => reset(k)} className="label text-ink-3 hover:text-red disabled:opacity-40" title={`기본값 ${show(defaults[k]) || "없음"}`}>기본값</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
