import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { LEGAL_DOC_TITLE, type LegalDocKey } from "@jubutech/shared";
import { SP, T, typo } from "@/theme";

/**
 * 약관·개인정보 링크 한 줄 — 로그인·온보딩 하단 캡션. "가입 시 이용약관·개인정보처리방침에 동의하게 됩니다" 에서 두 이름을 누를 수 있게.
 * 스토어 심사: 가입 전에 두 문서에 닿을 수 있어야 한다.
 */
export function LegalLinks({ prefix = "시작하면 ", suffix = "에 동의하는 것으로 봐요. 자녀 정보는 수집하지 않아요.", docs = ["terms", "privacy"] as LegalDocKey[], align = "center" }: { prefix?: string; suffix?: string; docs?: LegalDocKey[]; align?: "center" | "left" }) {
  const router = useRouter();
  return (
    <View style={[s.row, { justifyContent: align === "center" ? "center" : "flex-start" }]}>
      <Text style={[typo("caption1", "regular", T.label.assistive), { textAlign: align }]}>
        {prefix}
        {docs.map((d, i) => (
          <Text key={d}>
            {i > 0 ? "·" : ""}
            <Text style={typo("caption1", "semibold", T.label.neutral)} onPress={() => router.push(`/legal/${d}` as Href)} accessibilityRole="link">{LEGAL_DOC_TITLE[d]}</Text>
          </Text>
        ))}
        {suffix}
      </Text>
    </View>
  );
}

/** 문서 안에서 다른 문서로 — "자세한 내용은 리워드·지급 안내" 식 */
export function LegalLinkButton({ doc, label }: { doc: LegalDocKey; label?: string }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/legal/${doc}` as Href)} accessibilityRole="link" hitSlop={8} style={({ pressed }) => [s.link, pressed && { opacity: 0.6 }]}>
      <Text style={typo("label2", "semibold", T.label.neutral)}>{label ?? `${LEGAL_DOC_TITLE[doc]} 보기`}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: SP[8] },
  link: { alignSelf: "center", paddingVertical: 4 },
});
