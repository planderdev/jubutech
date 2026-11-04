/** 공지사항 — PHP `app/data/fixtures.php` notices + 운영 정책 안내. 1단계 W8(Supabase) 뒤에는 `notices` 테이블 */
export interface DemoNotice { id: string; title: string; body: string; pinned: boolean; createdAt: string }

export const DEMO_NOTICES: DemoNotice[] = [
  { id: "n1", title: "주부테크 데모에 오신 것을 환영해요", body: "재테크 정보, 투자 기록, 체험단을 오갈 수 있어요. 이 공간의 회원·캠페인·보상은 화면 검토를 위한 가상 데이터입니다.", pinned: true, createdAt: "2026-10-21" },
  { id: "n2", title: "커뮤니티 운영 정책 안내", body: "허위 부업·선입금 요구·종목 리딩 홍보는 운영 정책으로 가려질 수 있어요. 여러 분이 신고한 글은 우선 가린 뒤 운영팀이 확인합니다.", pinned: false, createdAt: "2026-10-20" },
];

export type InquiryCategory = "campaign" | "reward" | "account" | "partner" | "etc";
export const INQUIRY_CATEGORIES: { key: InquiryCategory; label: string }[] = [
  { key: "campaign", label: "체험단" },
  { key: "reward", label: "리워드·출금" },
  { key: "account", label: "계정" },
  { key: "partner", label: "제휴" },
  { key: "etc", label: "기타" },
];
export interface Inquiry { id: string; memberId: string; category: InquiryCategory; body: string; status: "open" | "answered"; createdAt: string }
