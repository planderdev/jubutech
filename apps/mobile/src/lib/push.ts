import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import type { DemoNotification } from "@jubutech/shared";

/**
 * 푸시 자리 — 지금은 기기 안 알림(로컬)만, 서버 푸시는 스텁.
 * 1단계 W8(Supabase)과 FCM·APNs 키·EAS 빌드가 생기면 `registerPushToken` 결과를 `push_tokens` 에 저장하고, 서버가 같은 알림 객체를 보낸다.
 * Expo Go(SDK 53+)와 웹에는 네이티브 모듈이 없으므로 조용히 건너뛴다.
 */
type Notif = typeof import("expo-notifications");
let mod: Notif | null | undefined;
async function load(): Promise<Notif | null> {
  if (Platform.OS === "web" || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;
  if (mod !== undefined) return mod;
  try {
    mod = await import("expo-notifications");
  } catch {
    mod = null;
  }
  return mod;
}

/** 서버로 토큰을 보내는 자리. 연결 전에는 아무것도 하지 않는다 */
async function sendTokenToServer(_token: string): Promise<void> {
  // TODO(1단계 W8): supabase.from("push_tokens").upsert({ profile_id, token, platform })
}

export async function registerPushToken(): Promise<{ token: string | null; skipped: string | null }> {
  const N = await load();
  if (!N) return { token: null, skipped: "unsupported" };
  try {
    let { status } = await N.getPermissionsAsync();
    if (status !== "granted") ({ status } = await N.requestPermissionsAsync());
    if (status !== "granted") return { token: null, skipped: "denied" };
    const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
    if (!projectId) return { token: null, skipped: "no-eas-project" }; // EAS 프로젝트가 생기기 전
    const { data } = await N.getExpoPushTokenAsync({ projectId });
    await sendTokenToServer(data);
    return { token: data, skipped: null };
  } catch (e) {
    return { token: null, skipped: e instanceof Error ? e.message : "error" };
  }
}

/** 앱 안에서 생긴 이벤트를 기기 알림으로도 띄운다 (서버 푸시 전까지) */
export async function presentLocalNotification(n: Pick<DemoNotification, "title" | "body" | "url">): Promise<void> {
  const N = await load();
  if (!N) return;
  try {
    const { status } = await N.getPermissionsAsync();
    if (status !== "granted") return;
    await N.scheduleNotificationAsync({ content: { title: n.title, body: n.body, data: { url: n.url } }, trigger: null });
  } catch {
    // 알림 실패는 앱 흐름을 막지 않는다
  }
}
