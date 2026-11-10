/**
 * DB 행 ↔ 앱 객체 변환 (1단계 W8 준비). 앱 화면은 `DEMO_*` 모양 객체를 쓰고, DB 는 0001~0004 스키마를 쓴다. 둘 사이는 이 파일만 안다.
 * 시드(`scripts/gen-seed.ts`)와 데이터 어댑터가 같은 함수를 쓰므로, 시드가 왕복 검증을 통과하면 어댑터 변환도 맞다.
 */
import type { DemoApplication, DemoArticle, DemoCampaign, DemoCampaignCategory, DemoCampaignChannel, DemoCategory, DemoMember, DemoPoint, DemoSelectionStatus } from "./fixtures";
import type { CommunityTopic, DemoComment, DemoPost } from "./community";
import type { DemoJournal } from "./journal";
import type { BrandRating } from "./brand-rating";
import type { MissionCard, Review, TrustEvent } from "./types";

/** 데모 id("cp1")를 고정 UUID 로. 시드와 어댑터가 같은 값을 쓰게 한다. 6자 넘는 id 는 받지 않는다 */
export function demoUuid(id: string): string {
  const hex = Array.from(new TextEncoder().encode(id), (b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.length > 12) throw new Error(`demoUuid: id 가 너무 길어요 (${id})`);
  return `00000000-0000-4000-8000-${hex.padStart(12, "0")}`;
}
/** `demoUuid` 의 역. 데모 UUID 가 아니면 그대로 */
export function fromDemoUuid(uuid: string): string {
  const m = /^00000000-0000-4000-8000-([0-9a-f]{12})$/.exec(uuid);
  if (!m) return uuid;
  const bytes = m[1].replace(/^(00)+/, "").match(/../g) ?? [];
  return new TextDecoder().decode(new Uint8Array(bytes.map((h) => parseInt(h, 16))));
}

const KST = "+09:00";
/** timestamptz 문자열을 앱이 쓰는 KST ISO("2026-10-21T12:00:00+09:00")로 */
export function toKst(ts: string | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts);
  const k = new Date(d.getTime() + 9 * 3600000);
  return `${k.toISOString().slice(0, 19)}${KST}`;
}
const dateOnly = (iso: string) => toKst(iso).slice(0, 10);

/* ───────── 체험단 ───────── */
const CHANNEL_ENUM: Record<DemoCampaignChannel, string> = { 인스타그램: "instagram", 블로그: "blog", 유튜브: "youtube", 설문: "survey" };

export interface CampaignRow {
  id: string; advertiser_id: string; brand: string; title: string; category: string; channels: string[]; channel_label: string;
  reward_type: "product"; reward_value: number; reward_desc: string; benefit: string; benefit_value: number; recruit_count: number;
  recruit_start: string; recruit_end: string; announce_date: string; mission_end: string;
  recruitment_start_at: string; recruitment_end_at: string; announcement_at: string; review_due_at: string;
  missions: string[]; mission: MissionCard; questions: string[]; description: string; conditions: string; image: string; shipping: boolean;
  exposure_start_at: string; exposure_end_at: string; publication_status: DemoCampaign["publicationStatus"]; status: "open";
}
export function campaignToRow(c: DemoCampaign, advertiserId: string): CampaignRow {
  return {
    id: demoUuid(c.id), advertiser_id: advertiserId, brand: c.brand, title: c.title, category: c.categoryId, channels: [CHANNEL_ENUM[c.channel]], channel_label: c.channel,
    reward_type: "product", reward_value: c.benefitValue, reward_desc: c.benefit, benefit: c.benefit, benefit_value: c.benefitValue, recruit_count: c.capacity,
    recruit_start: dateOnly(c.recruitmentStartAt), recruit_end: dateOnly(c.recruitmentEndAt), announce_date: dateOnly(c.announcementAt), mission_end: dateOnly(c.reviewDueAt),
    recruitment_start_at: c.recruitmentStartAt, recruitment_end_at: c.recruitmentEndAt, announcement_at: c.announcementAt, review_due_at: c.reviewDueAt,
    missions: c.missions, mission: c.mission, questions: c.questions, description: c.description, conditions: c.conditions, image: c.image, shipping: c.shipping,
    exposure_start_at: c.exposureStartAt, exposure_end_at: c.exposureEndAt, publication_status: c.publicationStatus, status: "open",
  };
}
export function rowToCampaign(r: Omit<CampaignRow, "reward_type" | "status"> & Record<string, unknown>): DemoCampaign {
  return {
    id: fromDemoUuid(r.id), brand: r.brand, title: r.title, categoryId: r.category as DemoCampaignCategory, benefit: r.benefit, benefitValue: r.benefit_value,
    channel: r.channel_label as DemoCampaignChannel, capacity: r.recruit_count,
    recruitmentStartAt: toKst(r.recruitment_start_at), recruitmentEndAt: toKst(r.recruitment_end_at), announcementAt: toKst(r.announcement_at), reviewDueAt: toKst(r.review_due_at),
    missions: r.missions, mission: r.mission, questions: r.questions, description: r.description, conditions: r.conditions,
    publicationStatus: r.publication_status, image: r.image, shipping: r.shipping, exposureStartAt: toKst(r.exposure_start_at), exposureEndAt: toKst(r.exposure_end_at),
  };
}

/* ───────── 응모 ───────── */
const SELECTION_TO_DB: Record<DemoSelectionStatus, string> = { applied: "pending", selected: "selected", not_selected: "rejected", cancelled: "cancelled" };
const SELECTION_FROM_DB: Record<string, DemoSelectionStatus> = { pending: "applied", selected: "selected", submitted: "selected", completed: "selected", rejected: "not_selected", cancelled: "cancelled" };
const CHANNEL_FROM_LABEL = (label: string) => CHANNEL_ENUM[label as DemoCampaignChannel] ?? "blog";

export interface ApplicationRow { id: string; campaign_id: string; profile_id: string; channel: string; channel_url: string; message: string; status: string; answers: DemoApplication["answers"]; consent: DemoApplication["consentRecords"]; shipping: DemoApplication["shipping"]; created_at: string }
export function applicationToRow(a: DemoApplication, channelLabel: string): ApplicationRow {
  return { id: demoUuid(a.id), campaign_id: demoUuid(a.campaignId), profile_id: demoUuid(a.memberId), channel: CHANNEL_FROM_LABEL(channelLabel), channel_url: a.answers.channelUrl, message: a.answers.reason, status: SELECTION_TO_DB[a.selectionStatus], answers: a.answers, consent: a.consentRecords, shipping: a.shipping, created_at: a.appliedAt };
}
export function rowToApplication(r: ApplicationRow): DemoApplication {
  return { id: fromDemoUuid(r.id), campaignId: fromDemoUuid(r.campaign_id), memberId: fromDemoUuid(r.profile_id), answers: r.answers, consentRecords: r.consent, selectionStatus: SELECTION_FROM_DB[r.status] ?? "applied", appliedAt: toKst(r.created_at), shipping: r.shipping ?? null };
}

/* ───────── 후기 ───────── */
export interface ReviewRow { id: string; application_id: string; url: string | null; content: string | null; photo_count: number; check_result: Review["check"] | null; status: Review["status"]; feedback: string | null; rating: number | null; submitted_at: string; reviewed_at: string | null; reviewed_by: string | null }
export function reviewToRow(r: Review): ReviewRow {
  return { id: demoUuid(r.id), application_id: demoUuid(r.applicationId), url: r.url ?? null, content: r.content ?? null, photo_count: r.photoCount, check_result: r.check ?? null, status: r.status, feedback: r.feedback ?? null, rating: r.rating ?? null, submitted_at: r.submittedAt, reviewed_at: r.reviewedAt ?? null,
    // 검수자는 회원 프로필이어야 한다. 기기 데모의 "demo" 같은 자리 값은 비운다
    reviewed_by: r.reviewedBy && r.reviewedBy !== "demo" ? demoUuid(r.reviewedBy) : null };
}
export function rowToReview(r: ReviewRow): Review {
  const out: Review = { id: fromDemoUuid(r.id), applicationId: fromDemoUuid(r.application_id), photoCount: r.photo_count, status: r.status, submittedAt: toKst(r.submitted_at) };
  if (r.url) out.url = r.url;
  if (r.content) out.content = r.content;
  if (r.check_result) out.check = r.check_result;
  if (r.feedback) out.feedback = r.feedback;
  if (r.rating) out.rating = r.rating;
  if (r.reviewed_at) out.reviewedAt = toKst(r.reviewed_at);
  if (r.reviewed_by) out.reviewedBy = fromDemoUuid(r.reviewed_by);
  return out;
}

/* ───────── 회원 ───────── */
export interface ProfileRow { id: string; nickname: string; region: string | null; masked_contact: string; account_status: DemoMember["accountStatus"]; created_at: string }
export function memberToRow(m: DemoMember): ProfileRow {
  return { id: demoUuid(m.id), nickname: m.nickname, region: m.region ?? null, masked_contact: m.maskedContact, account_status: m.accountStatus, created_at: `${m.joinedAt}T00:00:00${KST}` };
}
export function rowToMember(r: ProfileRow): DemoMember {
  const m: DemoMember = { id: fromDemoUuid(r.id), nickname: r.nickname, maskedContact: r.masked_contact, joinedAt: dateOnly(r.created_at), accountStatus: r.account_status };
  if (r.region) m.region = r.region;
  return m;
}

/* ───────── 정보 글 ───────── */
export interface ArticleRow { id: string; category: string; title: string; summary: string; body: string[]; body_blocks: DemoArticle["bodyBlocks"]; icon: string; thumbnail: string; source: string; source_url: string; source_date: string; published_at: string; status: DemoArticle["status"]; placement: DemoArticle["placement"]; region: string | null; apply_end_at: string | null; child_ages: string[] }
export function articleToRow(a: DemoArticle): ArticleRow {
  return { id: demoUuid(a.id), category: a.categoryId, title: a.title, summary: a.summary, body: a.bodyBlocks.map((b) => b.text), body_blocks: a.bodyBlocks, icon: a.icon, thumbnail: a.thumbnail, source: a.source, source_url: a.sourceUrl, source_date: dateOnly(a.publishedAt), published_at: a.publishedAt, status: a.status, placement: a.placement, region: a.region ?? null, apply_end_at: a.applyEndAt ?? null, child_ages: a.childAges ?? [] };
}
export function rowToArticle(r: ArticleRow): DemoArticle {
  const a: DemoArticle = { id: fromDemoUuid(r.id), categoryId: r.category, title: r.title, summary: r.summary, icon: r.icon, thumbnail: r.thumbnail ?? "", bodyBlocks: r.body_blocks, source: r.source, sourceUrl: r.source_url ?? "", publishedAt: toKst(r.published_at), status: r.status, placement: r.placement };
  if (r.region) a.region = r.region;
  if (r.apply_end_at) a.applyEndAt = toKst(r.apply_end_at);
  if (r.child_ages?.length) a.childAges = r.child_ages as DemoArticle["childAges"];
  return a;
}
export function categoryToRow(c: DemoCategory) { return { id: c.id, name: c.name, icon: c.icon, sort: c.order, enabled: c.enabled }; }

/* ───────── 커뮤니티 ───────── */
const TOPIC_TO_BOARD: Record<CommunityTopic, string> = { 수익인증: "income", 부업후기: "sidejob", 지원금제보: "subsidy", "주식·재테크": "stock", "공구/쇼핑": "groupbuy", 자유: "free" };
export interface PostRow { id: string; board: string; topic: string; author_id: string; title: string; body: string; status: DemoPost["status"]; moderation_note: string | null; source_journal_id: string | null; created_at: string }
export function postToRow(p: DemoPost): PostRow {
  return { id: demoUuid(p.id), board: TOPIC_TO_BOARD[p.topic], topic: p.topic, author_id: demoUuid(p.memberId), title: p.title, body: p.body, status: p.status, moderation_note: p.moderationNote ?? null, source_journal_id: p.sourceJournalId ? demoUuid(p.sourceJournalId) : null, created_at: p.createdAt };
}
export function rowToPost(r: PostRow, likes: string[]): DemoPost {
  const p: DemoPost = { id: fromDemoUuid(r.id), memberId: fromDemoUuid(r.author_id), topic: r.topic as CommunityTopic, title: r.title, body: r.body, status: r.status, createdAt: toKst(r.created_at), likes: likes.map(fromDemoUuid), sourceJournalId: r.source_journal_id ? fromDemoUuid(r.source_journal_id) : null };
  if (r.moderation_note) p.moderationNote = r.moderation_note;
  return p;
}
export interface CommentRow { id: string; post_id: string; author_id: string; body: string; status: DemoComment["status"]; created_at: string }
export function commentToRow(c: DemoComment): CommentRow { return { id: demoUuid(c.id), post_id: demoUuid(c.postId), author_id: demoUuid(c.memberId), body: c.body, status: c.status, created_at: c.createdAt }; }
export function rowToComment(r: CommentRow, likes: string[]): DemoComment { return { id: fromDemoUuid(r.id), postId: fromDemoUuid(r.post_id), memberId: fromDemoUuid(r.author_id), body: r.body, status: r.status, createdAt: toKst(r.created_at), likes: likes.map(fromDemoUuid) }; }

/* ───────── 지갑 · 생활력 ───────── */
export interface PointLogRow { id: string; profile_id: string; amount: number; kind: DemoPoint["kind"]; reason: string; ref_type: string | null; ref_id: string | null; created_at: string }
export function pointToRow(p: DemoPoint): PointLogRow {
  return { id: demoUuid(p.id), profile_id: demoUuid(p.memberId), amount: p.amount, kind: p.kind, reason: p.reason, ref_type: p.refType ?? null, ref_id: p.refId ? demoUuid(p.refId) : null, created_at: p.createdAt.length === 10 ? `${p.createdAt}T00:00:00${KST}` : p.createdAt };
}
export function rowToPoint(r: PointLogRow): DemoPoint {
  const p: DemoPoint = { id: fromDemoUuid(r.id), memberId: fromDemoUuid(r.profile_id), amount: r.amount, kind: r.kind, reason: r.reason, createdAt: toKst(r.created_at) };
  if (r.ref_type) p.refType = r.ref_type;
  if (r.ref_id) p.refId = fromDemoUuid(r.ref_id);
  return p;
}
export interface TrustEventRow { id: string; profile_id: string; kind: TrustEvent["kind"]; delta: number; ref_type: string | null; ref_id: string | null; note: string | null; created_at: string }
export function trustEventToRow(e: TrustEvent): TrustEventRow {
  return { id: demoUuid(e.id), profile_id: demoUuid(e.userId), kind: e.kind, delta: e.delta, ref_type: e.refType ?? null, ref_id: e.refId ? demoUuid(e.refId) : null, note: e.note ?? null, created_at: e.createdAt.length === 10 ? `${e.createdAt}T00:00:00${KST}` : e.createdAt };
}
export function rowToTrustEvent(r: TrustEventRow): TrustEvent {
  const e: TrustEvent = { id: fromDemoUuid(r.id), userId: fromDemoUuid(r.profile_id), kind: r.kind, delta: r.delta, createdAt: toKst(r.created_at) };
  if (r.ref_type) e.refType = r.ref_type;
  if (r.ref_id) e.refId = fromDemoUuid(r.ref_id);
  if (r.note) e.note = r.note;
  return e;
}

/* ───────── 매매일지 · 광고주 평가 ───────── */
export function journalToRow(j: DemoJournal) {
  return {
    id: demoUuid(j.id), profile_id: demoUuid(j.memberId), trade_date: j.tradeDate, market: j.market, symbol: j.symbol, stock_name: j.stockName, side: j.side,
    unit_price: j.unitPrice, quantity: j.quantity, fee: j.fee, tax: j.tax, reason: j.reason, reflection: j.reflection, emotion: j.emotion,
    checklist_template_version: j.checklistTemplateVersion, checklist_answers: j.checklistAnswers, trend_checks: j.trendChecks,
    target_price: j.targetPrice, stop_loss_price: j.stopLossPrice, support_note: j.supportNote, resistance_note: j.resistanceNote,
    sell_review: j.sellReview, intraday: j.intraday, volume_note: j.volumeNote, index_note: j.indexNote, draft_status: j.draftStatus,
  };
}
export type JournalRow = ReturnType<typeof journalToRow>;
export function rowToJournal(r: JournalRow): DemoJournal {
  return {
    id: fromDemoUuid(r.id), memberId: fromDemoUuid(r.profile_id), tradeDate: String(r.trade_date).slice(0, 10), market: "KR", symbol: r.symbol ?? "", stockName: r.stock_name ?? "", side: r.side,
    unitPrice: Number(r.unit_price), quantity: Number(r.quantity), fee: Number(r.fee), tax: Number(r.tax), reason: r.reason ?? "", reflection: r.reflection ?? "", emotion: r.emotion ?? "",
    checklistTemplateVersion: r.checklist_template_version, checklistAnswers: r.checklist_answers, trendChecks: r.trend_checks,
    targetPrice: Number(r.target_price), stopLossPrice: Number(r.stop_loss_price), supportNote: r.support_note ?? "", resistanceNote: r.resistance_note ?? "",
    sellReview: r.sell_review ?? "", intraday: r.intraday ?? "", volumeNote: r.volume_note ?? "", indexNote: r.index_note ?? "", draftStatus: r.draft_status,
  };
}
export function brandRatingToRow(r: BrandRating) {
  return { id: demoUuid(r.id), application_id: demoUuid(r.applicationId), campaign_id: demoUuid(r.campaignId), profile_id: demoUuid(r.memberId), stars: r.stars, shipped_on_time: r.shippedOnTime, matched_guide: r.matchedGuide, comment: r.comment ?? null, status: r.status, created_at: r.createdAt };
}
