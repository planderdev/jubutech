/**
 * 2-1 추천 링크 수익 — **결정 대기.** 쿠팡 파트너스 약관(앱이 수익을 나눠 줘도 되는지)과 리서치 결과가 나오기 전까지는 `referral.enabled=false`.
 * 여기에는 링크 목록과 가이드 자리만 둔다. 수익 배분·정산 로직은 없다. 켜도 돈이 오가지 않는다.
 */
import type { DemoApplication, DemoCampaign } from "./fixtures";
import type { Review } from "./types";

export interface ReferralLink {
  campaignId: string;
  brand: string;
  title: string;
  /** 배포 도메인이 정해지면 앞에 붙인다 */
  path: string;
}

/** 후기가 승인된 체험마다 나만의 링크 하나 (기획안 "체험 후기를 올린 제품마다") */
export function referralLinks(memberId: string, code: string, applications: DemoApplication[], reviews: Review[], campaigns: DemoCampaign[]): ReferralLink[] {
  return applications.flatMap((a) => {
    if (a.memberId !== memberId || reviews.find((r) => r.applicationId === a.id)?.status !== "approved") return [];
    const c = campaigns.find((x) => x.id === a.campaignId);
    return c ? [{ campaignId: c.id, brand: c.brand, title: c.title, path: `/r/${code}-${c.id}` }] : [];
  });
}

/** 가이드 초안 — 리서치 결과가 나오면 문구를 바꾼다. 수익은 주부가 직접 받고, 앱은 방법을 알려 주는 역할 */
export const PARTNER_GUIDE = {
  title: "쿠팡 파트너스 3분 시작하기",
  note: "초안이에요. 이사님 리서치 결과가 나오면 절차와 문구를 고칩니다.",
  steps: [
    { title: "내 이름으로 가입해요", body: "파트너스 가입은 각자 해요. 수익도 쿠팡에서 나에게 바로 들어와요. 주부테크는 수익을 나눠 주지 않아요." },
    { title: "체험한 제품의 링크를 만들어요", body: "내가 직접 써 본 제품만 추천해요. 쓰지 않은 제품을 권하면 믿음을 잃어요." },
    { title: "대가를 받는다고 꼭 적어요", body: "추천으로 수수료를 받을 수 있다면 글에 그 사실을 밝혀야 해요. 후기 협찬 표시와 마찬가지예요." },
  ],
} as const;
