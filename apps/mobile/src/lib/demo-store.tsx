import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEMO_APPLICATIONS, DEMO_CAMPAIGNS, DEMO_COMMENTS, DEMO_INVITE_CODES, DEMO_JOURNALS, DEMO_JOURNAL_GOALS, DEMO_MEMBERS, DEMO_NOW, DEMO_POINTS, DEMO_POSTS, DEMO_REPORTS, DEMO_REVIEWS, DEMO_SAVED, DEMO_TRUST_EVENTS, REDEEM_MESSAGE, applyBlockedUntil, campaignGradeGate, demoApplication, demoCampaignState, ensureInviteCode, hasTrustEvent, makeTrustEvent, redeemInviteCode, resolveRules, trustScore, TRUST_GRADE_LABEL, type CommunityTopic, type DemoApplication, type DemoJournal, type JournalInput, type DemoCampaign, type DemoComment, type DemoMember, type DemoPoint, type DemoPost, type DemoReport, type AppRules, type InviteCode, type Review, type RuleKey, type ReviewCheck, type ReviewStatus, type TrustEvent } from "@jubutech/shared";
import { planReviewReminders, syncReviewReminders } from "@/lib/reminders";

/**
 * 모바일 데모 상태 — PHP `DemoRepository`(세션 저장)의 역할. Supabase 연결(W8) 전까지의 데이터 어댑터 자리.
 * 회원은 서연맘(m1) 고정. 응모·저장 변경분만 AsyncStorage 에 두고, 나머지는 `DEMO_*` 픽스처를 그대로 읽는다.
 */
const STORAGE_KEY = "jubutech.demo.v1";

interface Persisted {
  applications: DemoApplication[];
  reviews: Review[];
  /** 1-3 지갑 내역 (원 = P). 후기 승인 시 `reward.reviewAmount` 가 여기 쌓인다 */
  points: DemoPoint[];
  saved: string[];
  /** 2-3 초대 코드 (내 코드 + 데모 회원 코드). 사용 기록은 `uses` 에 */
  inviteCodes: InviteCode[];
  /** 1-2 생활력 변동 이력 — 사용자에게는 `rules.trust.visibleToUsers` 일 때만 보인다 */
  trustEvents: TrustEvent[];
  /** 커뮤니티 (2단계 W1) */
  posts: DemoPost[];
  comments: DemoComment[];
  reports: DemoReport[];
  /** 매매일지 (2단계 W3) — 나만 본다 */
  journals: DemoJournal[];
  /** 월(YYYY-MM)별 기록 목표 일수 */
  journalGoals: Record<string, number>;
  /** 운영 규칙 덮어쓰기 — 1단계 W8(Supabase) 뒤에는 `app_settings` 를 읽는 자리. 지금은 기기 안 검토용 */
  ruleOverrides: Partial<Record<RuleKey, unknown>>;
}

export interface ReviewInput {
  url: string;
  content: string;
  photoCount: number;
  check: ReviewCheck;
}

export interface ApplyInput {
  campaignId: string;
  nickname: string;
  contact: string;
  channelUrl: string;
  reason: string;
  extra: string[];
  optionalConsent: boolean;
}

interface DemoStore extends Persisted {
  hydrated: boolean;
  rules: AppRules;
  setRuleOverride: (key: RuleKey, value: unknown) => void;
  member: DemoMember;
  now: string;
  /** PHP actions.php `apply` — 검증은 화면에서 끝내고 여기서는 중복·모집 상태만 다시 본다 */
  apply: (c: DemoCampaign, input: ApplyInput) => { ok: true; id: string } | { ok: false; message: string };
  cancelApplication: (id: string) => { ok: boolean; message: string };
  saveShipping: (id: string, shipping: { recipient: string; address: string }) => void;
  /** PHP actions.php `submit_review` — 선정 건만, 승인·반려 뒤에는 불가. 보완 요청이면 같은 레코드를 pending 으로 되돌린다 */
  submitReview: (applicationId: string, input: ReviewInput) => { ok: true; id: string; message: string } | { ok: false; message: string };
  /** PHP `admin_review` 의 자리 — 관리자(admin7)가 할 일을 데모 확인용으로 기기에서 흉내 낸다 */
  decideReview: (reviewId: string, status: ReviewStatus, feedback?: string) => void;
  /** 내 초대 코드 (없으면 만들어 저장) */
  myInviteCode: () => InviteCode;
  /** 초대 코드 입력 — 양쪽 보너스는 `rules.invite.bonus` 에 따라 W5(생활력)/선정(우선권)에서 반영 */
  redeemInvite: (input: string) => { ok: boolean; message: string };
  /** 내가 쓴 초대 코드 */
  usedInviteCode: () => InviteCode | undefined;
  toggleSaved: (articleId: string) => void;
  /** PHP actions.php `save_post` — id 가 있으면 수정 */
  savePost: (input: { id?: string; topic: CommunityTopic; title: string; body: string; sourceJournalId?: string | null }) => { ok: true; id: string; message: string } | { ok: false; message: string };
  deletePost: (id: string) => void;
  togglePostLike: (id: string) => void;
  addComment: (postId: string, body: string) => { ok: boolean; message: string };
  deleteComment: (id: string) => void;
  /** "도움됐어요" — 처음 받을 때 작성자에게 생활력 `comment_liked` */
  toggleCommentLike: (id: string) => void;
  reportPost: (postId: string, reason: string) => { ok: boolean; message: string };
  /** PHP actions.php `save_journal` — 검증은 화면에서 `validateJournal` 로 끝낸다 */
  saveJournal: (input: { id?: string; input: JournalInput; draft: boolean }) => { id: string };
  deleteJournal: (id: string) => void;
  setJournalGoal: (month: string, days: number) => void;
  reset: () => void;
}

const seed = (): Persisted => ({ applications: DEMO_APPLICATIONS, reviews: DEMO_REVIEWS, points: DEMO_POINTS, saved: DEMO_SAVED[DEMO_MEMBERS[0].id] ?? [], inviteCodes: DEMO_INVITE_CODES, trustEvents: DEMO_TRUST_EVENTS, posts: DEMO_POSTS, comments: DEMO_COMMENTS, reports: DEMO_REPORTS, journals: DEMO_JOURNALS, journalGoals: DEMO_JOURNAL_GOALS[DEMO_MEMBERS[0].id] ?? {}, ruleOverrides: {} });

const Ctx = createContext<DemoStore | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(seed);
  const [hydrated, setHydrated] = useState(false);
  const skipPersist = useRef(true);
  const member = DEMO_MEMBERS[0];
  const rules = useMemo(() => resolveRules(state.ruleOverrides), [state.ruleOverrides]);
  const rulesRef = useRef(rules);
  rulesRef.current = rules;

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted>;
          setState({ ...seed(), ...parsed }); // 저장본에 없는 새 키는 시드값
        }
      })
      .catch(() => {})
      .finally(() => alive && setHydrated(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const apply = useCallback<DemoStore["apply"]>(
    (c, input) => {
      if (demoCampaignState(c, DEMO_NOW) !== "open") return { ok: false, message: "현재 응모할 수 없는 캠페인이에요." };
      // 1-2: 후기 기한 초과 뒤 `penalty.lateBlockDays` 동안 응모 제한
      const blocked = applyBlockedUntil(state.trustEvents, rulesRef.current, member.id, DEMO_NOW);
      if (blocked) return { ok: false, message: `후기 기한을 넘긴 적이 있어 ${new Date(blocked).getMonth() + 1}월 ${new Date(blocked).getDate()}일까지 응모할 수 없어요.` };
      // 1-2: 고가 체험 등급 제한 — 노출을 켠 뒤에만
      const gate = campaignGradeGate(c, trustScore(state.trustEvents, member.id), rulesRef.current);
      if (gate) return { ok: false, message: `이 체험은 ${rulesRef.current.trust.name} '${TRUST_GRADE_LABEL[gate]}' 등급부터 응모할 수 있어요.` };
      const already = demoApplication(member.id, c.id, state.applications);
      if (already) return { ok: false, message: "이미 응모한 캠페인이에요." };
      const id = `a${Date.now().toString(36)}`;
      const next: DemoApplication = {
        id,
        campaignId: c.id,
        memberId: member.id,
        answers: { nickname: input.nickname.trim(), contact: input.contact.trim(), channelUrl: input.channelUrl.trim(), reason: input.reason.trim(), extra: input.extra.map((v) => v.trim()) },
        consentRecords: { required: true, optional: input.optionalConsent, version: "review-draft-1" },
        selectionStatus: "applied",
        appliedAt: DEMO_NOW,
        shipping: null,
      };
      setState((s) => ({ ...s, applications: [next, ...s.applications] }));
      return { ok: true, id };
    },
    [member.id, state.applications, state.trustEvents],
  );

  const cancelApplication = useCallback<DemoStore["cancelApplication"]>(
    (id) => {
      const a = state.applications.find((x) => x.id === id);
      if (!a || a.selectionStatus !== "applied") return { ok: false, message: "모집 중인 신청 완료 건만 취소할 수 있어요." };
      setState((s) => ({ ...s, applications: s.applications.map((x) => (x.id === id ? { ...x, selectionStatus: "cancelled" } : x)) }));
      return { ok: true, message: "응모를 취소했어요." };
    },
    [state.applications],
  );

  const saveShipping = useCallback<DemoStore["saveShipping"]>((id, shipping) => {
    setState((s) => ({ ...s, applications: s.applications.map((x) => (x.id === id ? { ...x, shipping: { recipient: shipping.recipient.trim(), address: shipping.address.trim() } } : x)) }));
  }, []);

  const submitReview = useCallback<DemoStore["submitReview"]>(
    (applicationId, input) => {
      const a = state.applications.find((x) => x.id === applicationId && x.memberId === member.id);
      const r = state.reviews.find((x) => x.applicationId === applicationId);
      if (!a || a.selectionStatus !== "selected" || (r && (r.status === "approved" || r.status === "rejected"))) return { ok: false, message: "후기 제출 대상이 아니에요." };
      const url = input.url.trim();
      const content = input.content.trim();
      if (r && r.status === "pending" && (r.url ?? "") === url && (r.content ?? "") === content) return { ok: false, message: "이미 제출한 후기예요. 검토 결과를 기다려 주세요." };
      const submittedAt = new Date().toISOString();
      const next: Review = { id: r?.id ?? `r${Date.now().toString(36)}`, applicationId, url: url || undefined, content: content || undefined, photoCount: input.photoCount, check: input.check, status: "pending", feedback: undefined, submittedAt };
      setState((s) => ({ ...s, reviews: r ? s.reviews.map((x) => (x.id === r.id ? next : x)) : [next, ...s.reviews] }));
      return { ok: true, id: next.id, message: "후기를 제출했어요. 검토 결과를 기다려 주세요." };
    },
    [member.id, state.applications, state.reviews],
  );

  const decideReview = useCallback<DemoStore["decideReview"]>((reviewId, status, feedback) => {
    setState((s) => {
      const reviews = s.reviews.map((x) => (x.id === reviewId ? { ...x, status, feedback: feedback?.trim() || undefined, reviewedAt: new Date().toISOString(), reviewedBy: "demo" } : x));
      const r = reviews.find((x) => x.id === reviewId);
      let points = s.points;
      let trustEvents = s.trustEvents;
      // 1-2: 승인 = 생활력 `reviewApproved` (후기당 한 번)
      if (r && status === "approved" && !hasTrustEvent(s.trustEvents, "review_approved", "review", r.id)) {
        const a0 = s.applications.find((x) => x.id === r.applicationId);
        trustEvents = [makeTrustEvent(rulesRef.current, "review_approved", a0?.memberId ?? member.id, DEMO_NOW, { refType: "review", refId: r.id, note: "후기 승인" }), ...trustEvents];
      }
      // 1-3: 후기 승인 1건 = `reward.reviewAmount` 적립 (같은 후기에 두 번 쌓지 않는다) + 받은 제품 가치를 따로 기록
      if (r && status === "approved" && !s.points.some((p) => p.refType === "review" && p.refId === r.id)) {
        const a = s.applications.find((x) => x.id === r.applicationId);
        const c = a ? DEMO_CAMPAIGNS.find((x) => x.id === a.campaignId) : undefined;
        const createdAt = DEMO_NOW; // 데모 시계(DEMO_NOW) 기준 — 지갑의 "오늘 번 돈" 과 맞춘다 (apply 의 appliedAt 과 같은 규칙)
        points = [{ id: `pt${Date.now().toString(36)}`, memberId: a?.memberId ?? member.id, amount: rulesRef.current.reward.reviewAmount, kind: "review", reason: `후기 리워드 · ${c?.brand ?? "체험단"}`, refType: "review", refId: r.id, createdAt }, ...points];
        if (c && c.benefitValue && c.benefitValue > 0 && !s.points.some((p) => p.refType === "campaign" && p.refId === c.id && p.memberId === (a?.memberId ?? member.id)))
          points = [{ id: `pv${Date.now().toString(36)}`, memberId: a?.memberId ?? member.id, amount: c.benefitValue, kind: "product_value", reason: `받은 제품 · ${c.benefit}`, refType: "campaign", refId: c.id, createdAt }, ...points];
      }
      return { ...s, reviews, points, trustEvents };
    });
  }, [member.id]);

  const myInviteCode = useCallback<DemoStore["myInviteCode"]>(() => {
    const r = ensureInviteCode(state.inviteCodes, member.id, DEMO_NOW);
    if (r.created) setState((s) => ({ ...s, inviteCodes: ensureInviteCode(s.inviteCodes, member.id, DEMO_NOW).codes }));
    return r.code;
  }, [state.inviteCodes, member.id]);

  const redeemInvite = useCallback<DemoStore["redeemInvite"]>(
    (input) => {
      const r = redeemInviteCode(state.inviteCodes, input, member.id, DEMO_NOW);
      if (!r.ok) return { ok: false, message: REDEEM_MESSAGE[r.reason] };
      setState((s) => {
        let trustEvents = s.trustEvents;
        if (rulesRef.current.invite.bonus === "trust")
          trustEvents = [
            makeTrustEvent(rulesRef.current, "invite_bonus", member.id, DEMO_NOW, { refType: "invite", refId: r.code.code, note: "초대받아 가입" }),
            makeTrustEvent(rulesRef.current, "invite_bonus", r.code.ownerId, DEMO_NOW, { refType: "invite", refId: r.code.code, note: `${member.nickname} 초대` }),
            ...trustEvents,
          ];
        return { ...s, inviteCodes: r.codes, trustEvents };
      });
      return { ok: true, message: `${r.code.code} 적용! 가입 보너스는 첫 체험단 응모 때 반영돼요.` };
    },
    [state.inviteCodes, member.id],
  );

  const usedInviteCode = useCallback<DemoStore["usedInviteCode"]>(() => state.inviteCodes.find((c) => c.uses.some((u) => u.userId === member.id)), [state.inviteCodes, member.id]);

  // 후기 기한 로컬 알림 — 상태가 바뀔 때마다 우리 알림을 다시 예약한다 (실패해도 조용히)
  useEffect(() => {
    if (!hydrated) return;
    const mine = state.applications.filter((a) => a.memberId === member.id);
    syncReviewReminders(planReviewReminders(mine, DEMO_CAMPAIGNS, state.reviews, rules)).catch(() => {});
  }, [hydrated, state.applications, state.reviews, member.id, rules]);

  const toggleSaved = useCallback<DemoStore["toggleSaved"]>((articleId) => {
    setState((s) => ({ ...s, saved: s.saved.includes(articleId) ? s.saved.filter((x) => x !== articleId) : [...s.saved, articleId] }));
  }, []);

  const savePost = useCallback<DemoStore["savePost"]>(
    (input) => {
      const title = input.title.trim();
      const body = input.body.trim();
      if (!title) return { ok: false, message: "제목을 적어 주세요." };
      if (!body) return { ok: false, message: "내용을 적어 주세요." };
      const old = input.id ? state.posts.find((p) => p.id === input.id && p.memberId === member.id) : undefined;
      if (input.id && !old) return { ok: false, message: "수정할 수 없는 글이에요." };
      const id = old?.id ?? `p${Date.now().toString(36)}`;
      const next: DemoPost = old ? { ...old, topic: input.topic, title, body } : { id, memberId: member.id, topic: input.topic, title, body, status: "published", createdAt: DEMO_NOW, likes: [], sourceJournalId: input.sourceJournalId ?? null };
      setState((s) => ({ ...s, posts: old ? s.posts.map((p) => (p.id === id ? next : p)) : [next, ...s.posts] }));
      return { ok: true, id, message: "이야기를 게시했어요." };
    },
    [state.posts, member.id],
  );

  const deletePost = useCallback<DemoStore["deletePost"]>((id) => {
    setState((s) => ({ ...s, posts: s.posts.map((p) => (p.id === id && p.memberId === member.id ? { ...p, status: "deleted" } : p)) }));
  }, [member.id]);

  const togglePostLike = useCallback<DemoStore["togglePostLike"]>((id) => {
    setState((s) => ({ ...s, posts: s.posts.map((p) => (p.id === id ? { ...p, likes: p.likes.includes(member.id) ? p.likes.filter((x) => x !== member.id) : [...p.likes, member.id] } : p)) }));
  }, [member.id]);

  const addComment = useCallback<DemoStore["addComment"]>((postId, body) => {
    const text = body.trim();
    if (!text) return { ok: false, message: "댓글 내용을 적어 주세요." };
    setState((s) => ({ ...s, comments: [...s.comments, { id: `cm${Date.now().toString(36)}`, postId, memberId: member.id, body: text, status: "published", createdAt: DEMO_NOW, likes: [] }] }));
    return { ok: true, message: "댓글을 남겼어요." };
  }, [member.id]);

  const deleteComment = useCallback<DemoStore["deleteComment"]>((id) => {
    setState((s) => ({ ...s, comments: s.comments.map((c) => (c.id === id && c.memberId === member.id ? { ...c, status: "deleted" } : c)) }));
  }, [member.id]);

  const toggleCommentLike = useCallback<DemoStore["toggleCommentLike"]>((id) => {
    setState((s) => {
      const c = s.comments.find((x) => x.id === id);
      if (!c || c.memberId === member.id) return s;
      const on = !c.likes.includes(member.id);
      const comments = s.comments.map((x) => (x.id === id ? { ...x, likes: on ? [...x.likes, member.id] : x.likes.filter((m) => m !== member.id) } : x));
      // 1-2: 답글 좋아요 = 생활력 조금 (좋아요를 누른 사람·댓글마다 한 번)
      const refId = `${id}:${member.id}`;
      const trustEvents = on && !hasTrustEvent(s.trustEvents, "comment_liked", "comment", refId) ? [makeTrustEvent(rulesRef.current, "comment_liked", c.memberId, DEMO_NOW, { refType: "comment", refId, note: "도움된 답글" }), ...s.trustEvents] : s.trustEvents;
      return { ...s, comments, trustEvents };
    });
  }, [member.id]);

  const reportPost = useCallback<DemoStore["reportPost"]>((postId, reason) => {
    const text = reason.trim();
    if (!text) return { ok: false, message: "신고 사유를 적어 주세요." };
    if (state.reports.some((r) => r.target === "post" && r.targetId === postId && r.reporterId === member.id)) return { ok: false, message: "이미 신고한 글이에요. 운영팀이 확인하고 있어요." };
    setState((s) => ({ ...s, reports: [{ id: `rp${Date.now().toString(36)}`, target: "post", targetId: postId, reporterId: member.id, reason: text, status: "open", createdAt: DEMO_NOW }, ...s.reports] }));
    return { ok: true, message: "신고를 접수했어요. 운영팀이 확인할게요." };
  }, [state.reports, member.id]);

  const saveJournal = useCallback<DemoStore["saveJournal"]>(({ id, input, draft }) => {
    const num = (v: string) => Number(v || 0);
    const newId = id ?? `j${Date.now().toString(36)}`;
    const next: DemoJournal = { ...input, id: newId, memberId: member.id, market: "KR", tradeDate: input.tradeDate || DEMO_NOW.slice(0, 10), stockName: input.stockName.trim(), symbol: input.symbol.trim(), unitPrice: num(input.unitPrice), quantity: num(input.quantity), fee: num(input.fee), tax: num(input.tax), targetPrice: num(input.targetPrice), stopLossPrice: num(input.stopLossPrice), checklistTemplateVersion: 1, draftStatus: draft ? "draft" : "complete" };
    setState((s) => ({ ...s, journals: s.journals.some((j) => j.id === newId) ? s.journals.map((j) => (j.id === newId ? next : j)) : [next, ...s.journals] }));
    return { id: newId };
  }, [member.id]);

  const deleteJournal = useCallback<DemoStore["deleteJournal"]>((id) => {
    setState((s) => ({ ...s, journals: s.journals.filter((j) => !(j.id === id && j.memberId === member.id)) }));
  }, [member.id]);

  const setJournalGoal = useCallback<DemoStore["setJournalGoal"]>((month, days) => {
    setState((s) => ({ ...s, journalGoals: { ...s.journalGoals, [month]: days } }));
  }, []);

  const setRuleOverride = useCallback<DemoStore["setRuleOverride"]>((key, value) => {
    setState((s) => ({ ...s, ruleOverrides: { ...s.ruleOverrides, [key]: value } }));
  }, []);

  const reset = useCallback(() => {
    setState(seed());
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<DemoStore>(
    () => ({ ...state, hydrated, rules, setRuleOverride, member, now: DEMO_NOW, apply, cancelApplication, saveShipping, submitReview, decideReview, myInviteCode, redeemInvite, usedInviteCode, toggleSaved, savePost, deletePost, togglePostLike, addComment, deleteComment, toggleCommentLike, reportPost, saveJournal, deleteJournal, setJournalGoal, reset }),
    [state, hydrated, rules, setRuleOverride, member, apply, cancelApplication, saveShipping, submitReview, decideReview, myInviteCode, redeemInvite, usedInviteCode, toggleSaved, savePost, deletePost, togglePostLike, addComment, deleteComment, toggleCommentLike, reportPost, saveJournal, deleteJournal, setJournalGoal, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo(): DemoStore {
  const v = useContext(Ctx);
  if (!v) throw new Error("DemoProvider 안에서만 useDemo 를 쓸 수 있어요");
  return v;
}

/** 현재 운영 규칙 (코드 기본값 + 덮어쓰기) */
export function useRules(): AppRules {
  return useDemo().rules;
}

/** 내 응모 (취소 포함, 최신순) */
export function useMyApplications(): DemoApplication[] {
  const { applications, member } = useDemo();
  return useMemo(() => applications.filter((a) => a.memberId === member.id).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)), [applications, member.id]);
}
