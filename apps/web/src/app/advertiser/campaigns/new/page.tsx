"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, useMe } from "@/lib/store";
import { CAMPAIGN_CATEGORIES, CHANNELS, type CampaignCategory, type ChannelType } from "@/lib/types";
import { PageHeader } from "@/components/feature/page-header";
import { RoleGate } from "@/components/feature/role-gate";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Chip, ChipRow } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { LineIcon, type LineIconName } from "@/components/ui/line-icon";
import { cn } from "@/lib/utils";

const STEPS = ["기본 정보", "채널·미션", "일정·모집", "보상·검토"];
const ICONS: LineIconName[] = ["noodle", "chef", "basket", "baby", "paw", "home", "study", "gift", "card", "bag", "cat", "coin"];
const day = (o: number) => { const t = new Date(); t.setDate(t.getDate() + o); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`; };

function Builder() {
  const router = useRouter();
  const me = useMe();
  const createCampaign = useStore((s) => s.createCampaign);
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [f, setF] = useState({
    brand: me?.brand ?? "", title: "", category: "food" as CampaignCategory, thumbIcon: "noodle" as LineIconName, region: "",
    channels: ["instagram"] as ChannelType[], missions: ["", ""], requirements: [""], keywords: "",
    recruitStart: day(0), recruitEnd: day(7), announceDate: day(9), missionStart: day(10), missionEnd: day(24), recruitCount: 10,
    rewardType: "product" as "product" | "point" | "cash", rewardValue: 30000, rewardDesc: "",
  });
  const up = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const listUp = (k: "missions" | "requirements", i: number, v: string) => setF((s) => ({ ...s, [k]: s[k].map((x, j) => (j === i ? v : x)) }));

  const validate = (): string | null => {
    if (step === 0) { if (!f.brand.trim()) return "브랜드명을 입력해 주세요."; if (f.title.trim().length < 6) return "캠페인 제목을 6자 이상 입력해 주세요."; }
    if (step === 1) { if (f.channels.length === 0) return "채널을 1개 이상 선택해 주세요."; if (!f.missions.some((m) => m.trim())) return "미션을 1개 이상 입력해 주세요."; }
    if (step === 2) { if (f.recruitEnd < f.recruitStart) return "모집 종료일이 시작일보다 빠릅니다."; if (f.announceDate < f.recruitEnd) return "선정 발표는 모집 종료 이후여야 해요."; if (f.recruitCount < 1) return "모집 인원을 입력해 주세요."; }
    if (step === 3) { if (!f.rewardDesc.trim()) return "보상 설명을 입력해 주세요."; }
    return null;
  };
  const next = () => { const err = validate(); if (err) return setNotice({ ok: false, text: err }); setNotice(null); setStep((s) => s + 1); };
  const submit = (status: "pending" | "open") => {
    const err = validate(); if (err) return setNotice({ ok: false, text: err });
    const id = createCampaign({
      brand: f.brand.trim(), title: f.title.trim(), category: f.category, thumbIcon: f.thumbIcon, region: f.region || undefined,
      channels: f.channels, missions: f.missions.filter((m) => m.trim()), requirements: f.requirements.filter((r) => r.trim()), keywords: f.keywords.split(/[,\s#]+/).filter(Boolean),
      recruitStart: f.recruitStart, recruitEnd: f.recruitEnd, announceDate: f.announceDate, missionStart: f.missionStart, missionEnd: f.missionEnd, recruitCount: Number(f.recruitCount),
      reward: { type: f.rewardType, value: Number(f.rewardValue), desc: f.rewardDesc.trim() }, status,
    });
    router.push(`/advertiser/campaigns/${id}`);
  };

  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="New Campaign" title="캠페인 열기" description="4단계, 5분. 등록 후 주부테크 검수를 거쳐 회원에게 노출됩니다." />
      <ol className="grid grid-cols-4 gap-1 mb-6">
        {STEPS.map((s, i) => (
          <li key={s} className={cn("border-t-2 pt-2", i <= step ? "border-red" : "border-hairline")}><p className={cn("label", i === step ? "text-red" : "text-ink-3")}>0{i + 1}</p><p className={cn("text-[13px] font-semibold", i > step && "text-ink-3")}>{s}</p></li>
        ))}
      </ol>
      <div className="bg-paper rounded-xl shadow-card p-5 md:p-7 space-y-5">
        {step === 0 && (
          <>
            <Field label="브랜드·상호" required><Input value={f.brand} onChange={(e) => up("brand", e.target.value)} placeholder="그린테이블" /></Field>
            <Field label="캠페인 제목" required hint="제품 + 채널 + 형식"><Input value={f.title} onChange={(e) => up("title", e.target.value)} placeholder="저염 밀키트 3종 인스타 릴스 체험단" maxLength={60} /></Field>
            <Field label="카테고리" required><Select value={f.category} onChange={(e) => up("category", e.target.value as CampaignCategory)}>{CAMPAIGN_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</Select></Field>
            <div>
              <p className="label text-ink-2 mb-2">대표 일러스트 <span className="text-ink-3 normal-case tracking-normal">(이미지 업로드는 Supabase 연결 후)</span></p>
              <div className="flex flex-wrap gap-2">{ICONS.map((ic) => <button key={ic} type="button" onClick={() => up("thumbIcon", ic)} className={cn("h-12 w-12 rounded-sm border flex items-center justify-center text-red", f.thumbIcon === ic ? "border-red bg-red-100" : "border-hairline")} aria-label={ic}><LineIcon name={ic} className="h-6 w-6" /></button>)}</div>
            </div>
            <Field label="지역 (매장 방문형만)"><Input value={f.region} onChange={(e) => up("region", e.target.value)} placeholder="경기 성남" /></Field>
          </>
        )}
        {step === 1 && (
          <>
            <div>
              <p className="label text-ink-2 mb-2">채널 <span className="text-red">*</span></p>
              <ChipRow>{CHANNELS.map((c) => <Chip key={c.key} active={f.channels.includes(c.key)} onClick={() => up("channels", f.channels.includes(c.key) ? f.channels.filter((x) => x !== c.key) : [...f.channels, c.key])}>{c.label}</Chip>)}</ChipRow>
            </div>
            <div>
              <p className="label text-ink-2 mb-2">미션 <span className="text-red">*</span></p>
              <div className="space-y-2">{f.missions.map((m, i) => <Input key={i} value={m} onChange={(e) => listUp("missions", i, e.target.value)} placeholder={i === 0 ? "30초 이상 릴스 1건 (조리 과정 포함)" : "해시태그 #브랜드 #주부테크체험단"} />)}</div>
              <button type="button" onClick={() => up("missions", [...f.missions, ""])} className="label text-red mt-2">+ 미션 추가</button>
            </div>
            <div>
              <p className="label text-ink-2 mb-2">신청 조건</p>
              <div className="space-y-2">{f.requirements.map((m, i) => <Input key={i} value={m} onChange={(e) => listUp("requirements", i, e.target.value)} placeholder="팔로워 500명 이상 공개 계정" />)}</div>
              <button type="button" onClick={() => up("requirements", [...f.requirements, ""])} className="label text-red mt-2">+ 조건 추가</button>
            </div>
            <Field label="키워드" hint="쉼표 구분"><Input value={f.keywords} onChange={(e) => up("keywords", e.target.value)} placeholder="밀키트, 저염, 저녁준비" /></Field>
          </>
        )}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="모집 시작" required><Input type="date" value={f.recruitStart} onChange={(e) => up("recruitStart", e.target.value)} className="num" /></Field>
            <Field label="모집 마감" required><Input type="date" value={f.recruitEnd} onChange={(e) => up("recruitEnd", e.target.value)} className="num" /></Field>
            <Field label="선정 발표" required><Input type="date" value={f.announceDate} onChange={(e) => up("announceDate", e.target.value)} className="num" /></Field>
            <Field label="모집 인원" required><Input type="number" min={1} value={f.recruitCount} onChange={(e) => up("recruitCount", Number(e.target.value))} className="num" /></Field>
            <Field label="미션 시작"><Input type="date" value={f.missionStart} onChange={(e) => up("missionStart", e.target.value)} className="num" /></Field>
            <Field label="미션 마감"><Input type="date" value={f.missionEnd} onChange={(e) => up("missionEnd", e.target.value)} className="num" /></Field>
          </div>
        )}
        {step === 3 && (
          <>
            <div>
              <p className="label text-ink-2 mb-2">보상 유형 <span className="text-red">*</span></p>
              <ChipRow>{([["product", "제품 제공"], ["point", "포인트"], ["cash", "활동비(현금)"]] as const).map(([k, l]) => <Chip key={k} active={f.rewardType === k} onClick={() => up("rewardType", k)}>{l}</Chip>)}</ChipRow>
            </div>
            <Field label={f.rewardType === "product" ? "제품 정가 (원)" : f.rewardType === "point" ? "지급 포인트 (P)" : "활동비 (원)"} required><Input type="number" min={0} step={1000} value={f.rewardValue} onChange={(e) => up("rewardValue", Number(e.target.value))} className="num" /></Field>
            <Field label="보상 설명" required hint="회원에게 보이는 문구"><Textarea value={f.rewardDesc} onChange={(e) => up("rewardDesc", e.target.value)} placeholder="밀키트 3종(정가 42,000원) + 30,000P" className="min-h-[72px]" /></Field>
            <div className="rounded-xl bg-inset p-4 text-[13px] text-ink-2 leading-relaxed">
              <p className="label text-ink mb-1">검수 기준</p>선입금·보증금 요구 금지 · 결과물 소유권 명시 · 자녀 개인정보 요구 금지 · 보상 조건 명확성. 검수는 영업일 기준 1일 이내 완료됩니다.
            </div>
          </>
        )}
        <Notice notice={notice} />
        <div className="flex justify-between pt-2 border-t border-dashed border-hairline">
          <Button type="button" variant="ghost" onClick={() => (step === 0 ? router.back() : setStep(step - 1))}>{step === 0 ? "취소" : "이전"}</Button>
          {step < 3 ? <Button type="button" onClick={next}>다음</Button> : (
            <div className="flex gap-2"><Button type="button" variant="secondary" onClick={() => submit("pending")}>검수 요청</Button><Button type="button" onClick={() => submit("open")}>바로 게시 (데모)</Button></div>
          )}
        </div>
      </div>
    </div>
  );
}
export default function NewCampaignPage() {
  return <RoleGate allow={["advertiser", "admin"]}><Builder /></RoleGate>;
}
