import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSegments } from "expo-router";
import type { ServiceMode } from "@jubutech/shared";

/**
 * 서비스 전환 — PHP 데모 `app/layouts/user.php`의 `$modes`·`$navs`와 같은 구성.
 * 라우트 1단계 세그먼트(`/finance`·`/journal`·`/campaigns`)가 곧 현재 서비스다.
 */
export type { ServiceMode };

export interface ServiceTab {
  /** expo-router 화면 이름 (각 서비스 그룹 폴더 안의 파일명) */
  name: string;
  label: string;
  icon: string;
  /** PHP 데모의 대응 경로 (참고용) */
  phpPath: string;
}

export interface ServiceMeta {
  key: ServiceMode;
  name: string;
  description: string;
  icon: string;
  tabs: ServiceTab[];
}

export const SERVICES: ServiceMeta[] = [
  {
    key: "finance",
    name: "재테크 정보",
    description: "생활에 도움 되는 돈 이야기",
    icon: "wallet",
    tabs: [
      { name: "index", label: "홈", icon: "house", phpPath: "/finance" },
      { name: "categories", label: "정보", icon: "newspaper", phpPath: "/finance/categories" },
      { name: "community", label: "커뮤니티", icon: "messages-square", phpPath: "/community" },
      { name: "my", label: "마이", icon: "user-round", phpPath: "/mypage?mode=finance" },
    ],
  },
  {
    key: "journal",
    name: "주식매매일지",
    description: "나의 투자 과정을 기록해요",
    icon: "notebook-pen",
    tabs: [
      { name: "index", label: "요약", icon: "house", phpPath: "/journal" },
      { name: "entries", label: "일지", icon: "notebook-pen", phpPath: "/journal/entries" },
      { name: "analysis", label: "분석", icon: "chart-no-axes-combined", phpPath: "/journal/analysis" },
      { name: "my", label: "마이", icon: "user-round", phpPath: "/mypage?mode=journal" },
    ],
  },
  {
    key: "campaigns",
    name: "체험단 응모",
    description: "관심 있는 체험을 찾아보세요",
    icon: "gift",
    tabs: [
      { name: "index", label: "홈", icon: "house", phpPath: "/campaigns" },
      { name: "explore", label: "탐색", icon: "search", phpPath: "/campaigns/explore" },
      { name: "applications", label: "내 응모", icon: "clipboard-check", phpPath: "/applications" },
      { name: "my", label: "마이", icon: "user-round", phpPath: "/mypage?mode=campaigns" },
    ],
  },
];

export const DEFAULT_SERVICE: ServiceMode = "finance";
const STORAGE_KEY = "jubutech.service";

export function isServiceMode(v: unknown): v is ServiceMode {
  return v === "finance" || v === "journal" || v === "campaigns";
}

export function serviceMeta(key: ServiceMode): ServiceMeta {
  return SERVICES.find((s) => s.key === key) ?? SERVICES[0];
}

/** 현재 라우트의 서비스. 서비스 그룹 밖(루트 index 등)에서는 기본값. */
export function useService(): ServiceMeta {
  const [first] = useSegments();
  return serviceMeta(isServiceMode(first) ? first : DEFAULT_SERVICE);
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
