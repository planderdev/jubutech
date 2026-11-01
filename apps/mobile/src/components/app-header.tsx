import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DEMO_MEMBERS, DEMO_NOTIFICATIONS } from "@jubutech/shared";
import { IconButton } from "@/components/ui";
import { useService } from "@/lib/service";
import { CTRL, RAD, SHELL, SP, T, typo } from "@/theme";

/**
 * `.app-header > .top-nav--app` — 왼쪽 제목(서비스 이름 또는 `heading`), 오른쪽 검색·알림.
 * B안에서는 서비스를 하단 탭으로 고르므로 PHP 의 드롭다운(`.top-nav__mode`)은 뺐다.
 * 상세 화면(뒤로가기 + 가운데 제목)은 `title`·`onBack` 을 주면 된다.
 */
export function AppHeader({ title, heading, onBack, right, scrolled }: { title?: string; heading?: string; onBack?: () => void; right?: React.ReactNode; scrolled?: boolean }) {
  const insets = useSafeAreaInsets();
  const service = useService();
  const me = DEMO_MEMBERS[0];
  const unread = DEMO_NOTIFICATIONS.filter((n) => n.memberId === me.id && !n.read).length;
  const name = heading ?? service.name;

  return (
    <View style={[s.header, { paddingTop: insets.top }, scrolled && s.headerScrolled]}>
      {onBack ? (
        <View style={s.bar}>
          <IconButton name="chevron-left" label="뒤로가기" onPress={onBack} />
          <Text style={[typo("headline1", "bold"), s.title]} numberOfLines={1}>{title}</Text>
          {right ?? <View style={{ width: CTRL.md }} />}
        </View>
      ) : (
        <View style={[s.bar, { paddingLeft: SHELL.gutter }]}>
          <Text style={[typo("heading2", "bold"), { flexShrink: 1 }]} numberOfLines={1} accessibilityRole="header">{name}</Text>
          <View style={s.actions}>
            <IconButton name="search" label={`${name} 검색`} />
            <View>
              <IconButton name="bell" label={`알림 ${unread}건`} />
              {unread ? <View style={s.dot} accessibilityElementsHidden /> : null}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: T.background.normalNormal, zIndex: 10 },
  headerScrolled: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  bar: { height: SHELL.headerHeight, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SHELL.gutter - SP[8] },
  title: { flex: 1, textAlign: "center" },
  actions: { flexDirection: "row", alignItems: "center", gap: SP[8] },
  dot: { position: "absolute", right: 12, top: SP[8], width: 4, height: 4, borderRadius: RAD.full, backgroundColor: T.primary.normal },
});
