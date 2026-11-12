import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icon";
import type { ServiceTab } from "@/lib/service";
import { ELEV, RAD, SHELL, SP, T, typo } from "@/theme";

type TabBarRenderer = NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>;
type TabBarProps = Parameters<TabBarRenderer>[0];

/**
 * `.app-nav-frame > .bottom-nav--floating` — 화면 하단에 떠 있는 알약형 탭바.
 * 높이 80 · 안쪽 8 · 테두리 line-normal-neutral · 반투명 흰 배경 · elevation large.
 * 활성 탭은 `fill-normal` 배경과 label-normal 글자색.
 */
export function FloatingTabBar({ state, descriptors, navigation, tabs }: TabBarProps & { tabs: ServiceTab[] }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[s.frame, { bottom: insets.bottom + SHELL.navBottomGap }]}>
      <View style={s.nav} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const tab = tabs.find((t) => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          const color = focused ? T.label.normal : T.label.alternative;
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? tab.label}
              testID={options.tabBarButtonTestID}
              style={[s.item, focused && s.itemActive]}
            >
              <Icon name={tab.icon} size={24} color={color} strokeWidth={focused ? 2 : 1.75} />
              <Text style={typo("caption1", focused ? "semibold" : "medium", color)}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  frame: { position: "absolute", left: SP[16], right: SP[16], alignItems: "center" },
  nav: {
    width: "100%",
    maxWidth: 450 - SP[32],
    height: SHELL.navHeight,
    padding: SP[8],
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: RAD.full,
    borderWidth: 1,
    borderColor: T.line.solidNeutral,
    // 네이티브는 backdrop blur 를 쓰지 않으므로 `.bottom-nav--floating` 의 polyfill 값(surface-raised)에 가깝게
    backgroundColor: Platform.OS === "ios" ? T.background.transparentNormal : T.background.elevatedNormal,
    ...ELEV.large,
  },
  item: { flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", gap: SP[8], borderRadius: RAD.full },
  itemActive: { backgroundColor: T.fill.normal },
});
