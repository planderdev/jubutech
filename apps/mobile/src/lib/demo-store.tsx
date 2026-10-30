import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_RULES, DEMO_APPLICATIONS, DEMO_CAMPAIGNS, DEMO_MEMBERS, DEMO_NOW, DEMO_REVIEWS, DEMO_SAVED, demoApplication, demoCampaignState, type DemoApplication, type DemoCampaign, type DemoMember, type Review, type ReviewCheck, type ReviewStatus } from "@jubutech/shared";
import { planReviewReminders, syncReviewReminders } from "@/lib/reminders";

/**
 * 모바일 데모 상태 — PHP `DemoRepository`(세션 저장)의 역할. Supabase 연결(W8) 전까지의 데이터 어댑터 자리.
 * 회원은 서연맘(m1) 고정. 응모·저장 변경분만 AsyncStorage 에 두고, 나머지는 `DEMO_*` 픽스처를 그대로 읽는다.
 */
const STORAGE_KEY = "jubutech.demo.v1";

interface Persisted {
  applications: DemoApplication[];
  reviews: Review[];
  saved: string[];
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
  toggleSaved: (articleId: string) => void;
  reset: () => void;
}

const seed = (): Persisted => ({ applications: DEMO_APPLICATIONS, reviews: DEMO_REVIEWS, saved: DEMO_SAVED[DEMO_MEMBERS[0].id] ?? [] });

const Ctx = createContext<DemoStore | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(seed);
  const [hydrated, setHydrated] = useState(false);
  const skipPersist = useRef(true);
  const member = DEMO_MEMBERS[0];

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted>;
          setState({ applications: parsed.applications ?? DEMO_APPLICATIONS, reviews: parsed.reviews ?? DEMO_REVIEWS, saved: parsed.saved ?? [] });
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
    [member.id, state.applications],
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
    setState((s) => ({ ...s, reviews: s.reviews.map((x) => (x.id === reviewId ? { ...x, status, feedback: feedback?.trim() || undefined, reviewedAt: new Date().toISOString(), reviewedBy: "demo" } : x)) }));
  }, []);

  // 후기 기한 로컬 알림 — 상태가 바뀔 때마다 우리 알림을 다시 예약한다 (실패해도 조용히)
  useEffect(() => {
    if (!hydrated) return;
    const mine = state.applications.filter((a) => a.memberId === member.id);
    syncReviewReminders(planReviewReminders(mine, DEMO_CAMPAIGNS, state.reviews, DEFAULT_RULES)).catch(() => {});
  }, [hydrated, state.applications, state.reviews, member.id]);

  const toggleSaved = useCallback<DemoStore["toggleSaved"]>((articleId) => {
    setState((s) => ({ ...s, saved: s.saved.includes(articleId) ? s.saved.filter((x) => x !== articleId) : [...s.saved, articleId] }));
  }, []);

  const reset = useCallback(() => {
    setState(seed());
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<DemoStore>(
    () => ({ ...state, hydrated, member, now: DEMO_NOW, apply, cancelApplication, saveShipping, submitReview, decideReview, toggleSaved, reset }),
    [state, hydrated, member, apply, cancelApplication, saveShipping, submitReview, decideReview, toggleSaved, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo(): DemoStore {
  const v = useContext(Ctx);
  if (!v) throw new Error("DemoProvider 안에서만 useDemo 를 쓸 수 있어요");
  return v;
}

/** 내 응모 (취소 포함, 최신순) */
export function useMyApplications(): DemoApplication[] {
  const { applications, member } = useDemo();
  return useMemo(() => applications.filter((a) => a.memberId === member.id).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)), [applications, member.id]);
}
