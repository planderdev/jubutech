"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable, StatCard } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { fmtNum, relTime } from "@/lib/utils";
import { WALLET_KINDS, WALLET_KIND_LABEL, walletKindOf, type WalletEntryKind } from "@jubutech/shared";
import { Badge } from "@/components/ui/badge";

const KIND_TONE: Record<WalletEntryKind, "red" | "sky" | "butter" | "sage" | "mute" | "ink"> = { review: "red", referral: "sky", event: "butter", product_value: "sage", withdraw: "ink", adjust: "mute" };

export default function AdminPoints() {
  const { pointLogs, users, adminGrantPoints } = useStore();
  const [userId, setUserId] = useState("u1");
  const [amount, setAmount] = useState("1000");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<NoticeState>(null);
  const [kind, setKind] = useState<"" | WalletEntryKind>("");
  const month = new Date().getMonth();
  const granted = pointLogs.filter((l) => l.amount > 0 && new Date(l.createdAt).getMonth() === month).reduce((n, l) => n + l.amount, 0);
  const redeemed = pointLogs.filter((l) => l.amount < 0).reduce((n, l) => n - l.amount, 0);
  const outstanding = users.reduce((n, u) => n + u.points, 0);
  const rows = pointLogs.filter((l) => !kind || walletKindOf(l) === kind).map((l) => ({ ...l, kindLabel: WALLET_KIND_LABEL[walletKindOf(l)], nickname: users.find((u) => u.id === l.userId)?.nickname ?? l.userId }));
  const productValue = pointLogs.filter((l) => walletKindOf(l) === "product_value").reduce((n, l) => n + l.amount, 0);

  return (
    <div>
      <AdminHeader title="포인트 · 정산" description="포인트는 현금성 리워드이므로 지급·차감 사유가 모두 로그로 남습니다. 회계·세무 검토 대상." />
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard label="이달 지급" value={`${fmtNum(granted)}P`} tone="red" />
        <StatCard label="누적 사용(교환)" value={`${fmtNum(redeemed)}P`} />
        <StatCard label="미사용 잔액(부채)" value={`${fmtNum(outstanding)}P`} tone="info" sub={`≈ ${fmtNum(outstanding)}원 · 받은 제품 가치 ${fmtNum(productValue)}원은 별도`} />
      </div>
      <form className="bg-paper rounded-xl shadow-soft p-4 mb-4 grid sm:grid-cols-[1fr_140px_1.4fr_auto] gap-3 items-end" onSubmit={(e) => { e.preventDefault(); const n = Number(amount); if (!n || !reason.trim()) return setNotice({ ok: false, text: "금액과 사유를 입력해 주세요." }); adminGrantPoints(userId, n, reason.trim()); setNotice({ ok: true, text: `${users.find((u) => u.id === userId)?.nickname}님에게 ${fmtNum(n)}P 반영했어요.` }); setReason(""); }}>
        <Field label="회원"><Select value={userId} onChange={(e) => setUserId(e.target.value)}>{users.filter((u) => u.role === "member").map((u) => <option key={u.id} value={u.id}>{u.nickname} ({fmtNum(u.points)}P)</option>)}</Select></Field>
        <Field label="금액 (±)"><Input value={amount} onChange={(e) => setAmount(e.target.value)} className="num" /></Field>
        <Field label="사유"><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="이벤트 당첨 / 오지급 회수 …" /></Field>
        <Button type="submit" variant="ink">수동 반영</Button>
        <div className="sm:col-span-4"><Notice notice={notice} /></div>
      </form>
      <AdminTable
        rows={rows}
        searchKeys={["nickname", "reason", "kindLabel"]}
        filters={<select value={kind} onChange={(e) => setKind(e.target.value as "" | WalletEntryKind)} aria-label="내역 유형" className="h-9 rounded-full bg-inset px-3 text-[12px] font-semibold outline-none"><option value="">유형 전체</option>{WALLET_KINDS.map((k) => <option key={k} value={k}>{WALLET_KIND_LABEL[k]}</option>)}</select>}
        columns={[
          { key: "nickname", label: "회원", render: (l) => <span className="font-semibold">{l.nickname}</span> },
          { key: "kindLabel", label: "유형", render: (l) => <Badge tone={KIND_TONE[walletKindOf(l)]}>{l.kindLabel}</Badge> },
          { key: "reason", label: "사유", render: (l) => l.reason },
          { key: "amount", label: "포인트", className: "num text-right", render: (l) => <span className={l.amount > 0 ? "text-red font-bold" : "text-ink-2 font-bold"}>{l.amount > 0 ? "+" : ""}{fmtNum(l.amount)}</span> },
          { key: "createdAt", label: "일시", className: "num text-ink-3", render: (l) => relTime(l.createdAt) },
        ]}
      />
    </div>
  );
}
