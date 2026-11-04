"use client";
import { useState } from "react";
import { DEFAULT_RULES, DEMO_APPLICATIONS, DEMO_CAMPAIGNS, DEMO_MEMBERS, REVIEW_CHECK_LABEL, REVIEW_STATUS, checkReview, missionWithDefaults, reviewCheckSummary, reviewDueLabel, type Review, type ReviewStatus } from "@jubutech/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Notice, type NoticeState } from "@/components/ui/notice";

const STATUS_KEYS = ["pending", "revision", "approved", "rejected"] as const;

/**
 * 후기 검수 드로어 — 제출 원문과 미션 카드를 나란히, 자동 검사 항목, 검수 결과(승인·보완·반려 + 사유 + 별점).
 * 관리자(`/admin7/reviews`)와 광고주(`/advertiser/reviews`)가 같이 쓴다.
 */
export function ReviewDrawer({ review: r, onClose, decide }: { review: Review | null; onClose: () => void; decide: (id: string, status: ReviewStatus, feedback?: string, rating?: number) => { ok: boolean; message: string } }) {
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
