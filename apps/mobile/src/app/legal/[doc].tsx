import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { DEFAULT_RULES, LEGAL_DOC_KEYS, LEGAL_STATUS, legalDoc, type LegalDocKey } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { InfoBox } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { SP, T, typo } from "@/theme";

/**
 * 약관·개인정보처리방침·리워드 안내·응모 동의 — shared `legalDoc()` 본문을 그대로 그린다(웹 `/legal/[doc]` 과 같은 내용).
 * 출시 전엔 상단에 "법률 검토 전 초안" 띠를 둔다(LEGAL_STATUS.stage === "draft").
 */
export default function LegalScreen() {
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const key = LEGAL_DOC_KEYS.includes(doc as LegalDocKey) ? (doc as LegalDocKey) : null;
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));
  if (!key) {
    return (
      <AppScreen title="안내" onBack={back} tabBar={false}>
        <ContentSection><EmptyState icon="circle-x" title="없는 문서예요" text="마이 > 약관·앱 정보에서 다시 골라 주세요." /></ContentSection>
      </AppScreen>
    );
  }
  const d = legalDoc(key, DEFAULT_RULES);
  return (
    <AppScreen title={d.shortTitle} onBack={back} tabBar={false} grouped={false}>
      <ContentSection style={{ gap: SP[16] }}>
        <PageTitle title={d.title} sub={d.summary} />
        {LEGAL_STATUS.stage === "draft" ? <InfoBox>{`${LEGAL_STATUS.note} · ${LEGAL_STATUS.updatedAt.replace(/-/g, ".")} 기준`}</InfoBox> : null}
        {d.sections.map((sec) => (
          <View key={sec.heading} style={s.section}>
            <Text style={typo("headline1", "bold")}>{sec.heading}</Text>
            {sec.paragraphs?.map((p, i) => <Text key={i} style={typo("body2", "regular", T.label.normal)}>{p}</Text>)}
            {sec.bullets?.map((b, i) => (
              <View key={i} style={s.bullet}>
                <Text style={typo("body2", "regular", T.label.alternative)}>•</Text>
                <Text style={[typo("body2", "regular", T.label.normal), { flex: 1 }]}>{b}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={[typo("caption2", "regular", T.label.alternative), { marginVertical: SP[16] }]}>시행일 {LEGAL_STATUS.updatedAt.replace(/-/g, ".")} · 이 문서는 앱과 웹에서 같은 내용으로 보여요.</Text>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  section: { gap: SP[8], paddingTop: SP[8] },
  bullet: { flexDirection: "row", gap: SP[8], paddingLeft: 4 },
});
