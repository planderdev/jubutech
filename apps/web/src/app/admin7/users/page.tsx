"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable, askReason } from "@/components/admin/admin-ui";
import { Avatar } from "@/components/feature/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip, ChipRow } from "@/components/ui/chip";
import type { User } from "@/lib/types";
import { fmtNum } from "@/lib/utils";

const ROLE_LABEL: Record<User["role"], string> = { member: "회원", advertiser: "광고주", admin: "운영자" };

export default function AdminUsers() {
  const users = useStore((s) => s.users);
  const posts = useStore((s) => s.posts);
  const apps = useStore((s) => s.applications);
  const { adminSetUserRole, adminSetUserStatus, adminGrantPoints } = useStore();
  const [role, setRole] = useState<"all" | User["role"]>("all");
  const rows = users.filter((u) => role === "all" || u.role === role).map((u) => ({ ...u, posts: posts.filter((p) => p.authorId === u.id).length, apps: apps.filter((a) => a.userId === u.id && a.status !== "cancelled").length }));
  const grant = (id: string) => { const v = window.prompt("지급/차감할 포인트 (음수 가능)", "1000"); if (v === null) return; const n = Number(v); if (!n) return; const reason = window.prompt("사유", "운영 보상") ?? "운영"; adminGrantPoints(id, n, reason); };

  return (
    <div>
      <AdminHeader title="회원 관리" count={users.length} description="역할 변경 · 이용 정지 · 포인트 조정. 자녀 정보는 수집하지 않으며 개인정보는 닉네임·지역만 표시됩니다." />
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
          { key: "posts", label: "글/응모", className: "num", render: (u) => `${u.posts} / ${u.apps}` },
          { key: "joinedAt", label: "가입", className: "num text-ink-3", render: (u) => u.joinedAt?.replace(/-/g, ".") ?? "—" },
          { key: "actions", label: "", className: "text-right", render: (u) => <div className="flex gap-1 justify-end"><Button size="sm" variant="secondary" onClick={() => grant(u.id)}>포인트</Button>{u.status === "suspended" ? <Button size="sm" variant="ghost" onClick={() => adminSetUserStatus(u.id, "active")}>해제</Button> : <Button size="sm" variant="danger" onClick={() => { const r = askReason(`${u.nickname} 정지`); if (r !== null) adminSetUserStatus(u.id, "suspended", r); }}>정지</Button>}</div> },
        ]}
      />
    </div>
  );
}
