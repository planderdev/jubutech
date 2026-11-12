/**
 * shared 판단 로직 점검 — `npm run check:shared`. 운영 도구·생활력·일지 검증·맞춤 지원금·평가·지갑·알림·설정값을 숫자로 확인한다.
 * 화면 없이 규칙이 바뀌었는지 빨리 보는 용도. 마지막 줄은 설정 키가 마이그레이션 시드와 같은지 본다.
 */
import { readFileSync } from "node:fs";
import * as shm from "../packages/shared/src/index";
const sh: any = (shm as any).default ?? shm;
const { DEFAULT_RULES, RULE_KEYS, flattenRules, resolveRules, moderateText, DEMO_MODERATION_WORDS, shouldAutoHide, distinctReporters, campaignGradeGate, trustGrade, trustTemperature, trustProgress, validateJournal, journalWeek, addDays, matchArticles, subsidyDueAlerts, EMPTY_SUBSIDY_PROFILE, DEMO_ARTICLES, brandRatingSummary, DEMO_BRAND_RATINGS, campaignQuote, walletExpiryNotice, makeNotification, DEFAULT_NOTIFY_PREFS, demoUuid, fromDemoUuid } = sh;

let fails = 0;
const eq = (name: string, a: unknown, b: unknown) => {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (!ok) { fails++; console.log("FAIL", name, JSON.stringify(a), "≠", JSON.stringify(b)); } else console.log("ok", name);
};
const R = DEFAULT_RULES;
const w = DEMO_MODERATION_WORDS;
const NOW = "2026-10-21T12:00:00+09:00";

eq("정상 글 공개", moderateText({ title: "오늘 장보기", body: "냉장고 사진을 찍었어요" }, w, R).action, "publish");
eq("금칙어 숨김(띄어쓰기 회피)", moderateText({ body: "토토 사이트 오세요" }, w, R).action, "hide");
eq("금칙어 검토", moderateText({ body: "리딩방 들어오세요" }, w, R).action, "review");
eq("홍보 링크 검토", moderateText({ body: "체험단 모집 https://example.com/a" }, w, R).action, "review");
eq("주소 단독은 공개", moderateText({ body: "공식 안내 https://gov.kr/a 참고하세요" }, w, R).action, "publish");
eq("오픈채팅 주소 검토", moderateText({ body: "https://open.kakao.com/x" }, w, R).action, "review");
eq("주식 권유: 주식 글", moderateText({ body: "매수 추천 드려요", topic: "주식·재테크" }, w, R).action, "review");
eq("주식 권유: 다른 글은 통과", moderateText({ body: "매수 추천 드려요", topic: "자유" }, w, R).action, "publish");
eq("스위치 끄면 통과", moderateText({ body: "매수 추천", topic: "주식·재테크" }, w, resolveRules({ "moderation.stockGuard": false })).action, "publish");
const rep = (id: string, status = "open") => ({ target: "post", targetId: "p", reporterId: id, status });
eq("같은 사람 중복은 1명", distinctReporters([rep("a"), rep("a")], "post", "p"), 1);
eq("2명 숨김 아님", shouldAutoHide([rep("a"), rep("b")], "post", "p", R), false);
eq("3명 숨김", shouldAutoHide([rep("a"), rep("b"), rep("c")], "post", "p", R), true);
eq("기각은 안 셈", shouldAutoHide([rep("a"), rep("b"), rep("c", "dismissed")], "post", "p", R), false);

const on = resolveRules({ "trust.visibleToUsers": true });
eq("노출 끄면 고가 제한 없음", campaignGradeGate({ benefitValue: 200000 }, 0, R), null);
eq("노출 켜면 보통은 고가 막힘", campaignGradeGate({ benefitValue: 200000 }, 0, on), "good");
eq("좋음은 통과", campaignGradeGate({ benefitValue: 200000 }, 20, on), null);
eq("저가는 통과", campaignGradeGate({ benefitValue: 1000 }, -5, on), null);
eq("등급 경계", [-1, 0, 19, 20, 49, 50].map((s) => trustGrade(s)), ["caution", "normal", "normal", "good", "good", "excellent"]);
eq("온도", [trustTemperature(0), trustTemperature(16), trustTemperature(-1000), trustTemperature(100000)], [36.5, 38.1, 0, 99]);
eq("다음 등급 점수", trustProgress(16).pointsToNext, 4);
eq("최고 등급", trustProgress(60).next, null);
eq("주의 등급 진행률 범위", (() => { const r = trustProgress(-30).ratio; return r >= 0 && r <= 1; })(), true);

const base = { tradeDate: "2026-10-21", symbol: "", stockName: "삼성전자", side: "buy", unitPrice: "100", quantity: "1", fee: "0", tax: "0", reason: "", reflection: "", emotion: "", checklistAnswers: {}, trendChecks: {}, targetPrice: "", stopLossPrice: "", supportNote: "", resistanceNote: "", sellReview: "", intraday: "", volumeNote: "", indexNote: "" };
eq("일지 정상", validateJournal(base, false), {});
eq("종목 필수", Object.keys(validateJournal({ ...base, stockName: " " }, false)), ["stockName"]);
eq("임시 저장은 필수 면제", validateJournal({ ...base, stockName: "", unitPrice: "", quantity: "" }, true), {});
eq("없는 날짜 거부", Object.keys(validateJournal({ ...base, tradeDate: "2026-02-30" }, false)), ["tradeDate"]);
eq("매도 비용 초과", Object.keys(validateJournal({ ...base, side: "sell", fee: "500" }, false)), ["fee"]);
eq("음수 거부", Object.keys(validateJournal({ ...base, fee: "-1" }, false)), ["fee"]);
eq("주간 월요일 시작(일요일 입력)", journalWeek("2026-10-25")[0], "2026-10-19");
eq("주간 끝은 일요일", journalWeek("2026-10-19")[6], "2026-10-25");
eq("월 넘김", addDays("2026-10-31", 1), "2026-11-01");

const prof = { ...EMPTY_SUBSIDY_PROFILE, region: "성남시", childAge: "infant", interests: ["subsidy"], answered: true };
eq("맞춤: 성남 영유아", matchArticles(DEMO_ARTICLES, prof, NOW).map((a: any) => a.id), ["i1", "i11"]);
eq("맞춤: 제주는 성남 글 제외", matchArticles(DEMO_ARTICLES, { ...prof, region: "제주시" }, NOW).map((a: any) => a.id), ["i11"]);
eq("맞춤: 자녀 없음은 연령 글 제외", matchArticles(DEMO_ARTICLES, { ...prof, childAge: "none" }, NOW).map((a: any) => a.id), ["i1"]);
eq("마감 임박 7일", subsidyDueAlerts(DEMO_ARTICLES, prof, R, NOW).map((d: any) => [d.article.id, d.daysLeft]), [["i1", 6]]);
eq("답 안 했으면 알림 없음", subsidyDueAlerts(DEMO_ARTICLES, EMPTY_SUBSIDY_PROFILE, R).length, 0);

eq("평가 3건 공개", brandRatingSummary(DEMO_BRAND_RATINGS, "맑은생활", R).average, 4.7);
eq("평가 1건 비공개", brandRatingSummary(DEMO_BRAND_RATINGS, "그린테이블", R).visible, false);
eq("숨긴 평가 제외", brandRatingSummary(DEMO_BRAND_RATINGS.map((r: any) => (r.id === "br1" ? { ...r, status: "hidden" } : r)), "맑은생활", R).visible, false);
eq("대행 견적", campaignQuote(R, "agency"), { baseFee: 50000, agencyFee: 100000, total: 150000 });
eq("소멸 안내 없음", walletExpiryNotice([{ amount: 1000, createdAt: "2026-10-01" }], R, "2026-10-21"), null);
eq("소멸 30일 안", walletExpiryNotice([{ amount: 1000, createdAt: "2025-11-10" }], R, "2026-10-21")?.daysLeft, 20);
eq("제품 가치는 소멸 안 셈", walletExpiryNotice([{ amount: 1000, kind: "product_value", createdAt: "2025-11-10" }], R, "2026-10-21"), null);
const approved = { kind: "review_approved", applicationId: "a", brand: "b", amount: 1 };
eq("알림: 회원이 끄면 없음", makeNotification(R, { ...DEFAULT_NOTIFY_PREFS, review: false }, "m1", approved, "2026-10-21"), null);
eq("알림: 운영이 끄면 없음", makeNotification(resolveRules({ "notify.review": false }), DEFAULT_NOTIFY_PREFS, "m1", approved, "2026-10-21"), null);
eq("잘못된 설정값 무시", resolveRules({ "report.autoHideCount": "많이" }).report.autoHideCount, 3);
eq("데모 UUID 왕복", ["cp1", "a7", "i12", "ops"].map((x) => fromDemoUuid(demoUuid(x))), ["cp1", "a7", "i12", "ops"]);

// 설정 키 ↔ 마이그레이션 시드
const sql = ["0002_stage1.sql", "0003_stage2.sql"].map((f) => readFileSync(new URL(`../supabase/migrations/${f}`, import.meta.url), "utf8")).join("\n");
const flat = flattenRules(R);
eq("모든 설정 키가 시드에 있음", RULE_KEYS.filter((k: string) => !sql.includes(`'${k}'`)), []);
for (const k of RULE_KEYS) {
  const m = sql.match(new RegExp(`'${k.replace(/\./g, "\\.")}',\\s*'([^']*)'`));
  if (m && JSON.stringify(JSON.parse(m[1])) !== JSON.stringify(flat[k])) { fails++; console.log("FAIL 시드 값 다름", k, m[1], JSON.stringify(flat[k])); }
}
console.log("fails:", fails);
process.exit(fails ? 1 : 0);
