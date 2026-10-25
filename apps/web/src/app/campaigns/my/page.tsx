"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { APPLICATION_STATUS } from "@/lib/types";
import { PageHeader } from "@/components/feature/page-header";
import { Badge } from "@/components/ui/badge";
import { RoleGate } from "@/components/feature/role-gate";
import { EmptyState } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { relTime } from "@/lib/utils";

function MyApps() {
  const apps = useStore((s) => s.applications.filter((a) => a.userId === s.userId));
  const campaigns = useStore((s) => s.campaigns);
  const groups = [
    { key: "진행중", items: apps.filter((a) => ["pending", "selected", "submitted"].includes(a.status)) },
    { key: "완료", items: apps.filter((a) => a.status === "completed") },
    { key: "종료", items: apps.filter((a) => ["rejected", "cancelled"].includes(a.status)) },
  ];
  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="My Missions" title="내 응모 현황" description="응모 → 선정 → 미션 제출 → 보상 지급. 단계별로 확인하세요." />
      {apps.length === 0 && <EmptyState icon="campaign" title="아직 응모한 캠페인이 없어요" action={<Link href="/campaigns"><Button>캠페인 둘러보기</Button></Link>} />}
      {groups.map((g) => g.items.length > 0 && (
        <section key={g.key} className="mb-8">
          <p className="label text-ink-3 mb-2">{g.key} <span className="num text-ink">{g.items.length}</span></p>
          <ul className="bg-paper rounded-xl shadow-soft divide-y divide-hairline">
            {g.items.map((a) => {
              const c = campaigns.find((x) => x.id === a.campaignId);
              const st = APPLICATION_STATUS[a.status];
              return (
                <li key={a.id}>
                  <Link href={`/campaigns/${a.campaignId}`} className="flex items-center gap-4 p-4 hover:bg-canvas transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-red">{c?.brand}</p>
                      <p className="text-[15px] font-semibold truncate">{c?.title}</p>
                      <p className="num text-[12px] text-ink-3 mt-0.5">응모 {relTime(a.createdAt)} · {c?.reward.desc}</p>
                    </div>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
export default function MyApplicationsPage() {
  return <RoleGate allow={["member", "admin"]}><MyApps /></RoleGate>;
}
