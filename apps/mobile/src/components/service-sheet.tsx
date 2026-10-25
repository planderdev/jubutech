import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icon";
import { IconButton } from "@/components/ui";
import { SERVICES, saveLastService, useService, type ServiceMode } from "@/lib/service";
import { P, RAD, SP, T, typo } from "@/theme";

/**
 * 서비스 전환 바텀시트 — PHP `sheetStart('mode-sheet','어떤 일상을 시작할까요?')`.
 * 세 서비스를 `.list-row--choice` 로 나열하고, 현재 서비스는 primary-soft 배경·primary 테두리.
 */
export function ServiceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const current = useService();

  const choose = (key: ServiceMode) => {
    onClose();
    if (key === current.key) return;
    saveLastService(key);
    router.replace(`/${key}`);
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={s.dimmer} onPress={onClose} accessibilityLabel="닫기" />
      <View style={[s.sheet, { paddingBottom: insets.bottom + SP[24] }]}>
        <View style={s.handle} />
        <View style={s.header}>
          <Text style={typo("heading2", "bold")}>어떤 일상을 시작할까요?</Text>
          <IconButton name="x" label="닫기" onPress={onClose} />
        </View>
        <Text style={[typo("body2", "regular", T.label.alternative), s.description]}>주부테크의 세 가지 서비스를 만나보세요.</Text>
        <View style={{ gap: SP[8] }}>
          {SERVICES.map((svc) => {
            const active = svc.key === current.key;
            return (
              <Pressable
                key={svc.key}
                onPress={() => choose(svc.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [s.choice, active && s.choiceActive, pressed && !active && { backgroundColor: T.fill.alternative }]}
              >
                <View style={[s.choiceIcon, active && { backgroundColor: T.background.normalNormal }]}>
                  <Icon name={svc.icon} size={22} color={active ? T.primary.normal : T.label.neutral} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={typo("body1", "semibold", active ? T.primary.heavy : T.label.normal)}>{svc.name}</Text>
                  <Text style={typo("label2", "regular", T.label.alternative)}>{svc.description}</Text>
                </View>
                {active ? <Text style={typo("caption1", "bold", T.primary.normal)}>이용 중</Text> : <Icon name="chevron-right" size={20} color={T.label.assistive} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  dimmer: { flex: 1, backgroundColor: T.material.dimmer },
  sheet: { backgroundColor: T.background.normalNormal, borderTopLeftRadius: RAD.xl, borderTopRightRadius: RAD.xl, paddingHorizontal: SP[24], paddingTop: SP[8] },
  handle: { alignSelf: "center", width: SP[40], height: 4, borderRadius: RAD.xs, backgroundColor: P.grey[300], marginBottom: SP[8] },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: SP[56] },
  description: { marginBottom: SP[16] },
  choice: { flexDirection: "row", alignItems: "center", gap: SP[16], minHeight: SP[64], paddingVertical: SP[8], paddingHorizontal: SP[16], borderWidth: 1, borderColor: T.alias.border, borderRadius: RAD.lg, backgroundColor: T.background.normalNormal },
  choiceActive: { backgroundColor: T.primary.soft, borderColor: T.primary.normal },
  choiceIcon: { width: SP[40], height: SP[40], borderRadius: RAD.md, backgroundColor: T.background.normalAlternative, alignItems: "center", justifyContent: "center" },
});
