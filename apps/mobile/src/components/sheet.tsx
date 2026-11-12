import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icon";
import { IconButton } from "@/components/ui";
import { ELEV, P, RAD, SP, T, TOUCH, typo } from "@/theme";

/** PHP `sheetStart()` — 아래에서 올라오는 시트: 제목 + 닫기 + 본문 + (하단 버튼) */
export function BottomSheet({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="닫기" />
      <View style={[s.sheet, { paddingBottom: SP[16] + insets.bottom }]}>
        <View style={s.header}>
          <Text style={typo("heading2", "bold")}>{title}</Text>
          <IconButton name="x" label="닫기" onPress={onClose} />
        </View>
        <View style={s.body}>{children}</View>
        {footer ? <View style={s.footer}>{footer}</View> : null}
      </View>
    </Modal>
  );
}

export interface SheetAction { label: string; icon: string; danger?: boolean; onPress: () => void }

/** PHP `contentActionsSheet()` — "글 관리" 같은 행동 목록 */
export function ActionSheet({ open, title, actions, onClose }: { open: boolean; title: string; actions: SheetAction[]; onClose: () => void }) {
  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      {actions.map((a) => (
        <Pressable key={a.label} onPress={() => { onClose(); a.onPress(); }} accessibilityRole="button" style={({ pressed }) => [s.action, pressed && { backgroundColor: T.fill.alternative }]}>
          <Icon name={a.icon} size={20} color={a.danger ? P.red[500] : T.label.normal} />
          <Text style={typo("body1", "regular", a.danger ? P.red[500] : T.label.normal)}>{a.label}</Text>
        </Pressable>
      ))}
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: T.material.dimmer },
  sheet: { backgroundColor: T.background.normalNormal, borderTopLeftRadius: RAD.xl, borderTopRightRadius: RAD.xl, paddingTop: SP[8], maxHeight: "85%", ...ELEV.large },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: SP[24], paddingRight: SP[8], minHeight: SP[56] },
  body: { paddingHorizontal: SP[16] },
  footer: { flexDirection: "row", gap: SP[8], paddingHorizontal: SP[16], paddingTop: SP[16] },
  action: { flexDirection: "row", alignItems: "center", gap: SP[16], minHeight: TOUCH, paddingHorizontal: SP[8], paddingVertical: SP[8], borderRadius: RAD.md },
});
