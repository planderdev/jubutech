"use client";
import { useMemo } from "react";
import { DEMO_MEMBERS, brandRatingSummary } from "@jubutech/shared";
import { useRules, useStore } from "@/lib/store";
import { AdminHeader, AdminTable, askReason } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { relTime } from "@/lib/utils";

const YES_NO = { yes: "예", no: "아니요", na: "해당 없음" } as const;

/** 광고주 평가 (기획안 1-2 상호 평가) — 운영자는 작성자까지 본다. 광고주·회원에게는 통계로만 보인다. 건수 기준은 `rating.minVisible` */
export default function AdminRatings() {
  const { brandRatings, adminSetRatingStatus } = useStore();
  const rules = useRules();
  const brands = useMemo(() => [...new Set(brandRatings.map((r) => r.brand))].map((brand) => ({ id: brand, brand, ...brandRatingSummary(brandRatings, brand, rules) })), [brandRatings, rules]);
  const rows = brandRatings.map((r) => ({ ...r, nickname: DEMO_MEMBERS.find((m) => m.id === r.memberId)?.nickname ?? r.memberId }));
  return (
    <div>
      <AdminHeader title="광고주 평가" count={brandRatings.length} description={`주부가 체험 뒤 남긴 평가입니다. ${rules.rating.minVisible}건이 쌓이기 전에는 앱·광고주 화면에 통계도 보이지 않습니다.`} />
      <p className="label text-ink-3 mb-2">광고주별</p>
      <AdminTable
        rows={brands}
        searchKeys={["brand"]}
        columns={[
          { key: "brand", label: "광고주", render: (b) => <span className="font-semibold">{b.brand}</span> },
          { key: "count", label: "평가", className: "num", render: (b) => `${b.count}건` },
          { key: "average", label: "평균", className: "num", render: (b) => (b.visible ? `★ ${b.average}` : <span className="text-ink-3">공개 전</span>) },
          { key: "matchRate", label: "안내 일치", className: "num", render: (b) => (b.matchRate !== null ? `${b.matchRate}%` : "—") },
          { key: "onTimeRate", label: "제때 발송", className: "num", render: (b) => (b.onTimeRate !== null ? `${b.onTimeRate}%` : "—") },
        ]}
      />
      <p className="label text-ink-3 mt-6 mb-2">평가 목록</p>
      <AdminTable
        rows={rows}
        searchKeys={["brand", "nickname", "comment"]}
        empty="아직 평가가 없어요"
        columns={[
          { key: "brand", label: "광고주", render: (r) => <span className="font-semibold">{r.brand}</span> },
          { key: "nickname", label: "작성자", render: (r) => r.nickname },
          { key: "stars", label: "별점", className: "num", render: (r) => "★".repeat(r.stars) },
          { key: "shippedOnTime", label: "제때", render: (r) => YES_NO[r.shippedOnTime] },
          { key: "matchedGuide", label: "안내 일치", render: (r) => YES_NO[r.matchedGuide] },
          { key: "comment", label: "의견", render: (r) => <div className="max-w-[260px] text-[12px]">{r.comment ?? <span className="text-ink-3">없음</span>}{r.status === "hidden" && <Badge tone="mute">숨김</Badge>}</div> },
          { key: "createdAt", label: "작성", className: "num text-ink-3", render: (r) => relTime(r.createdAt) },
          { key: "actions", label: "", className: "text-right", render: (r) => (r.status === "visible" ? <Button size="sm" variant="ghost" onClick={() => { const why = askReason("숨김 사유"); if (why !== null) adminSetRatingStatus(r.id, "hidden", why); }}>숨김</Button> : <Button size="sm" variant="secondary" onClick={() => adminSetRatingStatus(r.id, "visible")}>복구</Button>) },
        ]}
      />
    </div>
  );
}
