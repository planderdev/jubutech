"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable, askReason } from "@/components/admin/admin-ui";
import { Avatar } from "@/components/feature/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip, ChipRow } from "@/components/ui/chip";
import { Drawer } from "@/components/ui/drawer";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Notice, type NoticeState } from "@/components/ui/notice";
import type { User } from "@/lib/types";
import { fmtNum, relTime } from "@/lib/utils";
import { DEFAULT_RULES, TRUST_EVENT_LABEL, TRUST_GRADE_LABEL, trustGrade, trustScores, trustTimeline, type TrustGrade } from "@jubutech/shared";

const GRADE_TONE: Record<TrustGrade, "red" | "mute" | "sky" | "sage"> = { caution: "red", normal: "mute", good: "sky", excellent: "sage" };

const ROLE_LABEL: Record<User["role"], string> = { member: "회원", advertiser: "광고주", admin: "운영자" };

export default function AdminUsers() {
  const users = useStore((s) => s.users);
  const posts = useStore((s) => s.posts);
  const apps = useStore((s) => s.applications);
  const trustEvents = useStore((s) => s.trustEvents);
  const { adminSetUserRole, adminSetUserStatus, adminGrantPoints, adminRunOverdueCheck } = useStore();
  const [role, setRole] = useState<"all" | User["role"]>("all");
  const [trustOpen, setTrustOpen] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  const scores = trustScores(trustEvents);
  const trustName = DEFAULT_RULES.trust.name;
  const rows = users.filter((u) => role === "all" || u.role === role).map((u) => ({ ...u, posts: posts.filter((p) => p.authorId === u.id).length, apps: apps.filter((a) => a.userId === u.id && a.status !== "cancelled").length, trust: scores[u.id] ?? 0 }));
  const grant = (id: string) => { const v = window.prompt("지급/차감할 포인트 (음수 가능)", "1000"); if (v === null) return; const n = Number(v); if (!n) return; const reason = window.prompt("사유", "운영 보상") ?? "운영"; adminGrantPoints(id, n, reason); };

  return (
    <div>
      <AdminHeader title="회원 관리" count={users.length} description={`역할 변경 · 이용 정지 · 포인트 조정 · ${trustName}(관리자 전용 신뢰도, 사용자 미노출). 자녀 정보는 수집하지 않으며 개인정보는 닉네임·지역만 표시됩니다.`} action={<Button size="sm" variant="secondary" onClick={() => { const n = adminRunOverdueCheck(); setNotice({ ok: true, text: n ? `후기 기한 초과 ${n}건을 ${trustName}에 기록했어요.` : "새로 기한을 넘긴 응모가 없어요." }); }}>기한 초과 점검</Button>} />
      <Notice notice={notice} className="mb-3" />
      <ChipRow className="mb-3">{(["all", "member", "advertiser", "admin"] as const).map((k) => <Chip key={k} active={role === k} onClick={() => setRole(k)}>{k === "all" ? "전체" : ROLE_LABEL[k]}</Chip>)}</ChipRow>
      <AdminTable
        rows={rows}
        searchKeys={["nickname", "name", "region", "brand"]}
        bulkActions={[
          { label: "정지", variant: "danger", onClick: (ids) => { const r = askReason(`${ids.length}명 정지`); if (r === null) return; ids.forEach((id) => adminSetUserStatus(id, "suspended", r)); } },
          { label: "정지 해제", onClick: (ids) => ids.forEach((id) => adminSetUserStatus(id, "active")) },
        ]}
        columns={[
          { key: "nickname", label: "회원", render: (u) => <div className="flex items-center gap-2.5"><Avatar name={u.nickname} size="sm" /><div><p className="font-semibold">{u.nickname} <span className="text-ink-3 font-normal">{u.name}</span></p><p className="text-[11px] text-ink-3">{u.region}{u.brand && ` · ${u.brand}`}</p></div></div> },
          { key: "role", label: "역할", render: (u) => <select value={u.role} onChange={(e) => adminSetUserRole(u.id, e.target.value as User["role"])} className="h-8 rounded-md bg-inset px-2 text-[12px] font-semibold outline-none"><option value="member">회원</option><option value="advertiser">광고주</option><option value="admin">운영자</option></select> },
          { key: "status", label: "상태", render: (u) => u.status === "suspended" ? <Badge tone="red">정지</Badge> : <Badge tone="sage">정상</Badge> },
          { key: "points", label: "포인트", className: "num text-right", render: (u) => fmtNum(u.points) + "P" },
          { key: "level", label: "Lv", className: "num", render: (u) => u.level },
          { key: "trust", label: trustName, className: "num", render: (u) => u.role === "member" ? <button type="button" onClick={() => setTrustOpen(u.id)} className="inline-flex items-center gap-1.5 hover:text-red"><span className="font-bold">{u.trust > 0 ? "+" : ""}{u.trust}</span><Badge tone={GRADE_TONE[trustGrade(u.trust)]}>{TRUST_GRADE_LABEL[trustGrade(u.trust)]}</Badge></button> : <span className="text-ink-3">—</span> },
          { key: "posts", label: "글/응모", className: "num", render: (u) => `${u.posts} / ${u.apps}` },
          { key: "joinedAt", label: "가입", className: "num text-ink-3", render: (u) => u.joinedAt?.replace(/-/g, ".") ?? "—" },
          { key: "actions", label: "", className: "text-right", render: (u) => <div className="flex gap-1 justify-end"><Button size="sm" variant="secondary" onClick={() => grant(u.id)}>포인트</Button>{u.status === "suspended" ? <Button size="sm" variant="ghost" onClick={() => adminSetUserStatus(u.id, "active")}>해제</Button> : <Button size="sm" variant="danger" onClick={() => { const r = askReason(`${u.nickname} 정지`); if (r !== null) adminSetUserStatus(u.id, "suspended", r); }}>정지</Button>}</div> },
        ]}
      />
      <TrustDrawer userId={trustOpen} onClose={() => setTrustOpen(null)} />
    </div>
  );
}

/** 회원 상세 — 생활력 점수·등급·변동 이력, 운영자 수동 조정(사유 필수) */
function TrustDrawer({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const users = useStore((s) => s.users);
  const trustEvents = useStore((s) => s.trustEvents);
  const adminAdjustTrust = useStore((s) => s.adminAdjustTrust);
  const [delta, setDelta] = useState("5");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState<NoticeState>(null);
  const user = users.find((u) => u.id === userId);
  const timeline = userId ? trustTimeline(trustEvents, userId) : [];
  const score = timeline.reduce((n, e) => n + e.delta, 0);
  const d = DEFAULT_RULES.trust.delta;
  return (
    <Drawer open={!!user} onClose={onClose} title={`${DEFAULT_RULES.trust.name} 상세`} width={480}>
      {user ? (
        <>
          <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
            <div><p className="text-[12px] text-ink-3">{DEFAULT_RULES.trust.name} · 관리자 전용</p><h2 className="text-[16px] font-bold">{user.nickname} <span className="num">{score > 0 ? "+" : ""}{score}점</span></h2></div>
            <Badge tone={GRADE_TONE[trustGrade(score)]}>{TRUST_GRADE_LABEL[trustGrade(score)]}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-[13px]">
            <section>
              <p className="label text-ink-3 mb-1.5">규칙표 (운영 설정)</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-ink-2">
                <li>후기 승인 +{d.reviewApproved}</li><li>별점 (별점−3)×{d.ratingPerStar}</li><li>답글 좋아요 +{d.commentLiked}</li><li>기한 초과 {d.reviewOverdue}</li><li>신고 숨김 {d.postHidden}</li><li>초대 보너스 {DEFAULT_RULES.invite.bonus === "trust" ? `+${d.inviteBonus}` : "미적용(우선 선정권)"}</li>
              </ul>
            </section>
            <section>
              <p className="label text-ink-3 mb-1.5">변동 이력 {timeline.length}건</p>
              {timeline.length === 0 ? <p className="text-ink-3">아직 기록이 없어요.</p> : (
                <ul className="divide-y divide-hairline rounded-lg border border-hairline">
                  {timeline.map((e) => (
                    <li key={e.id} className="flex items-start gap-3 px-3 py-2">
                      <span className={`num font-bold w-10 ${e.delta < 0 ? "text-red" : e.delta > 0 ? "text-success" : "text-ink-3"}`}>{e.delta > 0 ? "+" : ""}{e.delta}</span>
                      <span className="flex-1"><span className="font-semibold">{TRUST_EVENT_LABEL[e.kind]}</span>{e.note ? <span className="text-ink-3"> · {e.note}</span> : null}</span>
                      <span className="num text-ink-3 whitespace-nowrap">{relTime(e.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const n = Number(delta); if (!Number.isFinite(n) || n === 0) return setNotice({ ok: false, text: "0이 아닌 숫자를 입력해 주세요." }); if (!note.trim()) return setNotice({ ok: false, text: "조정 사유를 입력해 주세요." }); adminAdjustTrust(user.id, n, note.trim()); setNote(""); setNotice({ ok: true, text: `${n > 0 ? "+" : ""}${n}점 조정했어요.` }); }}>
              <p className="label text-ink-3">운영자 수동 조정</p>
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <Field label="점수 (±)"><Input value={delta} onChange={(e) => setDelta(e.target.value)} className="num" inputMode="numeric" /></Field>
                <Field label="사유" required><Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="예: 오프라인 행사 도움" /></Field>
              </div>
              <Notice notice={notice} />
              <Button type="submit" variant="ink" size="sm">조정 기록</Button>
            </form>
            <p className="text-[12px] text-ink-3">사용자 앱에는 보이지 않아요(설정 trust.visibleToUsers). 데이터가 쌓인 뒤 공개 여부를 정합니다.</p>
          </div>
        </>
      ) : null}
    </Drawer>
  );
}
