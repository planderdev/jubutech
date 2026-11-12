import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AI_ASSIST_LABEL, aiReviewAdapter, type AiAssistKind, type AiReviewResult } from "@jubutech/shared";
import { Icon } from "@/components/icon";
import { BottomSheet } from "@/components/sheet";
import { Button } from "@/components/ui";
import { useRules } from "@/lib/demo-store";
import { RAD, SP, T, typo } from "@/theme";

/**
 * 후기 작성 화면의 AI 교정·이어쓰기 (기획안 1-1). 화면은 어댑터(`aiReviewAdapter`)만 부른다 — 모델이 정해지면 shared 쪽만 바꾼다.
 * 제안은 원문과 나란히 보여 주고 사용자가 적용해야 바뀐다. 꺼져 있으면(`assist.aiReviewEdit`) 준비 중 표시만.
 */
export function AiAssist({ text, brand, title, mission, onApply }: { text: string; brand: string; title: string; mission: { minChars: number; requiredKeywords: string[]; hashtags: string[] }; onApply: (next: string) => void }) {
  const rules = useRules();
  const adapter = aiReviewAdapter(rules);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AiReviewResult | null>(null);
  if (!adapter) {
    return (
      <View accessibilityRole="button" accessibilityState={{ disabled: true }} style={s.off}>
        <Icon name="sparkles" size={20} color={T.label.assistive} />
        <Text style={[typo("label1", "semibold", T.label.assistive), { flex: 1 }]}>AI 교정·이어쓰기</Text>
        <Text style={typo("caption1", "regular", T.label.assistive)}>준비 중</Text>
      </View>
    );
  }
  const run = async (kind: AiAssistKind) => {
    if (kind === "edit" && !text.trim()) return setError("먼저 몇 자 써 주세요. 쓴 내용을 다듬어 드려요.");
    setBusy(true);
    setError("");
    try {
      setResult(await adapter.complete({ kind, text, brand, campaignTitle: title, mission }));
    } catch {
      setError("지금은 제안을 가져올 수 없어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: SP[8] }}>
      <View style={s.row}>
        {(["edit", "continue"] as AiAssistKind[]).map((k) => (
          <Pressable key={k} disabled={busy} onPress={() => run(k)} accessibilityRole="button" style={({ pressed }) => [s.button, pressed && { backgroundColor: T.fill.alternative }]}>
            <Icon name="sparkles" size={18} color={T.primary.normal} />
            <Text style={typo("label1", "semibold", T.primary.normal)}>{AI_ASSIST_LABEL[k]}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={typo("label2", "regular", T.status.negative)} accessibilityLiveRegion="polite">{error}</Text> : null}
      <BottomSheet open={!!result} title="이렇게 바꿔 볼까요?" onClose={() => setResult(null)} footer={<>
        <Button label="닫기" variant="neutral" onPress={() => setResult(null)} style={{ flex: 1 }} />
        <Button label="적용하기" onPress={() => { if (result) onApply(result.text); setResult(null); }} style={{ flex: 1.4 }} />
      </>}>
        <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ gap: SP[16] }}>
          {result?.stub ? <Text style={typo("caption1", "semibold", T.status.cautionary)}>검토용 예시예요. 실제 AI 모델을 부르지 않았어요.</Text> : null}
          {result?.notes.map((n) => <Text key={n} style={typo("label2", "regular", T.label.neutral)}>• {n}</Text>)}
          <View style={s.compare}>
            <Text style={typo("label2", "semibold", T.label.alternative)}>지금 글</Text>
            <Text style={typo("body2", "regular", T.label.neutral)}>{text.trim() || "(아직 없음)"}</Text>
          </View>
          <View style={[s.compare, { borderColor: T.primary.normal }]}>
            <Text style={typo("label2", "semibold", T.primary.normal)}>제안</Text>
            <Text style={typo("body2", "regular")}>{result?.text}</Text>
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  off: { flexDirection: "row", alignItems: "center", gap: SP[8], minHeight: SP[48], paddingHorizontal: SP[16], borderRadius: RAD.md, backgroundColor: T.fill.alternative },
  row: { flexDirection: "row", gap: SP[8] },
  button: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SP[8], minHeight: SP[48], borderRadius: RAD.md, borderWidth: 1, borderColor: T.primary.normal },
  compare: { gap: 4, padding: SP[16], borderRadius: RAD.md, borderWidth: 1, borderColor: T.line.normalNormal },
});
