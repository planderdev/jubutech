/**
 * 2-4 커뮤니티 운영 도구 — 사람이 볼 글을 줄이는 자동 판단. 순수 함수만.
 * 금칙어 사전(바로 숨김 / 검토 대기), 신고 누적 자동 숨김(`report.autoHideCount`), 홍보 링크, 주식 글 "매수 추천" 감지.
 * 자동 판단은 우선 가리는 것까지만 하고, 확정은 운영자가 검토 목록(`/admin7/moderation`)에서 한다.
 */
import type { AppRules } from "./rules";

export type ModerationAction = "publish" | "review" | "hide";
export type WordAction = "hide" | "review";
export const WORD_ACTION_LABEL: Record<WordAction, string> = { hide: "바로 숨김", review: "검토 대기" };

export interface ModerationWord {
  id: string;
  word: string;
  action: WordAction;
  createdAt: string;
}

export const DEMO_MODERATION_WORDS: ModerationWord[] = [
  { id: "w1", word: "토토사이트", action: "hide", createdAt: "2026-10-22" },
  { id: "w2", word: "도박사이트", action: "hide", createdAt: "2026-10-22" },
  { id: "w3", word: "리딩방", action: "review", createdAt: "2026-10-22" },
  { id: "w4", word: "원금보장", action: "review", createdAt: "2026-10-22" },
  { id: "w5", word: "대출문의", action: "review", createdAt: "2026-10-22" },
];

export type ModerationReasonKind = "word" | "promo" | "stock";
export interface ModerationReason {
  kind: ModerationReasonKind;
  action: WordAction;
  matched: string;
  message: string;
}
export interface ModerationResult {
  action: ModerationAction;
  reasons: ModerationReason[];
}

/** 띄어쓰기·대소문자로 피해 가는 것을 줄인다 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

const URL_RE = /(https?:\/\/|www\.)[^\s]+|[a-z0-9-]+\.(com|net|kr|co\.kr|me|ly|gl)(\/[^\s]*)?/i;
/** 그 자체로 모집·유도에 많이 쓰이는 주소 */
const PROMO_HOSTS = /(open\.kakao\.com|forms\.gle|bit\.ly|me2\.do|naver\.me|t\.me)/i;
/** 다른 체험단·부업 모집을 알리는 말 */
const PROMO_WORDS = /(체험단|서포터즈|리뷰어|부업|재택알바|알바모집|수익보장|모집중|모집합니다|신청하세요|가입하세요)/;
/** 주식 영역의 투자 권유 표현 */
const STOCK_RE = /(매수추천|종목추천|추천종목|풀매수|급등주|무조건오른|꼭사세요|지금사세요|사야합니다|지금이매수)/;

/** 글·댓글 내용을 판단한다. 가장 강한 조치가 결과가 된다(숨김 > 검토 > 공개) */
export function moderateText(input: { title?: string; body: string; topic?: string }, words: ModerationWord[], rules: AppRules): ModerationResult {
  const raw = `${input.title ?? ""}\n${input.body}`;
  const norm = normalize(raw);
  const reasons: ModerationReason[] = [];
  for (const w of words) {
    if (w.word.trim() && norm.includes(normalize(w.word))) reasons.push({ kind: "word", action: w.action, matched: w.word, message: `금칙어 "${w.word}"` });
  }
  if (rules.moderation.blockPromoLinks) {
    const link = raw.match(URL_RE)?.[0];
    if (link && (PROMO_HOSTS.test(link) || PROMO_WORDS.test(norm))) reasons.push({ kind: "promo", action: "review", matched: link, message: "다른 모집·홍보 링크로 보여요" });
  }
  if (rules.moderation.stockGuard && (input.topic ?? "").includes("주식")) {
    const hit = norm.match(STOCK_RE)?.[0];
    if (hit) reasons.push({ kind: "stock", action: "review", matched: hit, message: "특정 종목 권유 표현으로 보여요" });
  }
  const action: ModerationAction = reasons.some((r) => r.action === "hide") ? "hide" : reasons.length ? "review" : "publish";
  return { action, reasons };
}

/** 작성자에게 보여 줄 한 줄 */
export function moderationMessage(result: ModerationResult): string {
  if (result.action === "hide") return "운영 정책에 맞지 않는 표현이 있어 글이 가려졌어요.";
  if (result.action === "review") return "운영팀 확인이 끝나면 공개돼요.";
  return "이야기를 게시했어요.";
}

/** 운영자·작성자용 사유 — 글에 함께 저장한다 */
export function moderationNote(result: ModerationResult): string | undefined {
  return result.reasons.length ? result.reasons.map((r) => r.message).join(" · ") : undefined;
}

export const STOCK_POST_NOTICE = { title: "투자 권유 금지", body: "특정 종목을 사라고 권하는 글은 운영팀 검토로 넘어가요. 내 기록과 판단 과정 위주로 적어 주세요." };

export interface ReportLike { target: string; targetId: string; reporterId: string; status?: string }

/** 처리되지 않은 신고 중 서로 다른 신고자 수 — 기각한 신고는 세지 않는다 */
export function distinctReporters(reports: ReportLike[], target: string, targetId: string): number {
  return new Set(reports.filter((r) => r.target === target && r.targetId === targetId && r.status !== "dismissed").map((r) => r.reporterId)).size;
}

/** 신고 누적 자동 숨김 — 서로 다른 신고자가 `report.autoHideCount` 명 이상이면 우선 숨기고 검토 목록에 올린다 */
export function shouldAutoHide(reports: ReportLike[], target: string, targetId: string, rules: AppRules): boolean {
  return distinctReporters(reports, target, targetId) >= rules.report.autoHideCount;
}
