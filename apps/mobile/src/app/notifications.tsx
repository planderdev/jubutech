import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { demoDateLabel, notificationHref } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { AppScreen, ContentSection } from "@/components/screen";
import { GroupCard, GroupSection, TextButton } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { RAD, SP, T, typo } from "@/theme";

/** 알림함 — PHP `/notifications`: 읽지 않은 알림 표시, 누르면 읽음 처리 후 해당 화면으로 */
export default function Notifications() {
  const router = useRouter();
  const { notifications, member, readNotification, readAllNotifications } = useDemo();
  const rows = notifications.filter((n) => n.memberId === member.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unread = rows.filter((n) => !n.read).length;
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));
  return (
    <AppScreen title="알림" onBack={back} tabBar={false} right={unread ? <TextButton label="모두 읽음" icon={null} onPress={readAllNotifications} /> : undefined}>
      <ContentSection><PageTitle title="알림" sub={unread ? `읽지 않은 알림 ${unread}건` : "새 알림이 없어요"} /></ContentSection>
      {rows.length === 0 ? (
        <ContentSection><EmptyState icon="bell" title="아직 알림이 없어요" text="체험단 선정 결과와 후기 기한을 여기서 알려 드려요." /></ContentSection>
      ) : (
        <GroupSection>
          <GroupCard>
            {rows.map((n, i) => (
              <Pressable key={n.id} onPress={() => { readNotification(n.id); router.push(notificationHref(n.url) as Href); }} accessibilityRole="link" style={({ pressed }) => [s.row, i < rows.length - 1 && s.divider, pressed && { backgroundColor: T.fill.alternative }]}>
                <View style={[s.dot, !n.read && s.dotOn]} accessibilityLabel={n.read ? undefined : "읽지 않음"} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={typo("label1", n.read ? "regular" : "semibold")}>{n.title}</Text>
                  <Text style={typo("body2", "regular", T.label.alternative)}>{n.body}</Text>
                  <Text style={typo("caption1", "regular", T.label.assistive)}>{demoDateLabel(n.createdAt, "m.d")}</Text>
                </View>
              </Pressable>
            ))}
          </GroupCard>
        </GroupSection>
      )}
    </AppScreen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: SP[8], padding: SP[16] },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  dot: { width: SP[8], height: SP[8], borderRadius: RAD.full, marginTop: 6, backgroundColor: "transparent" },
  dotOn: { backgroundColor: T.primary.normal },
});
