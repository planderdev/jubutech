import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEMO_APPLICATIONS, DEMO_MEMBERS, DEMO_NOW, DEMO_SAVED, demoApplication, demoCampaignState, type DemoApplication, type DemoCampaign, type DemoMember } from "@jubutech/shared";

/**
 * 모바일 데모 상태 — PHP `DemoRepository`(세션 저장)의 역할. Supabase 연결(W8) 전까지의 데이터 어댑터 자리.
 * 회원은 서연맘(m1) 고정. 응모·저장 변경분만 AsyncStorage 에 두고, 나머지는 `DEMO_*` 픽스처를 그대로 읽는다.
 */
const STORAGE_KEY = "jubutech.demo.v1";

interface Persisted {
  applications: DemoApplication[];
  saved: string[];
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
  toggleSaved: (articleId: string) => void;
  reset: () => void;
}

const seed = (): Persisted => ({ applications: DEMO_APPLICATIONS, saved: DEMO_SAVED[DEMO_MEMBERS[0].id] ?? [] });

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
          setState({ applications: parsed.applications ?? DEMO_APPLICATIONS, saved: parsed.saved ?? [] });
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

  const toggleSaved = useCallback<DemoStore["toggleSaved"]>((articleId) => {
    setState((s) => ({ ...s, saved: s.saved.includes(articleId) ? s.saved.filter((x) => x !== articleId) : [...s.saved, articleId] }));
  }, []);

  const reset = useCallback(() => {
    setState(seed());
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<DemoStore>(
    () => ({ ...state, hydrated, member, now: DEMO_NOW, apply, cancelApplication, saveShipping, toggleSaved, reset }),
    [state, hydrated, member, apply, cancelApplication, saveShipping, toggleSaved, reset],
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
