"use client";
import { useState } from "react";
import { DEMO_MEMBERS, downloadMilestone, inviteBonusLabel, DEFAULT_RULES } from "@jubutech/shared";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable, StatCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { relTime } from "@/lib/utils";

/** 2-3 대기자·초대·다운로드 — 랜딩 「출시 알림 받기」 목록, 초대 코드 사용 현황, 다운로드 카운터(구간) */
export default function AdminWaitlist() {
  const { waitlist, inviteCodes, downloadCount, setDownloadCount } = useStore();
  const [draft, setDraft] = useState(String(downloadCount));
  const [notice, setNotice] = useState<NoticeState>(null);
  const m = downloadMilestone(downloadCount);
  const invited = inviteCodes.reduce((n, c) => n + c.uses.length, 0);
  const rows = waitlist.map((w) => ({ ...w })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const codeRows = inviteCodes.map((c) => ({ id: c.code, code: c.code, owner: DEMO_MEMBERS.find((x) => x.id === c.ownerId)?.nickname ?? c.ownerId, uses: c.uses.length, lastUsed: c.uses.at(-1)?.usedAt ?? "", createdAt: c.createdAt }));

  return (
    <div>
      <AdminHeader title="대기자 · 초대 · 다운로드" count={waitlist.length} description="랜딩 「출시 알림 받기」 신청, 초대 코드 사용 현황, 앱 다운로드 카운터. 스토어 수치가 자동 연동되기 전에는 다운로드 수를 직접 입력합니다." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="앱 다운로드" value={downloadCount} tone="red" sub={m.label} />
        <StatCard label="출시 알림 대기자" value={waitlist.length} sub={`이메일 ${waitlist.filter((w) => w.channel === "email").length} · 휴대폰 ${waitlist.filter((w) => w.channel === "phone").length}`} />
        <StatCard label="초대로 가입" value={invited} sub={`코드 ${inviteCodes.length}개 · 보너스 ${inviteBonusLabel(DEFAULT_RULES).short}`} />
        <StatCard label="품앗이 목표" value={`${Math.round(m.progress * 100)}%`} tone="info" sub={m.next ? `${m.prev.toLocaleString()} → ${m.next.toLocaleString()} 구간` : "최고 구간"} />
      </div>
      <form className="bg-paper rounded-xl shadow-soft p-4 mb-4 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); const n = Number(draft); if (!Number.isFinite(n) || n < 0) return setNotice({ ok: false, text: "0 이상의 숫자를 입력해 주세요." }); setDownloadCount(Math.floor(n)); setNotice({ ok: true, text: `다운로드 수를 ${Math.floor(n).toLocaleString()} 으로 기록했어요.` }); }}>
        <Field label="앱 다운로드 수 (스토어 콘솔 값)"><Input value={draft} onChange={(e) => setDraft(e.target.value)} inputMode="numeric" className="num w-40" /></Field>
        <Button type="submit" variant="ink">기록</Button>
        <div className="basis-full"><Notice notice={notice} /></div>
      </form>
      <h2 className="text-[15px] font-bold mb-2">출시 알림 대기자</h2>
      <AdminTable
        rows={rows}
        searchKeys={["contact", "source"]}
        empty="아직 신청이 없어요"
        columns={[
          { key: "contact", label: "연락처", render: (w) => <span className="font-semibold">{w.contact}</span> },
          { key: "channel", label: "채널", render: (w) => <Badge tone={w.channel === "email" ? "sky" : "butter"}>{w.channel === "email" ? "이메일" : "휴대폰"}</Badge> },
          { key: "source", label: "유입", render: (w) => w.source ?? "—" },
          { key: "createdAt", label: "신청", className: "num text-ink-3", render: (w) => relTime(w.createdAt) },
        ]}
      />
      <h2 className="text-[15px] font-bold mt-6 mb-2">초대 코드</h2>
      <AdminTable
        rows={codeRows}
        searchKeys={["code", "owner"]}
        columns={[
          { key: "code", label: "코드", render: (c) => <span className="num font-semibold">{c.code}</span> },
          { key: "owner", label: "보유자", render: (c) => c.owner },
          { key: "uses", label: "가입", className: "num", render: (c) => `${c.uses}명` },
          { key: "lastUsed", label: "최근 사용", className: "num text-ink-3", render: (c) => (c.lastUsed ? relTime(c.lastUsed) : "—") },
        ]}
      />
    </div>
  );
}
