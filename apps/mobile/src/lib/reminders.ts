import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { DEFAULT_RULES, reviewReminderText, reviewReminderTimes, type AppRules, type DemoApplication, type DemoCampaign, type Review } from "@jubutech/shared";

/**
 * 후기 기한 로컬 알림 (1-1 "기한 알림") — 설정 `mission.reminderDaysBefore` 시점(기본 3일 전·당일 09:00)에 기기 알림.
 * 서버 푸시는 Supabase 연결(W8) 뒤. 웹·Expo Go 제약으로 실패해도 앱 흐름은 막지 않는다.
 * Expo Go(SDK 53+) 에는 알림 네이티브 모듈이 없으므로 개발 빌드(expo-dev-client)·실기기 빌드에서만 예약한다.
 */
const PREFIX = "review-due:";

type Notif = typeof import("expo-notifications");
let mod: Notif | null | undefined;
async function load(): Promise<Notif | null> {
  if (Platform.OS === "web") return null;
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    if (__DEV__ && mod === undefined) console.info("[reminders] Expo Go 에서는 후기 기한 알림을 예약하지 않아요 (개발 빌드에서 확인)");
    mod = null;
    return null;
  }
  if (mod !== undefined) return mod;
  try {
    mod = await import("expo-notifications");
    mod.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });
  } catch {
    mod = null;
  }
  return mod;
}

export interface ReminderPlan { applicationId: string; campaignTitle: string; daysBefore: number; at: string }

/** 알림이 필요한 건: 선정됐고 후기가 아직 없거나 보완 요청 상태인 응모 */
export function planReviewReminders(applications: DemoApplication[], campaigns: DemoCampaign[], reviews: Review[], rules: AppRules = DEFAULT_RULES, now: string | Date = new Date()): ReminderPlan[] {
  const plans: ReminderPlan[] = [];
  for (const a of applications) {
    if (a.selectionStatus !== "selected") continue;
    const r = reviews.find((x) => x.applicationId === a.id);
    if (r && r.status !== "revision") continue;
    const c = campaigns.find((x) => x.id === a.campaignId);
    if (!c) continue;
    for (const t of reviewReminderTimes(c.reviewDueAt, rules.mission.reminderDaysBefore, now)) plans.push({ applicationId: a.id, campaignTitle: c.title, daysBefore: t.daysBefore, at: t.at });
  }
  return plans;
}

/** 우리 알림만 지우고 계획대로 다시 예약한다. 권한이 없으면 예약할 게 있을 때만 묻는다 */
export async function syncReviewReminders(plans: ReminderPlan[]): Promise<{ scheduled: number; skipped: string | null }> {
  const N = await load();
  if (!N) return { scheduled: 0, skipped: "unsupported" };
  try {
    const existing = await N.getAllScheduledNotificationsAsync();
    await Promise.all(existing.filter((n) => n.identifier.startsWith(PREFIX)).map((n) => N.cancelScheduledNotificationAsync(n.identifier)));
    if (plans.length === 0) return { scheduled: 0, skipped: null };
    let { status } = await N.getPermissionsAsync();
    if (status !== "granted") ({ status } = await N.requestPermissionsAsync());
    if (status !== "granted") return { scheduled: 0, skipped: "denied" };
    if (Platform.OS === "android") await N.setNotificationChannelAsync("review-due", { name: "후기 기한 알림", importance: N.AndroidImportance.DEFAULT });
    let scheduled = 0;
    for (const p of plans) {
      const { title, body } = reviewReminderText(p.daysBefore, p.campaignTitle);
      await N.scheduleNotificationAsync({
        identifier: `${PREFIX}${p.applicationId}:${p.daysBefore}`,
        content: { title, body, data: { url: `/application/${p.applicationId}` }, ...(Platform.OS === "android" ? { channelId: "review-due" } : {}) },
        trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: new Date(p.at) },
      });
      scheduled += 1;
    }
    return { scheduled, skipped: null };
  } catch (e) {
    return { scheduled: 0, skipped: e instanceof Error ? e.message : "error" };
  }
}
