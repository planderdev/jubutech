"use client";
import Link from "next/link";
import { useStore, useMe } from "@/lib/store";
import { CAMPAIGN_STATUS } from "@/lib/types";
import { PageHeader } from "@/components/feature/page-header";
import { RoleGate } from "@/components/feature/role-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineIcon } from "@/components/ui/line-icon";
import { EmptyState } from "@/components/ui/empty";
import { fmtNum } from "@/lib/utils";

function Dashboard() {
  const me = useMe();
  const role = useStore((s) => s.role);
  const mine = useStore((s) => s.campaigns.filter((c) => role === "admin" || c.advertiserId === s.userId));
  const apps = useStore((s) => s.applications);
  const stats = [
    ["진행 캠페인", mine.filter((c) => ["open", "ongoing", "selected"].includes(c.status)).length, "건"],
    ["누적 신청", mine.reduce((n, c) => n + c.applicantIds.length, 0), "명"],
    ["미션 완료", apps.filter((a) => mine.some((c) => c.id === a.campaignId) && a.status === "completed").length, "건"],
    ["누적 조회", mine.reduce((n, c) => n + c.views, 0), "회"],
  ];
  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="Advertiser Center" title={`${me?.brand ?? me?.nickname} 광고주 센터`} description="캠페인을 열고, 신청자를 선정하고, 미션 결과를 검수하세요." action={<Link href="/advertiser/campaigns/new"><Button><LineIcon name="plus" className="h-4 w-4" />새 캠페인</Button></Link>} />
      <div className="grid grid-cols-2 gap-3">
        {stats.map(([k, v, u]) => (
          <div key={k} className="bg-paper rounded-xl shadow-soft p-4"><p className="label text-ink-3">{k}</p><p className="num text-[26px] font-semibold mt-1">{fmtNum(Number(v))}<span className="text-[13px] text-ink-3 ml-1">{u}</span></p></div>
        ))}
      </div>
      <section className="mt-8">
        <p className="label text-ink-3 mb-2">내 캠페인 <span className="num text-ink">{mine.length}</span></p>
        {mine.length === 0 ? <EmptyState icon="campaign" title="첫 캠페인을 열어보세요" action={<Link href="/advertiser/campaigns/new"><Button>캠페인 만들기</Button></Link>} /> : (
          <div className="bg-paper rounded-xl shadow-card overflow-x-auto">
            <table className="w-full text-[14px] min-w-[640px]">
              <thead><tr className="label text-ink-3 border-b border-hairline">{["캠페인", "상태", "모집", "신청", "선정", "제출", "마감", ""].map((h, i) => <th key={i} className="text-left font-medium px-4 py-3">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-hairline">
                {mine.map((c) => {
                  const ca = apps.filter((a) => a.campaignId === c.id && a.status !== "cancelled");
                  return (
                    <tr key={c.id} className="hover:bg-canvas">
                      <td className="px-4 py-3"><p className="text-[11px] font-bold text-red">{c.brand}</p><p className="font-semibold">{c.title}</p></td>
                      <td className="px-4 py-3"><Badge tone={CAMPAIGN_STATUS[c.status].tone}>{CAMPAIGN_STATUS[c.status].label}</Badge></td>
                      <td className="px-4 py-3 num">{c.recruitCount}</td>
                      <td className="px-4 py-3 num">{ca.length}</td>
                      <td className="px-4 py-3 num">{ca.filter((a) => ["selected", "submitted", "completed"].includes(a.status)).length}</td>
                      <td className="px-4 py-3 num">{ca.filter((a) => ["submitted", "completed"].includes(a.status)).length}</td>
                      <td className="px-4 py-3 num text-ink-3">{c.recruitEnd.slice(5).replace("-", ".")}</td>
                      <td className="px-4 py-3 text-right"><Link href={`/advertiser/campaigns/${c.id}`} className="label text-red hover:underline">관리 →</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
export default function AdvertiserPage() {
  return <RoleGate allow={["advertiser", "admin"]}><Dashboard /></RoleGate>;
}
