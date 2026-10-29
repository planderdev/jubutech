import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { Icon } from "@/components/icon";
import { CTRL, P, RAD, SP, T, TOUCH, typo } from "@/theme";

/** `.card.card--group` — 그룹 섹션 흰 카드 (radius xl, 테두리·그림자 없음) */
export function GroupCard({ style, ...p }: ViewProps) {
  return <View {...p} style={[s.groupCard, style]} />;
}

/** `.group-section` — 그룹 카드 바깥 여백 (16 상하 · 거터 좌우) */
export function GroupSection({ style, ...p }: ViewProps) {
  return <View {...p} style={[s.groupSection, style]} />;
}

/** `.list-header` + `.text-button` — 섹션 제목과 "전체 보기 ›" */
export function ListHeader({ title, action = "전체 보기", onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.listHeader}>
      <Text style={typo("headline1", "bold")}>{title}</Text>
      {onAction ? <TextButton label={action} onPress={onAction} /> : null}
    </View>
  );
}

/** `.text-button` — label-1 semibold, 아이콘(chevron-right) 동반 */
export function TextButton({ label, onPress, icon = "chevron-right", color = T.label.neutral, style }: { label: string; onPress?: () => void; icon?: string | null; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [s.textButton, pressed && s.pressed, style]} accessibilityRole="button">
      <Text style={typo("label1", "semibold", color)}>{label}</Text>
      {icon ? <Icon name={icon} size={16} color={color} /> : null}
    </Pressable>
  );
}

/** `.icon-button` — 24px 아이콘 + 8px 패딩, grey-700 */
export function IconButton({ name, label, onPress, color = P.grey[700], size = 24, fill, style, ...rest }: { name: string; label: string; color?: string; size?: number; fill?: string } & PressableProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4} style={({ pressed }) => [s.iconButton, pressed && s.pressed, style as StyleProp<ViewStyle>]} {...rest}>
      <Icon name={name} size={size} color={color} fill={fill} />
    </Pressable>
  );
}

export type BadgeTone = "rose" | "neutral" | "green";
/** `.badge.badge--small` — caption-1 bold, 높이 18, radius 11 */
export function Badge({ label, tone = "rose", weak }: { label: string; tone?: BadgeTone; weak?: boolean }) {
  const fill = { rose: T.primary.normal, neutral: P.grey[600], green: P.green[600] }[tone];
  const soft = { rose: T.primary.soft, neutral: P.grey[100], green: T.background.statusPositive }[tone];
  return (
    <View style={[s.badge, { backgroundColor: weak ? soft : fill }]}>
      <Text style={typo("caption1", "bold", weak ? fill : T.alias.staticWhite)}>{label}</Text>
    </View>
  );
}

/**
 * `.list-row` — 왼쪽 아이콘 · 본문 · 오른쪽 보조 텍스트 · chevron.
 * `PHP menuRow()` 와 같은 구성. 그룹 카드 안에서는 상하좌우 16 패딩.
 */
export function MenuRow({ icon, title, sub, subAccent = true, onPress, last }: { icon: string; title: string; sub?: string; subAccent?: boolean; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.row, !last && s.rowDivider, pressed && s.rowPressed]}>
      <Icon name={icon} size={24} color={T.label.neutral} />
      <View style={s.rowBody}>
        <Text style={typo("headline2", "medium", P.grey[800])}>{title}</Text>
      </View>
      {sub ? <Text style={[typo("label2", "semibold", subAccent ? T.primary.normal : T.label.alternative), s.rowRight]}>{sub}</Text> : null}
      <Icon name="chevron-right" size={20} color={T.label.assistive} />
    </Pressable>
  );
}

/** `.card__footer > .text-button` — 그룹 카드 하단 가운데 정렬 링크 */
export function CardFooterLink({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <View style={s.cardFooter}>
      <TextButton label={label} onPress={onPress} style={s.cardFooterButton} />
    </View>
  );
}

/** `.button` 기본(primary) / `.button--neutral` / `.button--weak` */
export function Button({ label, variant = "primary", onPress, full, disabled, size = "xl", style }: { label: string; variant?: "primary" | "neutral" | "weak" | "danger-weak"; onPress?: () => void; full?: boolean; disabled?: boolean; size?: "md" | "lg" | "xl"; style?: StyleProp<ViewStyle> }) {
  const bg = { primary: T.primary.normal, neutral: T.fill.normal, weak: T.primary.soft, "danger-weak": T.background.statusNegative }[variant];
  const fg = { primary: T.alias.staticWhite, neutral: T.label.normal, weak: T.primary.normal, "danger-weak": P.red[600] }[variant];
  const height = { md: CTRL.md, lg: CTRL.lg, xl: CTRL.xl }[size];
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} style={({ pressed }) => [s.button, { backgroundColor: bg, height }, pressed && s.pressed, full && { alignSelf: "stretch" }, disabled && { opacity: 0.4 }, style]}>
      <Text style={typo("body1", "semibold", fg)}>{label}</Text>
    </Pressable>
  );
}

/** 빈 자리 화면용 — 아직 구현하지 않은 탭에 PHP 데모의 대응 경로를 안내 */
export function Placeholder({ title, description, phpPath }: { title: string; description: string; phpPath?: string }) {
  return (
    <View style={s.placeholder}>
      <Text style={typo("heading2", "bold")}>{title}</Text>
      <Text style={[typo("body2", "regular", T.label.alternative), { textAlign: "center" }]}>{description}</Text>
      {phpPath ? <Text style={typo("caption1", "regular", T.label.assistive)}>PHP 데모 기준 화면 {phpPath}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  groupSection: { marginVertical: SP[16], marginHorizontal: SP[16] },
  groupCard: { backgroundColor: T.background.normalNormal, borderRadius: RAD.xl, overflow: "hidden" },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: SP[16], minHeight: SP[56] },
  textButton: { flexDirection: "row", alignItems: "center", gap: SP[8], paddingHorizontal: SP[8], minHeight: CTRL.sm, borderRadius: RAD.sm },
  iconButton: { padding: SP[8], borderRadius: RAD.md, alignItems: "center", justifyContent: "center" },
  pressed: { backgroundColor: T.fill.normal },
  badge: { alignSelf: "flex-start", paddingHorizontal: SP[8], height: 18, borderRadius: 11, justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: SP[16], minHeight: TOUCH, paddingVertical: SP[16], paddingHorizontal: SP[16], backgroundColor: "transparent" },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  rowPressed: { backgroundColor: T.fill.alternative },
  rowBody: { flex: 1, minWidth: 0 },
  rowRight: { marginLeft: "auto", textAlign: "right", maxWidth: "40%" },
  cardFooter: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.line.solidNormal, paddingVertical: SP[8], paddingHorizontal: SP[16] },
  cardFooterButton: { alignSelf: "stretch", justifyContent: "center", minHeight: CTRL.lg },
  button: { height: CTRL.xl, paddingHorizontal: SP[24], borderRadius: RAD.lg, alignItems: "center", justifyContent: "center" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: SP[8], paddingHorizontal: SP[32], paddingVertical: SP[80] },
});
