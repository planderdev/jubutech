"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { INFO } from "@/lib/mock";
import { AdminHeader, AdminTable } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INFO_CATEGORIES } from "@/lib/types";
import { dday } from "@/lib/utils";

export default function AdminInfo() {
  const { hiddenInfo, adminToggleInfo, savedInfo } = useStore();
  const rows = INFO.map((a) => ({ ...a, hidden: hiddenInfo.includes(a.id), cat: INFO_CATEGORIES.find((c) => c.key === a.category)?.label ?? a.category, saved: a.saves + (savedInfo.includes(a.id) ? 1 : 0) }));
  return (
    <div>
      <AdminHeader title="돈되는정보 콘텐츠" count={INFO.length} description="출처·기준일이 없는 정보는 노출하지 않습니다. 마감이 지난 지원금은 자동으로 하단 정렬됩니다. (편집기는 Supabase 연결 후 활성화)" action={<Button size="sm" variant="ink" disabled>새 정보 작성</Button>} />
      <AdminTable
        rows={rows}
        searchKeys={["title", "summary", "source", "cat"]}
        bulkActions={[{ label: "숨김/노출 전환", onClick: (ids) => ids.forEach((id) => adminToggleInfo(id)) }]}
        columns={[
          { key: "title", label: "제목", render: (a) => <div className="max-w-[340px]"><div className="flex items-center gap-1.5 mb-0.5"><Badge tone="outline">{a.cat}</Badge>{a.deadline && <Badge tone={dday(a.deadline) === "마감" ? "mute" : "red"}>{dday(a.deadline)}</Badge>}{a.hidden && <Badge tone="mute">숨김</Badge>}</div><Link href={`/info/${a.id}`} className="font-semibold hover:text-red line-clamp-1">{a.title}</Link></div> },
          { key: "source", label: "출처 · 기준일", render: (a) => <span className="text-ink-2">{a.source} · <span className="num">{a.sourceDate.replace(/-/g, ".")}</span></span> },
          { key: "rewardPoints", label: "저장 P", className: "num", render: (a) => `+${a.rewardPoints}` },
          { key: "saved", label: "저장 수", className: "num", render: (a) => a.saved.toLocaleString() },
          { key: "actions", label: "", className: "text-right", render: (a) => <Button size="sm" variant={a.hidden ? "secondary" : "ghost"} onClick={() => adminToggleInfo(a.id)}>{a.hidden ? "노출" : "숨김"}</Button> },
        ]}
      />
    </div>
  );
}
