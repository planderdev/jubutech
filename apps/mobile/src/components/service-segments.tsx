import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { usePathname, useRouter, type Href } from "expo-router";
import { serviceMeta, type ServiceMode } from "@/lib/service";
import { RAD, SHELL, SP, T, typo } from "@/theme";

/**
 * 서비스 상단 세그먼트 — B안에서 PHP 서비스별 하단 탭(홈·탐색·내 응모 …)이 옮겨 온 자리. `.chip` 모양, 활성은 primary soft.
 * 같은 Stack 안에서 replace 로 바꾸므로 뒤로가기 스택이 쌓이지 않는다.
 */
export function ServiceSegments({ service }: { service: ServiceMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const meta = serviceMeta(service);
  const hrefOf = (name: string) => (name === "index" ? `/${service}` : `/${service}/${name}`);
  const current = meta.tabs.find((t) => pathname === hrefOf(t.name))?.name ?? "index";
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} style={s.wrap} accessibilityRole="tablist">
      {meta.tabs.map((t) => {
        const active = t.name === current;
        return (
          <Pressable key={t.name} onPress={() => !active && router.replace(hrefOf(t.name) as Href)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={({ pressed }) => [s.item, active && s.itemActive, pressed && !active && { backgroundColor: T.fill.normal }]}>
            <Text style={typo("label1", active ? "semibold" : "regular", active ? T.primary.normal : T.label.neutral)}>{t.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 0, backgroundColor: T.background.normalNormal, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  row: { flexDirection: "row", gap: SP[8], paddingHorizontal: SHELL.gutter, paddingBottom: SP[8] + 4, paddingTop: 2 },
  item: { minHeight: 36, paddingHorizontal: SP[16], borderRadius: RAD.full, borderWidth: 1, borderColor: T.line.normalNormal, alignItems: "center", justifyContent: "center" },
  itemActive: { borderColor: T.primary.normal, backgroundColor: T.primary.soft },
});
