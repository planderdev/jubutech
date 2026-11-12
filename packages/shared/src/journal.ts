/**
 * 주식 매매일지 — PHP `journal.php` 와 `app/data/fixtures.php` 의 journals·checklist·goals 모양.
 * 일지는 작성자만 본다. 체크 결과는 나의 기준 점검이지 투자 추천이 아니다. 거래금액은 실현 손익이 아니다.
 */
import { DEMO_NOW } from "./fixtures";

export type JournalSide = "buy" | "sell";
export type JournalAnswer = "unreviewed" | "yes" | "no";
export type JournalTrend = "unreviewed" | "up" | "down" | "flat";
export type JournalDraftStatus = "complete" | "draft";

export interface JournalCheckItem { id: string; title: string; help: string; order: number; enabled: boolean; version: number }

export const JOURNAL_CHECKLIST: JournalCheckItem[] = [
  ["이평선 배열", "5일선·20일선 골든크로스 및 정배열 초입 여부"],
  ["일목균형표", "구름대 위·아래 위치와 돌파 여부"],
  ["볼린저밴드", "상단 돌파·안착 또는 하단 지지 여부"],
  ["수급 분석", "기관 평단가 부근 및 외국인 지속 수급·평단 확인"],
  ["매수 타점", "거래량 동반 직전 고점 돌파 또는 주요 지지선 눌림목"],
  ["시장 환경", "코스피·코스닥 방향성과 변동성 장세 여부"],
].map(([title, help], i) => ({ id: `check${i + 1}`, title, help, order: i + 1, enabled: true, version: 1 }));

export const JOURNAL_MA_DAYS = ["5", "10", "20", "60", "120", "224", "448"] as const;
export const JOURNAL_ANSWER_LABEL: Record<JournalAnswer, string> = { unreviewed: "미점검", yes: "충족", no: "미충족" };
export const JOURNAL_TREND_LABEL: Record<JournalTrend, string> = { unreviewed: "미점검", up: "상승", down: "하락", flat: "횡보" };
export const JOURNAL_EMOTIONS = ["차분함", "기대감", "조급함", "아쉬움"] as const;
export const JOURNAL_STEPS = ["기본 거래", "기준 점검", "추세·리스크", "생각 남기기", "확인"] as const;

export interface DemoJournal {
  id: string;
  memberId: string;
  tradeDate: string;
  market: "KR";
  symbol: string;
  stockName: string;
  side: JournalSide;
  unitPrice: number;
  quantity: number;
  fee: number;
  tax: number;
  reason: string;
  reflection: string;
  emotion: string;
  checklistTemplateVersion: number;
  checklistAnswers: Record<string, JournalAnswer>;
  trendChecks: Record<string, JournalTrend>;
  targetPrice: number;
  stopLossPrice: number;
  supportNote: string;
  resistanceNote: string;
  sellReview: string;
  intraday: string;
  volumeNote: string;
  indexNote: string;
  draftStatus: JournalDraftStatus;
}

export function emptyJournalAnswers(): Record<string, JournalAnswer> {
  return Object.fromEntries(JOURNAL_CHECKLIST.map((c) => [c.id, "unreviewed" as JournalAnswer]));
}
export function emptyJournalTrends(): Record<string, JournalTrend> {
  return Object.fromEntries(JOURNAL_MA_DAYS.map((d) => [d, "unreviewed" as JournalTrend]));
}

const tradeRows: [string, string, string, JournalSide, number, number][] = [
  ["21", "삼성전자", "005930", "buy", 68200, 10],
  ["21", "TIGER 미국S&P500", "360750", "buy", 19850, 5],
  ["20", "현대차", "005380", "buy", 243000, 3],
  ["19", "KODEX 200", "069500", "sell", 41200, 10],
  ["17", "삼성전자", "005930", "buy", 67500, 5],
  ["15", "NAVER", "035420", "buy", 185000, 2],
  ["14", "에코프로비엠", "247540", "sell", 161500, 4],
  ["12", "에코프로비엠", "247540", "buy", 152000, 4],
  ["08", "KODEX 200", "069500", "buy", 38900, 30],
  ["03", "삼성전자", "005930", "sell", 64000, 5],
];
export const DEMO_JOURNALS: DemoJournal[] = tradeRows.map((t, i) => ({
  id: `j${i + 1}`, memberId: "m1", tradeDate: `2026-10-${t[0]}`, market: "KR", symbol: t[2], stockName: t[1], side: t[3], unitPrice: t[4], quantity: t[5], fee: 100, tax: 0,
  reason: i === 0 ? "정해둔 가격대에서 분할 매수했어요." : "계획한 기준을 확인하고 기록했어요.",
  reflection: i === 0 ? "조급하게 결정하지 않고 체크리스트를 먼저 확인했어요." : "다음 거래 전에도 내 기준을 돌아보기.",
  emotion: "차분함", checklistTemplateVersion: 1,
  checklistAnswers: { check1: "yes", check2: "yes", check3: "no", check4: "yes", check5: "unreviewed", check6: "yes" },
  trendChecks: { "5": "up", "10": "up", "20": "flat", "60": "unreviewed", "120": "unreviewed", "224": "unreviewed", "448": "unreviewed" },
  targetPrice: 0, stopLossPrice: 0, supportNote: "", resistanceNote: "", sellReview: "", intraday: "", volumeNote: "", indexNote: "", draftStatus: "complete",
}));

/** 회원·월별 기록 목표 일수 */
export const DEMO_JOURNAL_GOALS: Record<string, Record<string, number>> = { m1: { "2026-10": 12 } };

export function journalTotal(j: Pick<DemoJournal, "unitPrice" | "quantity">): number {
  return j.unitPrice * j.quantity;
}
/** 매수 지출액 / 매도 수령액 — 실현 손익이 아니다 */
export function journalNet(j: DemoJournal): number {
  const total = journalTotal(j);
  const cost = j.fee + j.tax;
  return j.side === "buy" ? total + cost : total - cost;
}
export function journalChecklistStats(j: Pick<DemoJournal, "checklistAnswers">) {
  const v = Object.values(j.checklistAnswers);
  return { total: v.length, yes: v.filter((a) => a === "yes").length, done: v.filter((a) => a !== "unreviewed").length };
}
export function journalMonthRows(journals: DemoJournal[], month: string): DemoJournal[] {
  return journals.filter((j) => j.tradeDate.startsWith(month) && j.draftStatus === "complete");
}
export function journalMonthStats(journals: DemoJournal[], month: string) {
  const rows = journalMonthRows(journals, month);
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.stockName] = (counts[r.stockName] ?? 0) + 1;
  return {
    total: rows.length,
    days: new Set(rows.map((r) => r.tradeDate)).size,
    buys: rows.filter((r) => r.side === "buy").length,
    sells: rows.filter((r) => r.side === "sell").length,
    byStock: Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
  };
}

function pad(n: number): string { return String(n).padStart(2, "0"); }
export function isoDate(d: Date): string { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
/** 문자열 날짜를 지역 시간 자정으로 (시간대 밀림 방지) */
export function parseDate(date: string): Date {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(date: string, days: number): string {
  const d = parseDate(date);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}
/** 그 날짜가 든 주의 월~일 */
export function journalWeek(date: string): string[] {
  const d = parseDate(date);
  const monday = addDays(date, -((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
export function journalToday(now = DEMO_NOW): string { return now.slice(0, 10); }
export function validIsoDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  return isoDate(parseDate(v)) === v;
}

export interface JournalInput extends Omit<DemoJournal, "id" | "memberId" | "market" | "checklistTemplateVersion" | "draftStatus" | "unitPrice" | "quantity" | "fee" | "tax" | "targetPrice" | "stopLossPrice"> {
  unitPrice: string; quantity: string; fee: string; tax: string; targetPrice: string; stopLossPrice: string;
}

export type JournalErrors = Partial<Record<"tradeDate" | "stockName" | "unitPrice" | "quantity" | "fee" | "tax" | "targetPrice" | "stopLossPrice", string>>;

/** PHP actions.php `save_journal` 의 검증 — 임시 저장은 필수 항목을 안 본다 */
export function validateJournal(input: JournalInput, draft: boolean): JournalErrors {
  const e: JournalErrors = {};
  if (input.tradeDate && !validIsoDate(input.tradeDate)) e.tradeDate = "올바른 거래일을 선택해 주세요.";
  if (!draft && !input.tradeDate) e.tradeDate = "올바른 거래일을 선택해 주세요.";
  if (!draft && !input.stockName.trim()) e.stockName = "종목명을 입력해 주세요.";
  for (const k of ["unitPrice", "quantity", "fee", "tax", "targetPrice", "stopLossPrice"] as const) {
    const raw = input[k].trim();
    const n = Number(raw === "" ? "0" : raw);
    const positive = k === "unitPrice" || k === "quantity";
    if (!Number.isFinite(n) || n < 0 || n > 1e12 || (!draft && positive && n <= 0)) e[k] = positive ? "0보다 큰 숫자를 입력해 주세요." : "0 이상의 올바른 숫자를 입력해 주세요.";
  }
  const price = Number(input.unitPrice || 0) * Number(input.quantity || 0);
  if (!draft && input.side === "sell" && Number(input.fee || 0) + Number(input.tax || 0) > price) e.fee = "비용은 매도 거래금액보다 클 수 없어요.";
  return e;
}

/** 복기 공유 — 고른 항목과 직접 쓴 글만 공개한다. 금액은 넣지 않는다 */
export function journalSharePreview(j: DemoJournal, opts: { includeStock: boolean; includeReason: boolean; includeReflection: boolean }, body: string): string {
  const parts = [body.trim()];
  if (opts.includeStock && j.stockName) parts.push(`종목명: ${j.stockName}`);
  if (opts.includeReason && j.reason) parts.push(`매매 이유: ${j.reason}`);
  if (opts.includeReflection && j.reflection) parts.push(`복기 메모: ${j.reflection}`);
  return parts.filter(Boolean).join("\n\n");
}
