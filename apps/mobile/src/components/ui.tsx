import { Pressable, StyleSheet, Text, View, type ViewProps } from "react-native";
import { C, R, SH, text } from "@/theme";

/** 흰 라운드 카드 (20px, 소프트 섀도) */
export function Card({ style, ...p }: ViewProps) { return <View {...p} style={[styles.card, style]} />; }
export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[text.label13, on && { color: C.paper }]}>{label}</Text>
    </Pressable>
  );
}
export function Badge({ label, tone = "tint" }: { label: string; tone?: "primary" | "tint" | "ink" | "soft" | "success" | "info" }) {
  const bg = { primary: C.primary, tint: C.primaryTint, ink: C.stage, soft: C.inset, success: C.pastel.sage.soft, info: C.pastel.sky.soft }[tone];
  const fg = { primary: C.paper, tint: C.primary, ink: C.paper, soft: C.ink2, success: C.success, info: C.info }[tone];
  return <View style={[styles.badge, { backgroundColor: bg }]}><Text style={[text.label11, { color: fg }]}>{label}</Text></View>;
}
export function SectionHeader({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sh}><Text style={text.title18}>{title}</Text>{action ? <Pressable onPress={onPress}><Text style={[text.label12, { color: C.ink3 }]}>{action} ›</Text></Pressable> : null}</View>
  );
}
export function Button({ label, variant = "primary", onPress, full }: { label: string; variant?: "primary" | "ink" | "soft" | "secondary"; onPress?: () => void; full?: boolean }) {
  const bg = { primary: C.primary, ink: C.stage, soft: C.inset, secondary: C.paper }[variant];
  const fg = { primary: C.paper, ink: C.paper, soft: C.ink, secondary: C.ink }[variant];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, { backgroundColor: bg, opacity: pressed ? 0.85 : 1 }, variant === "secondary" && { borderWidth: 1.5, borderColor: C.hairline }, full && { alignSelf: "stretch" }]}>
      <Text style={[text.title16, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: C.paper, borderRadius: R.xl, padding: 16, ...SH.soft },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: R.pill, backgroundColor: C.paper, borderWidth: 1, borderColor: C.hairline },
  chipOn: { backgroundColor: C.stage, borderColor: C.stage },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: R.pill },
  sh: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  btn: { height: 52, paddingHorizontal: 20, borderRadius: R.pill, alignItems: "center", justifyContent: "center" },
});
