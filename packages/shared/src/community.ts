/**
 * 커뮤니티 — PHP `communityList/communityDetail/communityForm` 과 `app/data/fixtures.php` 의 posts·comments 모양.
 * 글 상태: published 공개 · review 검토 대기(운영 도구가 올림) · hidden 숨김 · deleted 작성자 삭제.
 */
import { DEMO_MEMBERS } from "./fixtures";

export const COMMUNITY_TOPICS = ["수익인증", "부업후기", "지원금제보", "주식·재테크", "공구/쇼핑", "자유"] as const;
export type CommunityTopic = (typeof COMMUNITY_TOPICS)[number];

export type PostStatus = "published" | "review" | "hidden" | "deleted";

export interface DemoPost {
  id: string;
  memberId: string;
  topic: CommunityTopic;
  title: string;
  body: string;
  status: PostStatus;
  createdAt: string;
  likes: string[];
  /** 매매일지 복기 공유로 쓴 글이면 원본 일지 id (원본 금액은 공개하지 않는다) */
  sourceJournalId?: string | null;
  /** 숨김·검토 대기로 간 이유 (운영자·작성자에게만) */
  moderationNote?: string;
}

export interface DemoComment {
  id: string;
  postId: string;
  memberId: string;
  body: string;
  status: "published" | "deleted";
  createdAt: string;
  /** "도움됐어요" — 1-2 생활력 `comment_liked` */
  likes: string[];
}

export type DemoReportStatus = "open" | "resolved" | "dismissed";
export interface DemoReport {
  id: string;
  target: "post" | "comment";
  targetId: string;
  reporterId: string;
  reason: string;
  status: DemoReportStatus;
  createdAt: string;
  /** 신고 누적으로 자동 숨김을 일으킨 신고인지 */
  triggeredAutoHide?: boolean;
}

export const DEMO_POSTS: DemoPost[] = [
  { id: "p1", memberId: "m1", topic: "부업후기", title: "등원 후 두 시간, 나만의 작은 루틴이 생겼어요", body: "처음에는 시간을 어떻게 써야 할지 막막했어요. 이제는 관심 있는 체험을 살펴보고 하루의 기록을 남기고 있어요. 작은 일도 꾸준히 해보려고요.", status: "published", createdAt: "2026-10-20T10:00:00+09:00", likes: ["m2"], sourceJournalId: null },
  { id: "p2", memberId: "m3", topic: "주식·재테크", title: "매매일지를 쓰고 달라진 건 수익보다 마음이었어요", body: "종목을 고른 이유를 적으니, 나중에 내 판단을 차분히 돌아볼 수 있었어요. 오늘도 결과보다 과정을 기록해 봅니다.", status: "published", createdAt: "2026-10-19T10:00:00+09:00", likes: ["m1", "m2"], sourceJournalId: null },
  { id: "p3", memberId: "m2", topic: "공구/쇼핑", title: "장보기 전에 냉장고 사진 한 장 찍어보세요", body: "이미 있는 재료를 또 사는 일이 줄었어요. 생각보다 도움이 되는 작은 습관이에요.", status: "published", createdAt: "2026-10-18T10:00:00+09:00", likes: [], sourceJournalId: null },
  { id: "p4", memberId: "m2", topic: "수익인증", title: "체험단 후기 세 건 올리고 이번 달 3천 원 모았어요", body: "큰돈은 아니지만 아이 간식값은 나왔어요. 제품도 받아서 생활비가 조금 줄었고요. 예시 글이에요.", status: "published", createdAt: "2026-10-17T10:00:00+09:00", likes: ["m1", "m3"], sourceJournalId: null },
  { id: "p5", memberId: "m3", topic: "지원금제보", title: "아이돌봄 지원 신청 기간, 공식 안내에서 먼저 확인하세요", body: "지역마다 기간이 달라서 저는 지난번에 놓쳤어요. 공식 안내를 먼저 보고 신청 서류를 챙기면 편해요.", status: "published", createdAt: "2026-10-16T10:00:00+09:00", likes: ["m1"], sourceJournalId: null },
  { id: "p6", memberId: "m1", topic: "자유", title: "오늘 하원 전까지 뭐 하세요?", body: "다들 등원 후 시간을 어떻게 쓰시는지 궁금해요. 저는 후기 사진을 정리하고 있어요.", status: "published", createdAt: "2026-10-15T10:00:00+09:00", likes: [], sourceJournalId: null },
  { id: "p7", memberId: "m2", topic: "부업후기", title: "재택 부업 시작 전에 정산 조건을 꼭 물어보세요", body: "처음 했던 곳은 정산일이 늦어서 고생했어요. 업무 범위와 정산일을 먼저 확인하는 습관이 생겼어요.", status: "published", createdAt: "2026-10-14T10:00:00+09:00", likes: ["m3"], sourceJournalId: null },
];

export const DEMO_COMMENTS: DemoComment[] = [
  { id: "cm1", postId: "p1", memberId: "m2", body: "저도 작은 습관부터 시작해 볼게요.", status: "published", createdAt: "2026-10-20T12:00:00+09:00", likes: [] },
  { id: "cm2", postId: "p2", memberId: "m1", body: "저도 이유를 적기 시작하니 조급함이 줄었어요.", status: "published", createdAt: "2026-10-19T15:00:00+09:00", likes: ["m3"] },
  { id: "cm3", postId: "p4", memberId: "m3", body: "어떤 체험이었는지 궁금해요!", status: "published", createdAt: "2026-10-17T20:00:00+09:00", likes: [] },
];

/** 검토용: p3 은 이미 2명이 신고한 글 — 한 명 더 신고하면 `report.autoHideCount`(초안 3명)에 닿아 자동 숨김 */
export const DEMO_REPORTS: DemoReport[] = [
  { id: "rp1", target: "post", targetId: "p3", reporterId: "m3", reason: "광고 같아요", status: "open", createdAt: "2026-10-20T09:00:00+09:00" },
  { id: "rp2", target: "post", targetId: "p3", reporterId: "m4", reason: "같은 글을 반복해서 봤어요", status: "open", createdAt: "2026-10-20T18:00:00+09:00" },
];

export function demoMemberName(id: string): string {
  return DEMO_MEMBERS.find((m) => m.id === id)?.nickname ?? "탈퇴 회원";
}

/** 공개 글 (최신순) — 주제가 있으면 걸러서 */
export function visiblePosts(posts: DemoPost[], topic = ""): DemoPost[] {
  return posts.filter((p) => p.status === "published" && (!topic || p.topic === topic)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function postComments(comments: DemoComment[], postId: string): DemoComment[] {
  return comments.filter((c) => c.postId === postId && c.status === "published").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function myPosts(posts: DemoPost[], memberId: string): DemoPost[] {
  return posts.filter((p) => p.memberId === memberId && p.status !== "deleted").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const POST_FORM_NOTICE = { title: "전체 공개 게시글", body: "제목·본문·닉네임이 커뮤니티에 공개됩니다. 원본 매매일지와 금액은 공개하지 않아요.", income: "수익 인증은 작성자의 이야기이며 플랫폼이 검증한 수익이 아니에요." };
