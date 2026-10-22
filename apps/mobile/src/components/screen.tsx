import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, text } from "@/theme";

/** 공통 화면 셸: 상단바(제목) + 스크롤 콘텐츠(16px 패딩) */
export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.canvas }}>
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <Text style={text.title16}>{title}</Text>
        {subtitle ? <Text style={[text.body13, { color: C.ink3 }]}>{subtitle}</Text> : null}
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  top: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.paper, borderBottomWidth: 1, borderBottomColor: C.edge, gap: 2 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
});
