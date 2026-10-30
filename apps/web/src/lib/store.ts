"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { Application, ApplicationStatus, AuditLog, Campaign, Comment, Notification, PointLog, Post, Report, ReportStatus, Role, Trade, User } from "./types";
import { APPLICATIONS, CAMPAIGNS, COMMENTS, INFO, NOTIFICATIONS, POINT_LOGS, POSTS, REPORTS, TRADES, USERS } from "./mock";
import { DEMO_REVIEWS, type Review, type ReviewStatus } from "@jubutech/shared";

/**
 * 주부테크 데모 스토어 — localStorage에 영속(키 jubutech:demo:v2 — 시드 변경 시 버전을 올린다).
 * Supabase 연결 전까지 이 파일이 API 어댑터 seam이다. (유니웨이 services/api.js 패턴)
 * 서버 렌더는 시드 상태로, 클라이언트는 mount 후 rehydrate → hydration mismatch 없음.
 */
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const DEMO_USER: Record<Exclude<Role, "guest">, string> = { member: "u1", advertiser: "a1", admin: "adm" };

interface State {
  hydrated: boolean;
  role: Role;
  userId: string | null;
  authSource: "demo" | "oauth" | null;
  users: User[];
  posts: Post[];
  comments: Comment[];
  campaigns: Campaign[];
  applications: Application[];
  trades: Trade[];
  notifications: Notification[];
  pointLogs: PointLog[];
  savedInfo: string[];
  bookmarks: string[];
  reports: Report[];
  auditLogs: AuditLog[];
  hiddenInfo: string[];
  monthlyGoal: number;
  notices: { id: string; title: string; body: string; pinned: boolean; createdAt: string }[];
  /** 1-1 후기 검수 대기열 — 체험단 데모 픽스처(`DEMO_REVIEWS`)에서 시작. 모바일 앱의 제출분은 Supabase 연결(W8) 뒤 합쳐진다 */
  reviews: Review[];
}

interface Actions {
  setHydrated: () => void;
  login: (role: Exclude<Role, "guest">) => void;
  loginOAuth: (u: { id: string; name?: string | null; image?: string | null; provider?: string }) => void;
  logout: () => void;
  me: () => User | null;
  addPoints: (amount: number, reason: string) => void;
  // community
  addPost: (p: Omit<Post, "id" | "createdAt" | "likes" | "views" | "commentCount" | "authorId">) => string;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, body: string, parentId?: string) => void;
  toggleBookmark: (postId: string) => void;
  viewPost: (postId: string) => void;
  // info
  toggleSaveInfo: (id: string) => void;
  // campaigns
  apply: (a: Omit<Application, "id" | "createdAt" | "status" | "userId">) => { ok: boolean; message: string };
  cancelApplication: (id: string) => void;
  submitMission: (id: string, url: string) => void;
  createCampaign: (c: Omit<Campaign, "id" | "createdAt" | "applicantIds" | "views" | "advertiserId">) => string;
  updateCampaignStatus: (id: string, status: Campaign["status"]) => void;
  decideApplication: (id: string, status: ApplicationStatus) => void;
  // trades
  addTrade: (t: Omit<Trade, "id" | "createdAt" | "userId">) => string;
  updateTrade: (id: string, patch: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  setMonthlyGoal: (n: number) => void;
  // notifications
  readNotification: (id: string) => void;
  readAllNotifications: () => void;
  reset: () => void;
  // admin
  log: (action: string, target: string, reason?: string) => void;
  adminSetUserRole: (userId: string, role: User["role"]) => void;
  adminSetUserStatus: (userId: string, status: NonNullable<User["status"]>, reason?: string) => void;
  adminSetPostStatus: (postId: string, status: NonNullable<Post["status"]>, reason?: string) => void;
  adminDeletePost: (postId: string, reason?: string) => void;
  adminDeleteComment: (commentId: string, reason?: string) => void;
  adminReviewCampaign: (id: string, approve: boolean, note?: string) => void;
  adminSetCampaignStatus: (id: string, status: Campaign["status"]) => void;
  adminResolveReport: (id: string, status: ReportStatus, note?: string) => void;
  adminGrantPoints: (userId: string, amount: number, reason: string) => void;
  adminToggleInfo: (id: string) => void;
  adminAddNotice: (title: string, body: string, pinned: boolean) => void;
  adminDeleteNotice: (id: string) => void;
  adminForceApplication: (id: string, status: ApplicationStatus) => void;
  /** PHP `admin_review` — 승인·보완 요청·반려(+사유)·별점. 리워드 적립은 W4 에서 연결 */
  adminDecideReview: (id: string, status: ReviewStatus, feedback?: string, rating?: number) => { ok: boolean; message: string };
}

const seed = (): State => ({
  hydrated: false,
  role: "member",
  userId: "u1",
  authSource: "demo",
  users: USERS,
  posts: POSTS,
  comments: COMMENTS,
  campaigns: CAMPAIGNS,
  applications: APPLICATIONS,
  reviews: DEMO_REVIEWS,
  trades: TRADES,
  notifications: NOTIFICATIONS,
  pointLogs: POINT_LOGS,
  savedInfo: ["i1", "i3"],
  bookmarks: ["p2"],
  reports: REPORTS,
  auditLogs: [
    { id: "al1", actorId: "adm", action: "캠페인 승인", target: "cp7 · 동네빵집 르뺑", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "al2", actorId: "adm", action: "신고 처리", target: "r3 · 댓글 도배", reason: "댓글 삭제", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  ],
  hiddenInfo: [],
  monthlyGoal: 300000,
  notices: [
    { id: "nt1", title: "9월 영수증 인증 이벤트 — 7일 연속 시 보너스 500P", body: "9/1~9/30 매일 영수증 1장 인증. 7일 연속 달성 시 보너스 지급.", pinned: true, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: "nt2", title: "커뮤니티 운영 정책 안내 — 선입금·리딩방 홍보 즉시 삭제", body: "허위 부업·선입금 요구·다단계·종목 리딩 홍보는 사전 경고 없이 삭제되며 반복 시 이용이 제한됩니다.", pinned: false, createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  ],
});

const baseStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...seed(),
      setHydrated: () => set({ hydrated: true }),
      login: (role) => set({ role, userId: DEMO_USER[role], authSource: "demo" }),
      loginOAuth: (u) => {
        const exists = get().users.find((x) => x.id === u.id);
        const nickname = (u.name ?? "").trim() || "새 회원";
        set((s) => ({
          userId: u.id,
          role: exists?.role ?? "member",
          authSource: "oauth",
          users: exists
            ? s.users.map((x) => (x.id === u.id ? { ...x, nickname: nickname, image: u.image ?? x.image, provider: u.provider } : x))
            : [...s.users, { id: u.id, name: nickname, nickname, role: "member", region: "", tags: [], points: 1000, level: 1, badges: ["첫 가입"], image: u.image ?? undefined, provider: u.provider, status: "active", joinedAt: new Date().toISOString().slice(0, 10) }],
          pointLogs: exists ? s.pointLogs : [{ id: uid(), userId: u.id, amount: 1000, reason: "가입 축하 포인트", createdAt: now() }, ...s.pointLogs],
        }));
      },
      logout: () => set({ role: "guest", userId: null, authSource: null }),
      me: () => {
        const { userId, users } = get();
        return users.find((u) => u.id === userId) ?? null;
      },
      addPoints: (amount, reason) => {
        const { userId } = get();
        if (!userId) return;
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, points: u.points + amount } : u)),
          pointLogs: [{ id: uid(), userId, amount, reason, createdAt: now() }, ...s.pointLogs],
        }));
      },
      addPost: (p) => {
        const id = "p" + uid();
        const authorId = get().userId ?? "u1";
        set((s) => ({ posts: [{ ...p, id, authorId, createdAt: now(), likes: [], views: 0, commentCount: 0 }, ...s.posts] }));
        get().addPoints(50, "게시글 작성");
        return id;
      },
      toggleLike: (postId) => {
        const me = get().userId;
        if (!me) return;
        set((s) => ({
          posts: s.posts.map((p) => (p.id === postId ? { ...p, likes: p.likes.includes(me) ? p.likes.filter((x) => x !== me) : [...p.likes, me] } : p)),
        }));
      },
      addComment: (postId, body, parentId) => {
        const authorId = get().userId ?? "u1";
        set((s) => ({
          comments: [...s.comments, { id: "c" + uid(), postId, authorId, body, createdAt: now(), parentId }],
          posts: s.posts.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)),
        }));
      },
      toggleBookmark: (postId) => set((s) => ({ bookmarks: s.bookmarks.includes(postId) ? s.bookmarks.filter((x) => x !== postId) : [...s.bookmarks, postId] })),
      viewPost: (postId) => set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, views: p.views + 1 } : p)) })),
      toggleSaveInfo: (id) => {
        const saved = get().savedInfo.includes(id);
        set((s) => ({ savedInfo: saved ? s.savedInfo.filter((x) => x !== id) : [...s.savedInfo, id] }));
        if (!saved) {
          const art = INFO.find((i) => i.id === id);
          if (art) get().addPoints(art.rewardPoints, `정보 저장 · ${art.title.slice(0, 18)}`);
        }
      },
      apply: (a) => {
        const userId = get().userId;
        if (!userId) return { ok: false, message: "로그인 후 응모할 수 있어요." };
        const dup = get().applications.find((x) => x.campaignId === a.campaignId && x.userId === userId && x.status !== "cancelled");
        if (dup) return { ok: false, message: "이미 응모한 캠페인이에요." };
        const app: Application = { ...a, id: "ap" + uid(), userId, status: "pending", createdAt: now() };
        set((s) => ({
          applications: [app, ...s.applications],
          campaigns: s.campaigns.map((c) => (c.id === a.campaignId ? { ...c, applicantIds: [...c.applicantIds, userId] } : c)),
        }));
        return { ok: true, message: "응모가 완료되었어요. 선정 결과는 알림으로 알려드려요." };
      },
      cancelApplication: (id) => {
        const app = get().applications.find((x) => x.id === id);
        if (!app) return;
        set((s) => ({
          applications: s.applications.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)),
          campaigns: s.campaigns.map((c) => (c.id === app.campaignId ? { ...c, applicantIds: c.applicantIds.filter((u) => u !== app.userId) } : c)),
        }));
      },
      submitMission: (id, url) => set((s) => ({ applications: s.applications.map((x) => (x.id === id ? { ...x, status: "submitted", submissionUrl: url } : x)) })),
      createCampaign: (c) => {
        const id = "cp" + uid();
        const advertiserId = get().userId ?? "a1";
        set((s) => ({ campaigns: [{ ...c, id, advertiserId, applicantIds: [], views: 0, createdAt: now() }, ...s.campaigns] }));
        return id;
      },
      updateCampaignStatus: (id, status) => set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status } : c)) })),
      decideApplication: (id, status) => {
        const app = get().applications.find((x) => x.id === id);
        set((s) => ({ applications: s.applications.map((x) => (x.id === id ? { ...x, status } : x)) }));
        if (app && status === "completed") {
          const c = get().campaigns.find((x) => x.id === app.campaignId);
          if (c && c.reward.type !== "product") {
            set((s) => ({
              users: s.users.map((u) => (u.id === app.userId ? { ...u, points: u.points + c.reward.value } : u)),
              pointLogs: [{ id: uid(), userId: app.userId, amount: c.reward.value, reason: `체험단 미션 완료 · ${c.title.slice(0, 16)}`, createdAt: now() }, ...s.pointLogs],
            }));
          }
        }
        if (app && (status === "selected" || status === "rejected")) {
          const c = get().campaigns.find((x) => x.id === app.campaignId);
          set((s) => ({
            notifications: [
              { id: "n" + uid(), userId: app.userId, title: status === "selected" ? `${c?.brand} 체험단에 선정되었어요!` : `${c?.brand} 체험단 결과 안내`, body: status === "selected" ? "미션 기간을 확인해 주세요." : "아쉽지만 이번에는 함께하지 못했어요. 다음 기회에 만나요.", href: `/campaigns/${app.campaignId}`, read: false, createdAt: now() },
              ...s.notifications,
            ],
          }));
        }
      },
      addTrade: (t) => {
        const id = "t" + uid();
        const userId = get().userId ?? "u1";
        set((s) => ({ trades: [{ ...t, id, userId, createdAt: now() }, ...s.trades] }));
        get().addPoints(100, `매매일지 작성 · ${t.name}`);
        return id;
      },
      updateTrade: (id, patch) => set((s) => ({ trades: s.trades.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTrade: (id) => set((s) => ({ trades: s.trades.filter((t) => t.id !== id) })),
      setMonthlyGoal: (n) => set({ monthlyGoal: Math.max(0, Math.round(n)) }),
      readNotification: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      readAllNotifications: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      reset: () => set({ ...seed(), hydrated: true }),
      log: (action, target, reason) => set((s) => ({ auditLogs: [{ id: "al" + uid(), actorId: s.userId ?? "adm", action, target, reason, createdAt: now() }, ...s.auditLogs] })),
      adminSetUserRole: (userId, role) => { set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, role } : u)) })); get().log("역할 변경", `${userId} → ${role}`); },
      adminSetUserStatus: (userId, status, reason) => { set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, status } : u)) })); get().log(status === "suspended" ? "회원 정지" : "정지 해제", userId, reason); },
      adminSetPostStatus: (postId, status, reason) => { set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, status } : p)) })); get().log(status === "hidden" ? "게시글 숨김" : "게시글 복구", postId, reason); },
      adminDeletePost: (postId, reason) => { set((s) => ({ posts: s.posts.filter((p) => p.id !== postId), comments: s.comments.filter((c) => c.postId !== postId) })); get().log("게시글 삭제", postId, reason); },
      adminDeleteComment: (commentId, reason) => {
        const c = get().comments.find((x) => x.id === commentId);
        set((s) => ({ comments: s.comments.filter((x) => x.id !== commentId && x.parentId !== commentId), posts: s.posts.map((p) => (c && p.id === c.postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p)) }));
        get().log("댓글 삭제", commentId, reason);
      },
      adminReviewCampaign: (id, approve, note) => {
        set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status: approve ? "open" : "draft", reviewNote: note } : c)) }));
        const c = get().campaigns.find((x) => x.id === id);
        get().log(approve ? "캠페인 승인" : "캠페인 반려", `${id} · ${c?.title ?? ""}`, note);
        if (c) set((s) => ({ notifications: [{ id: "n" + uid(), userId: c.advertiserId, title: approve ? `캠페인이 승인되어 모집을 시작했어요` : `캠페인이 반려되었어요`, body: note ?? c.title, href: `/advertiser/campaigns/${id}`, read: false, createdAt: now() }, ...s.notifications] }));
      },
      adminSetCampaignStatus: (id, status) => { set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status } : c)) })); get().log("캠페인 상태 변경", `${id} → ${status}`); },
      adminResolveReport: (id, status, note) => { set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status } : r)) })); get().log(status === "resolved" ? "신고 처리" : "신고 기각", id, note); },
      adminGrantPoints: (userId, amount, reason) => {
        set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, points: u.points + amount } : u)), pointLogs: [{ id: uid(), userId, amount, reason: `[운영] ${reason}`, createdAt: now() }, ...s.pointLogs] }));
        get().log(amount >= 0 ? "포인트 지급" : "포인트 차감", `${userId} · ${amount}P`, reason);
      },
      adminToggleInfo: (id) => { const hidden = get().hiddenInfo.includes(id); set((s) => ({ hiddenInfo: hidden ? s.hiddenInfo.filter((x) => x !== id) : [...s.hiddenInfo, id] })); get().log(hidden ? "정보 노출" : "정보 숨김", id); },
      adminAddNotice: (title, body, pinned) => { set((s) => ({ notices: [{ id: "nt" + uid(), title, body, pinned, createdAt: now() }, ...s.notices] })); get().log("공지 등록", title); },
      adminDeleteNotice: (id) => { set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })); get().log("공지 삭제", id); },
      adminForceApplication: (id, status) => { get().decideApplication(id, status); get().log("응모 상태 강제 변경", `${id} → ${status}`); },
      adminDecideReview: (id, status, feedback, rating) => {
        const r = get().reviews.find((x) => x.id === id);
        if (!r) return { ok: false, message: "후기를 찾을 수 없어요." };
        const fb = (feedback ?? "").trim();
        if ((status === "revision" || status === "rejected") && !fb) return { ok: false, message: status === "revision" ? "보완할 내용을 입력해 주세요." : "반려 사유를 입력해 주세요." };
        if (rating !== undefined && (rating < 1 || rating > 5)) return { ok: false, message: "별점은 1~5 사이로 입력해 주세요." };
        set((s) => ({ reviews: s.reviews.map((x) => (x.id === id ? { ...x, status, feedback: fb || undefined, rating: status === "approved" ? rating ?? x.rating : x.rating, reviewedAt: now(), reviewedBy: s.userId ?? "adm" } : x)) }));
        get().log(`후기 검수 ${status}`, id, fb || undefined);
        return { ok: true, message: "후기 검토 상태를 저장했어요." };
      },
    }),
    {
      name: "jubutech:demo:v2",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        const { hydrated, ...rest } = s as State;
        void hydrated;
        return rest as State;
      },
    },
  ),
);

type Store = State & Actions;
/**
 * 셀렉터가 filter/slice/sort로 새 배열을 반환해도 무한 루프가 나지 않도록
 * 모든 구독에 얕은 비교(useShallow)를 적용한 래퍼. getState/persist 등은 그대로 노출.
 */
function useStoreShallow<T = Store>(selector?: (s: Store) => T): T {
  return baseStore(useShallow(selector ?? ((s) => s as unknown as T)));
}
export const useStore = Object.assign(useStoreShallow, baseStore);

/** 현재 사용자 (guest면 null) */
export const useMe = () => useStore((s) => (s.userId ? s.users.find((u) => u.id === s.userId) ?? null : null));
export const useUser = (id: string) => useStore((s) => s.users.find((u) => u.id === id));
