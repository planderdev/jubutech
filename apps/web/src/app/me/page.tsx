"use client";
import Link from "next/link";
import { useStore, useMe } from "@/lib/store";
import { logoutEverywhere } from "@/components/providers";
import { APPLICATION_STATUS, tradePnl } from "@/lib/types";
import { RoleGate } from "@/components/feature/role-gate";
import { Avatar } from "@/components/feature/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineIcon, type LineIconName } from "@/components/ui/line-icon";
import { PostItem } from "@/components/feature/post-item";
import { fmtNum, relTime, cn } from "@/lib/utils";

function MyPage() {
  const me = useMe()!;
  const logs = useStore((s) => s.pointLogs.filter((l) => l.userId === s.userId));
  const posts = useStore((s) => s.posts.filter((p) => p.authorId === s.userId));
  const apps = useStore((s) => s.applications.filter((a) => a.userId === s.userId && ["pending", "selected", "submitted"].includes(a.status)));
  const campaigns = useStore((s) => s.campaigns);
  const trades = useStore((s) => s.trades.filter((t) => t.userId === s.userId));
  const monthEarn = logs.filter((l) => l.amount > 0 && new Date(l.createdAt).getMonth() === new Date().getMonth()).reduce((n, l) => n + l.amount, 0);
  const realized = trades.map(tradePnl).filter(Boolean).reduce((n, r) => n + (r?.pnl ?? 0), 0);
  const menu: { href: string; label: string; icon: LineIconName; count?: number }[] = [
    { href: "/campaigns/my", label: "내 응모 현황", icon: "campaign", count: apps.length },
    { href: "/stock", label: "내 매매일지", icon: "stock", count: trades.length },
    { href: "/community?board=income", label: "내가 쓴 글", icon: "edit", count: posts.length },
    { href: "/info?c=saved", label: "저장한 정보", icon: "heart" },
    { href: "/notifications", label: "알림", icon: "bell" },
  ];

  return (
    <div className="px-4 md:px-5">
      <section className="mt-6 bg-paper rounded-xl shadow-card p-6 md:p-8 grid grid-cols-[auto_1fr] gap-4 items-center">
        <Avatar name={me.nickname} size="xl" image={me.image} />
        <div>
          <p className="display text-[24px]">{me.nickname} <span className="label text-red ml-1">Lv.{me.level}</span></p>
          <p className="text-[14px] text-ink-2 mt-1">{me.intro ?? me.region}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{me.tags.map((t) => <span key={t} className="text-[11px] text-ink-3">#{t}</span>)}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">{me.badges.map((b) => <Badge key={b} tone="butter">{b}</Badge>)}</div>
        </div>
        <div className="md:text-right">
          <p className="label text-ink-3">보유 포인트</p>
          <p className="num text-[32px] font-semibold text-red leading-none mt-1">{fmtNum(me.points)}<span className="text-[16px]">P</span></p>
          <Button size="sm" variant="secondary" className="mt-3">기프티콘 교환</Button>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[["이번 달 적립", `${fmtNum(monthEarn)}P`, ""], ["실현 손익", `${realized >= 0 ? "+" : ""}${fmtNum(realized)}원`, realized >= 0 ? "text-up" : "text-down"], ["진행 미션", `${apps.length}건`, ""]].map(([k, v, cls]) => (
          <div key={k} className="bg-paper rounded-xl shadow-soft p-4"><p className="label text-ink-3">{k}</p><p className={cn("num text-[18px] md:text-[22px] font-semibold mt-1", cls)}>{v}</p></div>
        ))}
      </div>

      <div className="mt-8 grid gap-6">
        <section>
          <p className="label text-ink-3 mb-2">메뉴</p>
          <ul className="bg-paper rounded-xl shadow-soft divide-y divide-hairline">
            {menu.map((m) => (
              <li key={m.label}><Link href={m.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-canvas"><LineIcon name={m.icon} className="text-red" /><span className="text-[15px] font-medium flex-1">{m.label}</span>{typeof m.count === "number" && <span className="num text-[12px] text-ink-3">{m.count}</span>}<LineIcon name="chevronRight" className="h-4 w-4 text-ink-3" /></Link></li>
            ))}
            <li><button type="button" onClick={() => void logoutEverywhere()} className="w-full flex items-center gap-3 px-4 py-3.5 text-ink-3 hover:text-red text-left text-[14px]">로그아웃</button></li>
          </ul>
        </section>
        <section>
          <p className="label text-ink-3 mb-2">포인트 내역</p>
          <ul className="bg-paper rounded-xl shadow-soft divide-y divide-hairline">
            {logs.slice(0, 8).map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-4 py-3"><div className="flex-1 min-w-0"><p className="text-[14px] truncate">{l.reason}</p><p className="num text-[11px] text-ink-3">{relTime(l.createdAt)}</p></div><span className={cn("num font-semibold text-[14px]", l.amount > 0 ? "text-red" : "text-ink-3")}>{l.amount > 0 ? "+" : ""}{fmtNum(l.amount)}P</span></li>
            ))}
          </ul>
        </section>
      </div>

      {apps.length > 0 && (
        <section className="mt-8">
          <p className="label text-ink-3 mb-2">진행 중인 미션</p>
          <ul className="grid md:grid-cols-2 gap-3">
            {apps.map((a) => { const c = campaigns.find((x) => x.id === a.campaignId); const st = APPLICATION_STATUS[a.status]; return (
              <li key={a.id}><Link href={`/campaigns/${a.campaignId}`} className="lift block bg-paper rounded-xl shadow-soft p-4"><div className="flex items-center justify-between"><span className="text-[12px] font-bold text-red">{c?.brand}</span><Badge tone={st.tone}>{st.label}</Badge></div><p className="text-[15px] font-semibold mt-1 line-clamp-1">{c?.title}</p><p className="num text-[12px] text-ink-3 mt-1">미션 마감 {c?.missionEnd.replace(/-/g, ".")}</p></Link></li>
            ); })}
          </ul>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mt-8">
          <p className="label text-ink-3 mb-1">내가 쓴 글</p>
          <div className="border-t border-hairline">{posts.slice(0, 5).map((p) => <PostItem key={p.id} post={p} />)}</div>
        </section>
      )}
    </div>
  );
}
export default function MePage() {
  return <RoleGate allow={["member", "advertiser", "admin"]}><MyPage /></RoleGate>;
}
