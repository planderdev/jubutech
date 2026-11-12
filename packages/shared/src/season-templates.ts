/**
 * 3-1 연말 광고 패키지 — 광고주가 등록할 때 고르기만 하면 되는 미션 카드 예시. 금액은 넣지 않는다(가격은 `advertiser.*`).
 */
import type { CampaignCategory, ChannelType, MissionCard } from "./types";

export interface CampaignTemplate {
  id: string;
  label: string;
  /** 어느 패키지인지 — 제안서 표기와 맞춘다 */
  pack: "연말 시즌" | "제주 로컬" | "배송형";
  desc: string;
  category: CampaignCategory;
  channels: ChannelType[];
  missions: string[];
  requirements: string[];
  keywords: string[];
  mission: Omit<MissionCard, "requiredKeywords"> ;
  /** 지역을 꼭 적어야 하는 방문형인지 */
  needsRegion?: boolean;
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "year-end-gift", label: "연말 선물", pack: "연말 시즌", desc: "선물 고르는 과정과 받은 반응을 담아요.", category: "living", channels: ["instagram", "blog"],
    missions: ["선물을 고른 이유와 받는 사람을 소개해 주세요 (자녀 얼굴·실명 제외)", "포장을 뜯는 순간부터 쓰는 모습까지 사진으로 남겨 주세요"], requirements: ["공개 계정", "제품 제공 사실을 게시물에 표시"], keywords: ["연말선물", "크리스마스선물"],
    mission: { photoCount: 4, minChars: 500, hashtags: ["연말선물", "주부테크", "협찬"], dueDays: 14 },
  },
  {
    id: "year-end-party", label: "연말 집들이", pack: "연말 시즌", desc: "집에서 차리는 연말 상차림 체험이에요.", category: "food", channels: ["instagram"],
    missions: ["연말 상차림에 제품을 쓴 장면을 보여 주세요", "준비 시간과 함께 먹은 사람의 반응을 적어 주세요"], requirements: ["공개 계정", "제품 제공 사실을 게시물에 표시"], keywords: ["연말집들이", "홈파티"],
    mission: { photoCount: 3, minChars: 300, hashtags: ["연말집들이", "주부테크", "협찬"], dueDays: 10 },
  },
  {
    id: "winter-living", label: "겨울 생활용품", pack: "연말 시즌", desc: "난방비·건조함처럼 겨울 살림의 고민을 풀어요.", category: "living", channels: ["blog"],
    missions: ["일주일 이상 쓴 뒤 달라진 점을 적어 주세요", "쓰기 전과 뒤를 비교할 수 있는 사진을 올려 주세요"], requirements: ["공개 블로그", "제품 제공 사실을 게시물에 표시"], keywords: ["겨울살림", "난방비절약"],
    mission: { photoCount: 5, minChars: 800, hashtags: ["겨울살림", "주부테크", "협찬"], dueDays: 21 },
  },
  {
    id: "jeju-local", label: "제주 로컬 방문", pack: "제주 로컬", desc: "제주 주부가 직접 방문하는 식당·매장 체험이에요.", category: "local", channels: ["instagram", "receipt"],
    missions: ["방문한 날짜와 메뉴를 적어 주세요", "매장 분위기와 대표 메뉴 사진을 올려 주세요", "지도에 영수증 후기를 남겨 주세요"], requirements: ["제주 거주", "방문 후 7일 안에 게시"], keywords: ["제주맛집", "제주주부"],
    mission: { photoCount: 3, minChars: 300, hashtags: ["제주", "주부테크", "협찬"], dueDays: 7 }, needsRegion: true,
  },
  {
    id: "delivery-living", label: "배송형 생활용품", pack: "배송형", desc: "집으로 받아 쓰는 생활용품 체험이에요. 제주·도서 지역도 포함해요.", category: "living", channels: ["instagram", "blog"],
    missions: ["받은 날짜와 포장 상태를 적어 주세요", "실제 쓰는 장면을 사진으로 남겨 주세요"], requirements: ["공개 계정", "제품 제공 사실을 게시물에 표시"], keywords: ["생활용품", "살림템"],
    mission: { photoCount: 3, minChars: 500, hashtags: ["살림템", "주부테크", "협찬"], dueDays: 14 },
  },
];
