"use client";
import { useState } from "react";
import { DEFAULT_RULES, DEMO_APPLICATIONS, DEMO_CAMPAIGNS, DEMO_MEMBERS, REVIEW_CHECK_LABEL, REVIEW_STATUS, checkReview, missionWithDefaults, reviewCheckSummary, reviewDueLabel, type Review, type ReviewStatus } from "@jubutech/shared";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable, StatCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { Tabs } from "@/components/ui/tabs";
import { relTime } from "@/lib/utils";

const STATUS_KEYS = ["pending", "revision", "approved", "rejected"] as const;

/**
 * 후기 검수 — PHP `/admin/reviews` + 상세(`adminDetail('reviews')`) 를 한 화면에:
 * 목록(상태 탭·자동 검사 요약) → 드로어에 제출 원문과 미션 카드를 나란히, 자동 검사 항목, 검수 결과(승인·보완·반려 + 사유 + 별점).
 */
export default function AdminReviews() {
  const { reviews, adminDecideReview } = useStore();
  const [tab, setTab] = useState<"all" | ReviewStatus>("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = reviews
    .filter((r) => tab === "all" || r.status === tab)
    .map((r) => {
      const app = DEMO_APPLICATIONS.find((a) => a.id === r.applicationId);
      const c = app ? DEMO_CAMPAIGNS.find((x) => x.id === app.campaignId) : undefined;
      const m = app ? DEMO_MEMBERS.find((x) => x.id === app.memberId) : undefined;
      return { ...r, campaignTitle: c?.title ?? "(캠페인 없음)", brand: c?.brand ?? "", nickname: m?.nickname ?? app?.answers.nickname ?? app?.memberId ?? "", summary: reviewCheckSummary(r.check).text, dueAt: c?.reviewDueAt ?? "" };
    });
  const open = reviews.find((r) => r.id === openId) ?? null;
  const count = (k: ReviewStatus) => reviews.filter((r) => r.status === k).length;

  return (
    <div>
      <AdminHeader title="후기 검수" count={count("pending")} description="제출된 후기와 미션 카드를 나란히 보고 승인·보완 요청·반려를 기록합니다. 자동 검사는 참고용이고 확정은 운영자가 합니다. 승인 시 리워드 적립은 지갑(W4)과 함께 연결됩니다." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="검토 대기" value={count("pending")} tone={count("pending") ? "red" : undefined} />
        <StatCard label="보완 요청" value={count("revision")} />
        <StatCard label="승인" value={count("approved")} tone="success" />
        <StatCard label="반려" value={count("rejected")} />
      </div>
      <Tabs className="mb-3" active={tab} onChange={(k) => setTab(k as typeof tab)} items={[{ key: "all", label: "전체", count: reviews.length }, ...STATUS_KEYS.map((k) => ({ key: k, label: REVIEW_STATUS[k].label, count: count(k) }))]} />
      <AdminTable
        rows={rows}
        searchKeys={["campaignTitle", "brand", "nickname", "content", "url"]}
        empty="이 상태의 후기가 없어요"
        columns={[
          { key: "campaignTitle", label: "체험단", render: (r) => <div className="max-w-[260px]"><p className="text-[12px] font-bold text-red">{r.brand}</p><button type="button" onClick={() => setOpenId(r.id)} className="font-semibold hover:text-red line-clamp-1 text-left">{r.campaignTitle}</button></div> },
          { key: "nickname", label: "회원", render: (r) => <p className="font-semibold">{r.nickname}</p> },
          { key: "summary", label: "자동 검사", render: (r) => <Badge tone={!r.check ? "mute" : r.check.passed ? "sage" : "butter"}>{r.summary}</Badge> },
          { key: "status", label: "상태", render: (r) => <Badge tone={REVIEW_STATUS[r.status].tone}>{REVIEW_STATUS[r.status].label}</Badge> },
          { key: "url", label: "제출물", render: (r) => <div className="text-[12px]">{r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="text-red underline">링크</a> : <span className="text-ink-3">앱 작성</span>}{r.content ? <span className="text-ink-3"> · {r.content.length}자</span> : null}<span className="text-ink-3"> · 사진 {r.photoCount}장</span></div> },
          { key: "submittedAt", label: "제출", className: "num text-ink-3", render: (r) => <span title={r.dueAt ? `기한 ${reviewDueLabel(r.dueAt, r.submittedAt)}` : undefined}>{relTime(r.submittedAt)}</span> },
          { key: "actions", label: "", className: "text-right", render: (r) => <Button size="sm" variant={r.status === "pending" ? "ink" : "secondary"} onClick={() => setOpenId(r.id)}>검수</Button> },
        ]}
      />
      <ReviewDrawer review={open} onClose={() => setOpenId(null)} decide={adminDecideReview} />
    </div>
  );
}

function ReviewDrawer({ review: r, onClose, decide }: { review: Review | null; onClose: () => void; decide: (id: string, status: ReviewStatus, feedback?: string, rating?: number) => { ok: boolean; message: string } }) {
  const [status, setStatus] = useState<ReviewStatus>("approved");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("5");
  const [notice, setNotice] = useState<NoticeState>(null);
  const [key, setKey] = useState<string | null>(null);
  if (r && key !== r.id) {
    setKey(r.id);
    setStatus(r.status === "pending" ? "approved" : r.status);
    setFeedback(r.feedback ?? "");
    setRating(String(r.rating ?? 5));
    setNotice(null);
  }
  const app = r ? DEMO_APPLICATIONS.find((a) => a.id === r.applicationId) : undefined;
  const c = app ? DEMO_CAMPAIGNS.find((x) => x.id === app.campaignId) : undefined;
  const m = app ? DEMO_MEMBERS.find((x) => x.id === app.memberId) : undefined;
  const mission = c ? missionWithDefaults(DEFAULT_RULES, c.mission) : null;
  // 저장된 검사 결과가 없으면(기존 데모 후기) 지금 기준으로 다시 검사해 참고로 보여 준다
  const check = r?.check ?? (r && mission ? checkReview(mission, { url: r.url, content: r.content, photoCount: r.photoCount }) : undefined);
  const final = r?.status === "approved" || r?.status === "rejected";

  return (
    <Drawer open={!!r} onClose={onClose} title="후기 검수" width={560}>
      {r && c && mission ? (
        <>
          <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
            <div><p className="text-[12px] font-bold text-red">{c.brand}</p><h2 className="text-[16px] font-bold">{c.title}</h2></div>
            <Badge tone={REVIEW_STATUS[r.status].tone}>{REVIEW_STATUS[r.status].label}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-[13px]">
            <section className="grid md:grid-cols-2 gap-4">
              <div className="bg-inset rounded-lg p-3">
                <p className="label text-ink-3 mb-1.5">제출 후기 · {m?.nickname ?? app?.answers.nickname} · {new Date(r.submittedAt).toLocaleString("ko-KR")}</p>
                {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="inline-block mb-2 text-red underline break-all">{r.url}</a>}
                <p className="whitespace-pre-wrap leading-relaxed">{r.content || <span className="text-ink-3">본문 없음 (링크 제출)</span>}</p>
                <p className="mt-2 text-ink-3">사진 {r.photoCount}장</p>
              </div>
              <div className="rounded-lg border border-hairline p-3">
                <p className="label text-ink-3 mb-1.5">미션 카드 · 기한 {new Date(c.reviewDueAt).toLocaleDateString("ko-KR")} ({reviewDueLabel(c.reviewDueAt, r.submittedAt)} 제출)</p>
                <ul className="list-disc pl-4 space-y-1">
                  {mission.photoCount > 0 && <li>사진 {mission.photoCount}장 이상</li>}
                  {mission.minChars > 0 && <li>{mission.minChars}자 이상</li>}
                  {mission.requiredKeywords.length > 0 && <li>키워드: {mission.requiredKeywords.join(", ")}</li>}
                  {mission.hashtags.length > 0 && <li>해시태그: {mission.hashtags.map((h) => `#${h}`).join(" ")}</li>}
                  {c.missions.map((t) => <li key={t} className="text-ink-2">{t}</li>)}
                </ul>
              </div>
            </section>
            {check && (
              <section>
                <p className="label text-ink-3 mb-1.5">자동 검사 · {reviewCheckSummary(check).text}{!r.check && " (지금 기준으로 재검사)"}</p>
                <ul className="divide-y divide-hairline rounded-lg border border-hairline">
                  {check.items.map((i) => (
                    <li key={i.key} className="flex items-center gap-3 px-3 py-2">
                      <Badge tone={i.skipped ? "mute" : i.ok ? "sage" : "butter"}>{i.skipped ? "확인 필요" : i.ok ? "통과" : "미달"}</Badge>
                      <span className="w-14 font-semibold text-ink-2">{REVIEW_CHECK_LABEL[i.key]}</span>
                      <span className="flex-1">{i.message}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const res = decide(r.id, status, feedback, status === "approved" ? Number(rating) : undefined); setNotice({ ok: res.ok, text: res.message }); }}>
              <p className="label text-ink-3">검수 결과</p>
              <div className="grid sm:grid-cols-[1fr_120px] gap-3">
                <Field label="검수 상태"><Select value={status} onChange={(e) => setStatus(e.target.value as ReviewStatus)}>{STATUS_KEYS.map((k) => <option key={k} value={k}>{REVIEW_STATUS[k].label}</option>)}</Select></Field>
                <Field label="별점" hint="승인 시"><Select value={rating} disabled={status !== "approved"} onChange={(e) => setRating(e.target.value)}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} {n}</option>)}</Select></Field>
              </div>
              <Field label="사용자에게 전달할 보완·반려 사유" required={status === "revision" || status === "rejected"}><Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder={status === "revision" ? "예: 사진 2장을 더 올려 주세요." : status === "rejected" ? "반려 사유" : "승인 메모 (선택)"} /></Field>
              <Notice notice={notice} />
              {final && <p className="text-[12px] text-ink-3">확정된 검수를 다시 바꾸면 사용자에게 보이는 결과가 달라집니다. 제출물과 이력을 확인해 주세요.</p>}
              <div className="flex items-center gap-2"><Button type="submit">검토 결과 저장</Button><span className="text-[12px] text-ink-3">보완·반려 시 사유 필수 · 별점은 생활력(W5)에 반영</span></div>
            </form>
          </div>
        </>
      ) : null}
    </Drawer>
  );
}
