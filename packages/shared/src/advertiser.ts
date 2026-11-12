/**
 * 2-2 광고주 셀프 등록·선정 대행 — 가격 계산과 데모 소유 관계.
 * 금액은 전부 설정 키(`advertiser.*`). 광고 제안서 가격이 정해지면 값만 바꾼다.
 */
import type { AppRules } from "./rules";
import type { SelectionMode } from "./types";

export const SELECTION_MODE_LABEL: Record<SelectionMode, string> = { self: "직접 선정", agency: "맡기기" };
export const SELECTION_MODE_DESC: Record<SelectionMode, string> = {
  self: "신청자를 광고주가 직접 고릅니다. 기본 수수료만 냅니다.",
  agency: "주부테크가 신청자를 골라 드립니다. 선정 대행비가 더해집니다.",
};

export function campaignQuote(rules: AppRules, mode: SelectionMode): { baseFee: number; agencyFee: number; total: number } {
  const agencyFee = mode === "agency" ? rules.advertiser.agencyFee : 0;
  return { baseFee: rules.advertiser.baseFee, agencyFee, total: rules.advertiser.baseFee + agencyFee };
}

/**
 * 후기 검수용 데모 체험단(`DEMO_CAMPAIGNS`)의 광고주. 1단계 W8(Supabase) 뒤에는 `campaigns.advertiser_id` 로 바뀐다.
 * 관리자 대행을 포함한 데모 흐름을 보여 주려고 a1(그린테이블 마케팅)에 후기가 있는 cp8 을 붙였다.
 */
export const DEMO_CAMPAIGN_OWNERS: Record<string, string> = { cp1: "a1", cp2: "a2", cp5: "a1", cp8: "a1" };

export function ownsDemoCampaign(advertiserId: string, campaignId: string): boolean {
  return DEMO_CAMPAIGN_OWNERS[campaignId] === advertiserId;
}
