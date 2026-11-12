"use client";
import Link from "next/link";
import { useRules, useStore } from "@/lib/store";
import { AdminHeader, StatCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CAMPAIGN_STATUS } from "@/lib/types";
import { relTime, fmtNum } from "@/lib/utils";
import { DEMO_APPLICATIONS, DEMO_CAMPAIGNS, dashboardMetrics, downloadMilestone, reviewOverdueTrustEvents } from "@jubutech/shared";

export default function AdminDashboard() {
  const { users, posts, campaigns, applications, reports, pointLogs, auditLogs, reviews, waitlist, inviteCodes, downloadCount } = useStore();
  const rules = useRules();
  const trustEvents = useStore((s) => s.trustEvents);
  const milestone = downloadMilestone(downloadCount);
  // 3-3 주간 현황판 — 없는 숫자는 "연결 전"으로 둔다. 기한 지난 미제출은 아직 기록 안 된 것까지 센다
  const pendingOverdue = reviewOverdueTrustEvents({ applications: DEMO_APPLICATIONS, campaigns: DEMO_CAMPAIGNS, reviews, events: trustEvents, rules, now: new Date().toISOString() }).length;
  const overdueCount = pendingOverdue + trustEvents.filter((e) => e.kind === "review_overdue").length;
  const m = dashboardMetrics({ downloads: downloadCount, users, campaigns, applications, reviews, overdueCount, pointLogs, posts, reports, rules, now: new Date() });
  const orDash = (v: number | null, unit = "") => (v === null ? "연결 전" : `${fmtNum(v)}${unit}`);
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;
  const members = users.filter((u) => u.role === "member");
  const pending = campaigns.filter((c) => c.status === "pending");
  const openReports = reports.filter((r) => r.status === "open");
  const month = new Date().getMonth();
  const granted = pointLogs.filter((l) => l.amount > 0 && new Date(l.createdAt).getMonth() === month).reduce((n, l) => n + l.amount, 0);
  const completed = applications.filter((a) => a.status === "completed").length;
  const submitted = applications.filter((a) => a.status === "submitted").length;

  return (
    <div>
      <AdminHeader title="운영 대시보드" description="오늘 처리할 검수·신고와 서비스 핵심 지표를 한눈에." />
      <section className="mb-6" aria-label="주간 현황판">
        <p className="label text-ink-3 mb-2">주간 현황판</p>
        <div className="grid md:grid-cols-2 gap-3">
          {([
            ["성장", [["누적 다운로드", `${fmtNum(m.growth.downloads)} · ${m.growth.milestone}`], ["주간 신규 가입", `${m.growth.weeklySignups}명`], ["주간 활성 사용자", orDash(m.growth.weeklyActive, "명")]]],
            ["체험단", [["진행 중 캠페인", `${m.campaigns.running}건`], ["응모 → 선정 → 후기 제출", `${m.campaigns.applied} → ${m.campaigns.selected} → ${m.campaigns.submitted}`], ["기한 지난 미제출", `${m.campaigns.overdue}건`]]],
            ["돈", [["이번 달 기본 수수료(추정)", `${fmtNum(m.money.monthlyFee)}원`], ["이번 달 대행비(추정)", `${fmtNum(m.money.monthlyAgency)}원`], ["이번 달 광고 매출", orDash(m.money.monthlyAdRevenue, "원")], ["사용자에게 준 리워드", `${fmtNum(m.money.rewardsPaid)}원`]]],
            ["운영", [["검토 대기 글", `${m.ops.reviewPosts}건`], ["미처리 신고", `${m.ops.openReports}건`], ["후기 검수 대기", `${m.ops.pendingReviews}건`], ["처리 안 된 1:1 문의", orDash(m.ops.openChats, "건")]]],
          ] as [string, [string, string][]][]).map(([group, rows]) => (
            <div key={group} className="bg-paper rounded-xl shadow-soft p-4">
              <p className="text-[15px] font-bold mb-2">{group}</p>
              <dl className="space-y-1.5 text-[13px]">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-ink-2">{k}</dt><dd className={v === "연결 전" ? "text-ink-3" : "num font-semibold"}>{v}</dd></div>)}</dl>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-3">수수료는 이번 달 등록 캠페인 × 현재 단가(운영 설정)로 계산한 추정치예요. 결제가 연결되면 실제 매출로 바꿉니다.</p>
      </section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="회원" value={members.length} sub={`광고주 ${users.filter((u) => u.role === "advertiser").length} · 정지 ${users.filter((u) => u.status === "suspended").length}`} href="/admin7/users" />
        <StatCard label="검수 대기 캠페인" value={pending.length} tone={pending.length ? "red" : undefined} sub={`모집중 ${campaigns.filter((c) => c.status === "open").length}`} href="/admin7/campaigns" />
        <StatCard label="미처리 신고" value={openReports.length} tone={openReports.length ? "red" : undefined} sub={`전체 ${reports.length}건`} href="/admin7/reports" />
        <StatCard label="이달 지급 포인트" value={`${fmtNum(granted)}P`} tone="info" sub={`미션 완료 ${completed} · 검수 대기 ${submitted}`} href="/admin7/points" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <StatCard label="게시글" value={posts.length} sub={`숨김 ${posts.filter((p) => p.status === "hidden").length}`} href="/admin7/posts" />
        <StatCard label="응모" value={applications.filter((a) => a.status !== "cancelled").length} sub={`선정 ${applications.filter((a) => ["selected", "submitted", "completed"].includes(a.status)).length}`} href="/admin7/applications" />
        <StatCard label="후기 검수 대기" value={pendingReviews} tone={pendingReviews ? "red" : undefined} sub={`보완 요청 ${reviews.filter((r) => r.status === "revision").length} · 승인 ${reviews.filter((r) => r.status === "approved").length}`} href="/admin7/reviews" />
        <StatCard label="수익 인증 (누적)" value={`${fmtNum(posts.reduce((n, p) => n + (p.income ?? 0), 0))}원`} tone="success" href="/admin7/posts" />
        <StatCard label="앱 다운로드" value={downloadCount} tone="red" sub={milestone.label} href="/admin7/waitlist" />
        <StatCard label="출시 알림 대기자 · 초대 가입" value={`${waitlist.length} · ${inviteCodes.reduce((n, c) => n + c.uses.length, 0)}`} sub="랜딩 신청 · 초대 코드로 가입" href="/admin7/waitlist" />
        <StatCard label="North Star · 이달 소득 회원" value={new Set(pointLogs.filter((l) => l.amount > 0 && new Date(l.createdAt).getMonth() === month).map((l) => l.userId)).size} sub="포인트·보상을 받은 회원 수" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <section className="bg-paper rounded-xl shadow-soft">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline"><h2 className="text-[15px] font-bold">검수 대기 캠페인</h2><Link href="/admin7/campaigns" className="text-[12px] text-ink-3 hover:text-red">전체 ›</Link></div>
          <ul className="divide-y divide-hairline">
            {pending.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-ink-3">대기 중인 캠페인이 없어요</li>}
            {pending.map((c) => (
              <li key={c.id} className="px-4 py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1"><p className="text-[12px] font-bold text-red">{c.brand}</p><p className="text-[14px] font-semibold truncate">{c.title}</p><p className="num text-[11px] text-ink-3">{relTime(c.createdAt)} · 모집 {c.recruitCount}명 · {c.reward.desc}</p></div>
                <Link href="/admin7/campaigns"><Button size="sm" variant="ink">검수</Button></Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="bg-paper rounded-xl shadow-soft">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline"><h2 className="text-[15px] font-bold">미처리 신고</h2><Link href="/admin7/reports" className="text-[12px] text-ink-3 hover:text-red">전체 ›</Link></div>
          <ul className="divide-y divide-hairline">
            {openReports.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-ink-3">미처리 신고가 없어요</li>}
            {openReports.map((r) => (
              <li key={r.id} className="px-4 py-3 flex items-center gap-3">
                <Badge tone="outline">{{ post: "게시글", comment: "댓글", campaign: "캠페인", user: "회원" }[r.target]}</Badge>
                <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold truncate">{r.reason}</p><p className="num text-[11px] text-ink-3">{r.targetId} · {relTime(r.createdAt)}</p></div>
                <Link href="/admin7/reports"><Button size="sm" variant="secondary">처리</Button></Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <section className="bg-paper rounded-xl shadow-soft">
          <div className="px-4 py-3 border-b border-hairline"><h2 className="text-[15px] font-bold">캠페인 상태 분포</h2></div>
          <ul className="p-4 grid grid-cols-2 gap-2">
            {(Object.keys(CAMPAIGN_STATUS) as (keyof typeof CAMPAIGN_STATUS)[]).map((k) => <li key={k} className="flex items-center justify-between rounded-md bg-inset px-3 py-2"><Badge tone={CAMPAIGN_STATUS[k].tone}>{CAMPAIGN_STATUS[k].label}</Badge><span className="num text-[14px] font-bold">{campaigns.filter((c) => c.status === k).length}</span></li>)}
          </ul>
        </section>
        <section className="bg-paper rounded-xl shadow-soft">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline"><h2 className="text-[15px] font-bold">최근 운영 로그</h2><Link href="/admin7/logs" className="text-[12px] text-ink-3 hover:text-red">전체 ›</Link></div>
          <ul className="divide-y divide-hairline">
            {auditLogs.slice(0, 6).map((l) => <li key={l.id} className="px-4 py-2.5 flex items-center gap-3 text-[13px]"><span className="font-semibold shrink-0">{l.action}</span><span className="text-ink-2 truncate flex-1">{l.target}{l.reason && ` · ${l.reason}`}</span><span className="num text-[11px] text-ink-3 shrink-0">{relTime(l.createdAt)}</span></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
