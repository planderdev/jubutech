import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icon";
import { CTRL, P, RAD, SHELL, SP, T, TOUCH, typo } from "@/theme";

/** PHP `field()` — `.field > .label + .input/.textarea + .help` */
export function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, error, help, autoCapitalize = "none" }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; multiline?: boolean; keyboardType?: KeyboardTypeOptions; error?: string; help?: string; autoCapitalize?: "none" | "sentences" }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.field}>
      <Text style={typo("label1", "semibold", T.label.neutral)}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.label.assistive}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical={multiline ? "top" : "center"}
        accessibilityLabel={label}
        style={[s.input, typo("body1", "regular"), multiline && s.textarea, focused && s.inputFocused, !!error && s.inputError]}
      />
      {error ? <Text style={typo("label2", "regular", P.red[600])}>{error}</Text> : help ? <Text style={typo("label2", "regular", T.label.alternative)}>{help}</Text> : null}
    </View>
  );
}

/** `.input-wrap > .input + .icon-button` — 검색 입력 (오른쪽 아이콘 버튼) */
export function SearchInput({ value, onChangeText, onSubmit, placeholder, icon = "search", label = "검색" }: { value: string; onChangeText: (v: string) => void; onSubmit?: () => void; placeholder: string; icon?: string; label?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.searchWrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholder={placeholder}
        placeholderTextColor={T.label.assistive}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label}
        style={[s.input, typo("body1", "regular"), { paddingRight: SP[56] }, focused && s.inputFocused]}
      />
      <Pressable onPress={onSubmit} accessibilityRole="button" accessibilityLabel={`${label} 실행`} hitSlop={4} style={s.searchButton}>
        <Icon name={icon} size={24} color={P.grey[700]} />
      </Pressable>
    </View>
  );
}

/** `.checkbox` — 둥근 체크(grey-200 → primary) + 본문·보조 설명 */
export function Checkbox({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <Pressable onPress={() => onChange(!checked)} accessibilityRole="checkbox" accessibilityState={{ checked }} style={s.checkbox}>
      <View style={[s.checkMark, checked && { backgroundColor: T.primary.normal }]}>
        <Icon name="check" size={16} color={checked ? T.alias.staticWhite : T.alias.staticWhite} strokeWidth={2.5} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={typo("body2", "regular")}>{label}</Text>
        {sub ? <Text style={typo("caption1", "regular", T.label.alternative)}>{sub}</Text> : null}
      </View>
    </Pressable>
  );
}

/** `.box` — 안내 상자 (테두리, radius md, 패딩 16) */
export function InfoBox({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.box, style]}>{typeof children === "string" ? <Text style={typo("label2", "regular")}>{children}</Text> : children}</View>;
}

/** `.accordion` — summary(44 이상, semibold) + 펼침 본문 */
export function Accordion({ title, children, defaultOpen, inset }: { title: string; children: ReactNode; defaultOpen?: boolean; inset?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <View style={inset && s.accordionInset}>
      <Pressable onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={({ pressed }) => [s.summary, pressed && { opacity: 0.7 }]}>
        <Text style={[typo("headline2", "semibold"), { flex: 1 }]}>{title}</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={20} color={T.label.normal} />
      </Pressable>
      {open ? <View style={s.accordionBody}>{children}</View> : null}
    </View>
  );
}

/**
 * `.bottom-cta.bottom-cta--fixed.bottom-cta--app` — 화면 아래 고정 CTA.
 * 반투명 흰 배경 + 윗선, 패딩 16 + 안전 영역. 본문 쪽은 `BOTTOM_CTA_SPACE` 만큼 비워 둔다.
 */
export const BOTTOM_CTA_SPACE = SP[16] + CTRL.xl + SP[16];
export function BottomCta({ children, status, tone = "neutral" }: { children: ReactNode; status?: string; tone?: "neutral" | "error" }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.cta, { paddingBottom: SP[16] + insets.bottom }]}>
      {status ? <Text style={[typo("label2", tone === "error" ? "semibold" : "regular", tone === "error" ? T.status.negative : T.label.alternative), { textAlign: "center" }]} accessibilityLiveRegion="polite">{status}</Text> : null}
      <View style={s.ctaButtons}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  field: { gap: SP[8] },
  input: { minHeight: CTRL.lg, paddingHorizontal: SP[16], paddingVertical: SP[8], borderWidth: 1, borderColor: T.line.normalNormal, borderRadius: RAD.md, backgroundColor: T.background.normalNormal, color: T.label.normal },
  textarea: { minHeight: 128, paddingTop: SP[8] + 4 },
  inputFocused: { borderColor: T.primary.normal },
  inputError: { borderColor: P.red[500] },
  searchWrap: { position: "relative", justifyContent: "center" },
  searchButton: { position: "absolute", right: SP[8], width: CTRL.md, height: CTRL.md, alignItems: "center", justifyContent: "center", borderRadius: RAD.md },
  checkbox: { flexDirection: "row", alignItems: "center", gap: SP[8] + 4, minHeight: TOUCH },
  checkMark: { width: 24, height: 24, borderRadius: RAD.full, backgroundColor: P.grey[200], alignItems: "center", justifyContent: "center" },
  box: { padding: SP[16], borderWidth: 1, borderColor: T.line.normalNormal, borderRadius: RAD.md, gap: SP[8] },
  summary: { flexDirection: "row", alignItems: "center", gap: SP[16], minHeight: TOUCH, paddingVertical: SP[16] },
  accordionInset: { paddingHorizontal: SP[16] },
  accordionBody: { paddingBottom: SP[16], gap: SP[16] },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: SP[16], paddingHorizontal: SHELL.gutter, gap: SP[8], backgroundColor: T.background.transparentNormal, borderTopWidth: 1, borderTopColor: T.line.normalNeutral },
  ctaButtons: { flexDirection: "row", gap: SP[8] },
});
