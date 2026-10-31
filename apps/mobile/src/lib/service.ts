import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSegments } from "expo-router";
import type { ServiceMode } from "@jubutech/shared";

/**
 * 서비스와 탭 — 1단계 W6 "탭 구조 B안":
 * 하단 탭은 **체험단 · 지원금 · 주식 · 커뮤니티 · 마이** 5개 고정(`ROOT_TABS`), 서비스 안 하위 화면(홈·탐색·내 응모 등)은
 * 상단 세그먼트(`SERVICES[].tabs`, PHP `$navs` 에서 마이·커뮤니티를 뺀 것)로 옮겼다. PHP 데모(상단 드롭다운 전환)와 다르므로 팀장과 공유.
 * 라우트 `/campaigns`·`/finance`·`/journal` 가 곧 서비스다 (`(tabs)` 그룹은 URL 에 안 보인다).
 */
export type { ServiceMode };

export interface ServiceTab {
  /** expo-router 화면 이름 (서비스 폴더 안의 파일명 / 루트 탭 이름) */
  name: string;
  label: string;
  icon: string;
  /** PHP 데모의 대응 경로 (참고용) */
  phpPath: string;
}

export interface ServiceMeta {
  key: ServiceMode;
  /** 헤더 제목 */
  name: string;
  /** 하단 탭 라벨 (B안 명칭) */
  shortLabel: string;
  description: string;
  icon: string;
  /** 상단 세그먼트 */
  tabs: ServiceTab[];
}

export const SERVICES: ServiceMeta[] = [
  {
    key: "campaigns",
    name: "체험단 응모",
    shortLabel: "체험단",
    description: "제품 받고 후기 쓰면 리워드",
    icon: "gift",
    tabs: [
      { name: "index", label: "홈", icon: "house", phpPath: "/campaigns" },
      { name: "explore", label: "탐색", icon: "search", phpPath: "/campaigns/explore" },
      { name: "applications", label: "내 응모", icon: "clipboard-check", phpPath: "/applications" },
    ],
  },
  {
    key: "finance",
    name: "재테크 정보",
    shortLabel: "지원금",
    description: "놓치기 쉬운 지원금·혜택 정보",
    icon: "landmark",
    tabs: [
      { name: "index", label: "홈", icon: "house", phpPath: "/finance" },
      { name: "categories", label: "정보", icon: "newspaper", phpPath: "/finance/categories" },
    ],
  },
  {
    key: "journal",
    name: "주식매매일지",
    shortLabel: "주식",
    description: "나의 판단을 돌아보는 일지",
    icon: "notebook-pen",
    tabs: [
      { name: "index", label: "요약", icon: "house", phpPath: "/journal" },
      { name: "entries", label: "일지", icon: "notebook-pen", phpPath: "/journal/entries" },
      { name: "analysis", label: "분석", icon: "chart-no-axes-combined", phpPath: "/journal/analysis" },
    ],
  },
];

/** 하단 5탭 (B안). `community`·`my` 는 서비스와 무관한 공용 탭 */
export const ROOT_TABS: ServiceTab[] = [
  ...SERVICES.map((s) => ({ name: s.key, label: s.shortLabel, icon: s.icon, phpPath: s.tabs[0].phpPath })),
  { name: "community", label: "커뮤니티", icon: "messages-square", phpPath: "/community" },
  { name: "my", label: "마이", icon: "user-round", phpPath: "/mypage" },
];

/** 온보딩에서 고르지 않으면 체험단 (기획안 1-4) */
export const DEFAULT_SERVICE: ServiceMode = "campaigns";
const STORAGE_KEY = "jubutech.service";
const ONBOARDED_KEY = "jubutech.onboarded";

export function isServiceMode(v: unknown): v is ServiceMode {
  return v === "finance" || v === "journal" || v === "campaigns";
}

export function serviceMeta(key: ServiceMode): ServiceMeta {
  return SERVICES.find((s) => s.key === key) ?? SERVICES[0];
}

/** 현재 라우트의 서비스. 서비스 밖(커뮤니티·마이·상세)에서는 기본값. */
export function useService(): ServiceMeta {
  const segments = useSegments() as string[];
  const key = segments.find(isServiceMode);
  return serviceMeta(key ?? DEFAULT_SERVICE);
}

/** 마지막으로 쓴 서비스 — 앱 재시작 시 그 서비스 홈으로 연다. */
export async function loadLastService(): Promise<ServiceMode> {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEY);
    return isServiceMode(v) ? v : DEFAULT_SERVICE;
  } catch {
    return DEFAULT_SERVICE;
  }
}

export function saveLastService(key: ServiceMode): void {
  AsyncStorage.setItem(STORAGE_KEY, key).catch(() => {});
}

/** 첫 실행 온보딩을 마쳤는지 */
export async function loadOnboarded(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDED_KEY)) === "1";
  } catch {
    return false;
  }
}

export function saveOnboarded(done = true): void {
  (done ? AsyncStorage.setItem(ONBOARDED_KEY, "1") : AsyncStorage.removeItem(ONBOARDED_KEY)).catch(() => {});
}
