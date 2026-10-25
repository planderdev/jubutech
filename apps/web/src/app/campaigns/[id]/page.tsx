"use client";
import Link from "next/link";
import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useStore, useMe } from "@/lib/store";
import { APPLICATION_STATUS, CAMPAIGN_CATEGORIES, CAMPAIGN_STATUS, CHANNELS, type ChannelType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { LineIcon, type LineIconName } from "@/components/ui/line-icon";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { CampaignCard, IllustTile } from "@/components/feature/campaign-card";
import { dday, fmtNum, fmtWon } from "@/lib/utils";

const fmtD = (s: string) => s.slice(5).replace("-", ".");

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const c = useStore((s) => s.campaigns.find((x) => x.id === id));
  const me = useMe();
  const role = useStore((s) => s.role);
  const myApp = useStore((s) => s.applications.find((a) => a.campaignId === id && a.userId === s.userId && a.status !== "cancelled"));
  const { apply, cancelApplication, submitMission } = useStore();
  const others = useStore((s) => s.campaigns.filter((x) => x.status === "open" && x.id !== id).slice(0, 4));
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<ChannelType>(c?.channels[0] ?? "instagram");
  const [url, setUrl] = useState(me?.channels?.[0]?.url ?? "");
  const [msg, setMsg] = useState("");
  const [subUrl, setSubUrl] = useState("");
  const [notice, setNotice] = useState<NoticeState>(null);
  if (!c) notFound();
  const st = CAMPAIGN_STATUS[c.status];
  const cat = CAMPAIGN_CATEGORIES.find((x) => x.key === c.category);
  const needsUrl = !["survey", "receipt"].includes(channel);

  const doApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (needsUrl && !/^https?:\/\//.test(url)) return setNotice({ ok: false, text: "채널 URL을 https://부터 입력해 주세요." });
    const r = apply({ campaignId: c.id, channel, channelUrl: url, message: msg.trim() });
    setNotice({ ok: r.ok, text: r.message });
    if (r.ok) setOpen(false);
  };

  return (
    <div className="px-4 md:px-5">
      <nav className="label text-ink-3 pt-6"><Link href="/campaigns" className="hover:text-red">체험단</Link> / {cat?.label}</nav>
      <div className="mt-4 grid gap-8">
        <div className=" space-y-6">
          <div className="bg-paper rounded-xl shadow-card overflow-hidden">
            <div className="relative p-4 pb-0">
              <IllustTile icon={c.thumbIcon as LineIconName} size="lg" />
              <div className="absolute left-7 top-7 flex gap-1.5">{c.channels.map((ch) => <Badge key={ch} tone="outline">{CHANNELS.find((x) => x.key === ch)?.label}</Badge>)}</div>
              {c.status === "open" && <span className="absolute right-7 top-7 num text-[12px] font-bold text-paper bg-red rounded-full px-2.5 py-1">{dday(c.recruitEnd)}</span>}
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 flex-wrap"><span className="text-[13px] font-bold text-red">{c.brand}</span><Badge tone={st.tone}>{st.label}</Badge><Badge tone="outline">{cat?.label}</Badge>{c.region && <Badge tone="mute">{c.region}</Badge>}{c.keywords.map((k) => <span key={k} className="text-[11px] text-ink-3">#{k}</span>)}</div>
              <h1 className="display text-[24px] md:text-[30px] mt-3">{c.title}</h1>
              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 bg-inset rounded-xl divide-x divide-paper">
                {[["보상", c.reward.type === "product" ? "제품 제공" : c.reward.type === "point" ? `${fmtNum(c.reward.value)}P` : fmtWon(c.reward.value)], ["모집 인원", `${c.recruitCount}명`], ["신청", `${c.applicantIds.length}명`], ["경쟁률", `${(c.applicantIds.length / c.recruitCount).toFixed(1)} : 1`]].map(([k, v]) => (
                  <div key={k} className="p-3 text-center"><p className="label text-ink-3">{k}</p><p className="num text-[16px] font-semibold mt-1">{v}</p></div>
                ))}
              </div>
              <p className="mt-4 text-[15px] font-semibold text-red">{c.reward.desc}</p>
            </div>
          </div>

          <section className="bg-paper rounded-xl shadow-soft p-6 md:p-8">
            <p className="label text-ink-3 mb-4">일정</p>
            <ol className="relative grid md:grid-cols-4 gap-4">
              {[["모집", `${fmtD(c.recruitStart)} ~ ${fmtD(c.recruitEnd)}`], ["선정 발표", fmtD(c.announceDate)], ["미션 진행", `${fmtD(c.missionStart)} ~ ${fmtD(c.missionEnd)}`], ["보상 지급", "검수 후 3일 내"]].map(([k, v], i) => (
                <li key={k} className="flex md:flex-col gap-3 md:gap-2">
                  <span className="h-7 w-7 rounded-full bg-red text-paper num text-[12px] font-bold inline-flex items-center justify-center shrink-0">{i + 1}</span>
                  <div><p className="text-[13px] font-semibold">{k}</p><p className="num text-[12px] text-ink-2">{v}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <section className="bg-paper rounded-xl shadow-soft p-6 md:p-8 grid gap-6">
            <div>
              <p className="label text-ink-3 mb-3">미션</p>
              <ul className="space-y-2">{c.missions.map((m) => <li key={m} className="flex gap-2 text-[14px]"><LineIcon name="check" className="h-4 w-4 text-red mt-0.5" />{m}</li>)}</ul>
            </div>
            <div>
              <p className="label text-ink-3 mb-3">신청 조건</p>
              <ul className="space-y-2">{c.requirements.map((m) => <li key={m} className="flex gap-2 text-[14px]"><span className="h-1.5 w-1.5 rounded-full bg-ink mt-2 shrink-0" />{m}</li>)}</ul>
            </div>
          </section>
          <p className="text-[12px] text-ink-3 leading-relaxed">[체험단] 본 캠페인은 광고주로부터 제품 또는 보상을 제공받는 광고·협찬 활동입니다. 게시물에는 경제적 대가 표기가 필요합니다. 선입금·개인정보 과다 요구 등 이상 징후는 신고해 주세요.</p>
        </div>

        <aside className="">
          <div className=" space-y-4">
            <div className="bg-paper rounded-xl shadow-card p-5 md:p-6">
              {myApp ? (
                <div>
                  <div className="flex items-center justify-between"><p className="label text-ink-3">내 응모 상태</p><Badge tone={APPLICATION_STATUS[myApp.status].tone}>{APPLICATION_STATUS[myApp.status].label}</Badge></div>
                  <p className="text-[14px] text-ink-2 mt-3">
                    {myApp.status === "pending" && `${fmtD(c.announceDate)} 선정 발표 예정이에요. 결과는 알림으로 보내드려요.`}
                    {myApp.status === "selected" && `축하해요! ${fmtD(c.missionEnd)}까지 미션을 완료하고 URL을 제출해 주세요.`}
                    {myApp.status === "submitted" && "광고주가 검수 중이에요. 승인되면 보상이 지급돼요."}
                    {myApp.status === "completed" && "미션 완료! 보상이 지급되었어요."}
                    {myApp.status === "rejected" && "이번엔 함께하지 못했어요. 다른 캠페인에 도전해 보세요."}
                  </p>
                  {myApp.status === "selected" && (
                    <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); if (!/^https?:\/\//.test(subUrl)) return setNotice({ ok: false, text: "게시물 URL을 입력해 주세요." }); submitMission(myApp.id, subUrl); setNotice({ ok: true, text: "미션을 제출했어요. 검수 후 보상이 지급돼요." }); }}>
                      <Field label="게시물 URL" required><Input value={subUrl} onChange={(e) => setSubUrl(e.target.value)} placeholder="https://" /></Field>
                      <Button full type="submit">미션 제출</Button>
                    </form>
                  )}
                  {myApp.status === "pending" && <Button full variant="ghost" className="mt-4" onClick={() => { cancelApplication(myApp.id); setNotice({ ok: true, text: "응모를 취소했어요." }); }}>응모 취소</Button>}
                  <Notice notice={notice} className="mt-3" />
                </div>
              ) : c.status !== "open" ? (
                <div><p className="display text-[18px]">모집이 끝났어요</p><p className="text-[13px] text-ink-2 mt-1">비슷한 캠페인을 아래에서 확인해 보세요.</p></div>
              ) : !me || role === "advertiser" ? (
                <div><p className="display text-[18px]">로그인하고 응모하기</p><p className="text-[13px] text-ink-2 mt-1">회원이면 3초 만에 응모할 수 있어요.</p><Link href="/login" className="block mt-4"><Button full>로그인</Button></Link></div>
              ) : !open ? (
                <div>
                  <p className="display text-[18px]">{c.reward.desc}</p>
                  <p className="num text-[13px] text-ink-2 mt-1">모집 {c.recruitCount}명 · 신청 {c.applicantIds.length}명 · {dday(c.recruitEnd)}</p>
                  <Button full size="lg" className="mt-4" onClick={() => setOpen(true)}>응모하기</Button>
                  <Notice notice={notice} className="mt-3" />
                </div>
              ) : (
                <form onSubmit={doApply} className="space-y-4">
                  <p className="display text-[18px]">응모 정보</p>
                  <Field label="활동 채널" required>
                    <Select value={channel} onChange={(e) => setChannel(e.target.value as ChannelType)}>{c.channels.map((ch) => <option key={ch} value={ch}>{CHANNELS.find((x) => x.key === ch)?.label}</option>)}</Select>
                  </Field>
                  {needsUrl && <Field label="채널 URL" required hint="공개 계정"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://instagram.com/…" /></Field>}
                  <Field label="한마디" hint="선정에 도움이 돼요"><Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="왜 이 제품에 진심인지, 어떤 콘텐츠를 만들지 짧게!" className="min-h-[90px]" /></Field>
                  <Notice notice={notice} />
                  <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>취소</Button><Button type="submit" full>응모 완료</Button></div>
                </form>
              )}
            </div>
            <div className="bg-inset rounded-xl p-4 text-[12px] text-ink-2 leading-relaxed">
              <p className="label text-ink mb-1">광고주</p>{c.brand} · 주부테크 검수 통과 · 정산 이력 정상
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-12">
        <p className="label text-ink-3 mb-3">함께 보면 좋은 캠페인</p>
        <div className="grid grid-cols-2 gap-3">{others.map((o) => <CampaignCard key={o.id} c={o} />)}</div>
      </section>
    </div>
  );
}
