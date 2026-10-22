"use client";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable } from "@/components/admin/admin-ui";
import { relTime } from "@/lib/utils";

export default function AdminLogs() {
  const { auditLogs, users } = useStore();
  const rows = auditLogs.map((l) => ({ ...l, actor: users.find((u) => u.id === l.actorId)?.nickname ?? l.actorId }));
  return (
    <div>
      <AdminHeader title="운영 로그" count={auditLogs.length} description="운영자의 모든 조치(역할 변경·정지·숨김·삭제·검수·신고 처리·포인트 조정)가 기록됩니다." />
      <AdminTable
        rows={rows}
        searchKeys={["action", "target", "reason", "actor"]}
        columns={[
          { key: "createdAt", label: "일시", className: "num text-ink-3 whitespace-nowrap", render: (l) => `${l.createdAt.slice(0, 16).replace("T", " ")} (${relTime(l.createdAt)})` },
          { key: "actor", label: "운영자", render: (l) => l.actor },
          { key: "action", label: "조치", render: (l) => <span className="font-semibold">{l.action}</span> },
          { key: "target", label: "대상", render: (l) => l.target },
          { key: "reason", label: "사유", render: (l) => l.reason ?? <span className="text-ink-3">—</span> },
        ]}
      />
    </div>
  );
}
