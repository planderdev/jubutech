import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DEMO_MEMBERS, DEMO_NOTIFICATIONS } from "@jubutech/shared";
import { Icon } from "@/components/icon";
import { ServiceSheet } from "@/components/service-sheet";
import { IconButton } from "@/components/ui";
import { useService } from "@/lib/service";
import { CTRL, RAD, SHELL, SP, T, typo } from "@/theme";

/**
 * `.app-header > .top-nav--app` — 왼쪽 서비스 전환 버튼(`.top-nav__mode`), 오른쪽 검색·알림.
 * 상세 화면(뒤로가기 + 가운데 제목)은 `title`·`onBack` 을 주면 된다.
 */
export function AppHeader({ title, onBack, scrolled }: { title?: string; onBack?: () => void; scrolled?: boolean }) {
  const insets = useSafeAreaInsets();
  const service = useService();
  const [open, setOpen] = useState(false);
  const me = DEMO_MEMBERS[0];
  const unread = DEMO_NOTIFICATIONS.filter((n) => n.memberId === me.id && !n.read).length;

  return (
    <View style={[s.header, { paddingTop: insets.top }, scrolled && s.headerScrolled]}>
      {onBack ? (
        <View style={s.bar}>
          <IconButton name="chevron-left" label="뒤로가기" onPress={onBack} />
          <Text style={[typo("headline1", "bold"), s.title]} numberOfLines={1}>{title}</Text>
          <View style={{ width: CTRL.md }} />
        </View>
      ) : (
        <View style={[s.bar, { paddingLeft: SHELL.gutter }]}>
          <Pressable
            onPress={() => setOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`서비스 선택, 현재 ${service.name}`}
            style={({ pressed }) => [s.mode, pressed && { opacity: 0.7 }]}
          >
            <Text style={typo("heading2", "bold")}>{service.name}</Text>
            <Icon name="chevron-down" size={24} color={T.label.normal} />
          </Pressable>
          <View style={s.actions}>
            <IconButton name="search" label={`${service.name} 검색`} />
            <View>
              <IconButton name="bell" label={`알림 ${unread}건`} />
              {unread ? <View style={s.dot} accessibilityElementsHidden /> : null}
            </View>
          </View>
        </View>
      )}
      <ServiceSheet open={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: T.background.normalNormal, zIndex: 10 },
  headerScrolled: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  bar: { height: SHELL.headerHeight, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SHELL.gutter - SP[8] },
  title: { flex: 1, textAlign: "center" },
  mode: { flexDirection: "row", alignItems: "center", gap: SP[8], minHeight: CTRL.lg, flexShrink: 1 },
  actions: { flexDirection: "row", alignItems: "center", gap: SP[8] },
  dot: { position: "absolute", right: 12, top: SP[8], width: 4, height: 4, borderRadius: RAD.full, backgroundColor: T.primary.normal },
});
