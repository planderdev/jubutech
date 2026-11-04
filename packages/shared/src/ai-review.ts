/**
 * 1-1 AI 리뷰 교정·이어쓰기 — 어댑터 인터페이스와 스텁.
 * 화면은 이 인터페이스만 안다. 모델·비용이 정해지면 `aiReviewAdapter()` 에 실제 구현(서버 경유)을 더하고 `assist.provider` 만 바꾼다.
 * 원칙: 앱에 API 키를 넣지 않는다(서버 함수 경유). 제안은 사용자가 비교해 보고 직접 적용한다. 체험하지 않은 내용을 지어내지 않는다.
 */
import type { AppRules } from "./rules";

export type AiAssistKind = "edit" | "continue";
export const AI_ASSIST_LABEL: Record<AiAssistKind, string> = { edit: "AI 교정", continue: "이어쓰기" };

export interface AiReviewRequest {
  kind: AiAssistKind;
  text: string;
  brand: string;
  campaignTitle: string;
  mission: { minChars: number; requiredKeywords: string[]; hashtags: string[] };
}

export interface AiReviewResult {
  /** 제안 전문 — 사용자가 적용하면 입력칸을 이 글로 바꾼다 */
  text: string;
  /** 바꾼 점·빠진 점 안내 */
  notes: string[];
  provider: string;
  /** 스텁 결과인지 — 화면에 "예시" 표시 */
  stub: boolean;
}

export interface AiReviewAdapter {
  id: string;
  complete(req: AiReviewRequest): Promise<AiReviewResult>;
}

/** 공백·중복 문장 정리와 미션 누락 안내만 하는 규칙 기반 스텁. 실제 모델을 부르지 않는다 */
export const stubAiReviewAdapter: AiReviewAdapter = {
  id: "stub",
  async complete(req) {
    const cleaned = req.text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    const sentences = cleaned.split(/(?<=[.!?요다])\s+/);
    const seen = new Set<string>();
    const deduped = sentences.filter((x) => (seen.has(x) ? false : (seen.add(x), true))).join(" ");
    const missing = req.mission.requiredKeywords.filter((k) => !deduped.includes(k));
    const missingTags = req.mission.hashtags.filter((h) => !deduped.includes(`#${h}`));
    const notes: string[] = [];
    if (deduped !== req.text.trim()) notes.push("띄어쓰기와 겹친 문장을 정리했어요.");
    if (missing.length) notes.push(`키워드가 빠졌어요: ${missing.join(", ")}`);
    if (missingTags.length) notes.push(`해시태그를 붙였어요: ${missingTags.map((h) => `#${h}`).join(" ")}`);
    const tags = missingTags.length ? `\n\n${missingTags.map((h) => `#${h}`).join(" ")}` : "";
    if (req.kind === "edit") return { text: `${deduped}${tags}`, notes: notes.length ? notes : ["고칠 곳을 찾지 못했어요."], provider: "stub", stub: true };
    // 이어쓰기: 사실을 지어내지 않도록 빈칸 문장만 제안한다
    const continuation = `${req.brand} 제품을 직접 써 보니 〔가장 좋았던 점〕이 기억에 남아요. 〔어떤 상황에서 썼는지〕 쓰기 좋았고, 〔아쉬웠던 점〕은 다음에 달라지면 좋겠어요.`;
    return { text: `${deduped}${deduped ? " " : ""}${continuation}${tags}`, notes: ["〔 〕 안을 내 경험으로 바꿔 주세요. 체험하지 않은 내용은 쓰지 마세요.", ...notes], provider: "stub", stub: true };
  },
};

/** `assist.provider` 로 어댑터를 고른다. remote 는 서버 함수가 생기면 여기서 연결한다(지금은 없음 → null) */
export function aiReviewAdapter(rules: AppRules): AiReviewAdapter | null {
  if (!rules.assist.aiReviewEdit) return null;
  return rules.assist.provider === "stub" ? stubAiReviewAdapter : null;
}
