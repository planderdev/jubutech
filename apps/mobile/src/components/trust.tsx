import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { TRUST_GRADE_LABEL, trustProgress, trustScore, trustTemperature, type TrustGrade } from "@jubutech/shared";
import { Icon } from "@/components/icon";
import { ProgressBar } from "@/components/journal";
import { GroupCard, GroupSection } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { P, RAD, SP, T, typo } from "@/theme";

/** 등급 색 — 낮을수록 차갑게, 높을수록 브랜드 쪽으로 (당근 매너온도의 온도감) */
export function gradeColor(grade: TrustGrade): string {
  return { caution: P.grey[600], normal: P.blue[500], good: P.green[500], excellent: T.primary.normal }[grade];
}

export function GradeBadge({ grade }: { grade: TrustGrade }) {
  return (
    <View style={[s.badge, { borderColor: gradeColor(grade) }]}>
      <Text style={typo("label2", "semibold", gradeColor(grade))}>{TRUST_GRADE_LABEL[grade]}</Text>
    </View>
  );
}

/** 온도 + 다음 등급까지 막대 — 마이 탭 카드와 `/trust` 첫 카드가 같이 쓴다 */
export function TrustGauge({ score }: { score: number }) {
  const { rules } = useDemo();
  const p = trustProgress(score, rules);
  return (
    <View style={{ gap: SP[8] }}>
      <View style={s.row}>
        <Text style={typo("title1", "bold", gradeColor(p.grade))}>{trustTemperature(score, rules).toFixed(1)}°</Text>
        <GradeBadge grade={p.grade} />
      </View>
      <ProgressBar value={p.ratio} color={gradeColor(p.grade)} label={p.next ? `${TRUST_GRADE_LABEL[p.next]} 등급까지 ${p.pointsToNext}점` : "최고 등급"} />
      <Text style={typo("caption1", "regular", T.label.alternative)}>{p.next ? `'${TRUST_GRADE_LABEL[p.next]}' 등급까지 ${p.pointsToNext}점 남았어요` : "가장 높은 등급이에요"}</Text>
    </View>
  );
}

/** 마이 탭 생활력 카드 — `trust.visibleToUsers` 가 꺼져 있으면 아무것도 그리지 않는다(출시 초기엔 관리자만 본다) */
export function TrustCard() {
  const router = useRouter();
  const { rules, trustEvents, member } = useDemo();
  if (!rules.trust.visibleToUsers) return null;
  return (
    <GroupSection>
      <GroupCard>
        <Pressable onPress={() => router.push("/trust" as Href)} accessibilityRole="link" accessibilityLabel={`${rules.trust.name} 자세히 보기`} style={({ pressed }) => [s.card, pressed && { backgroundColor: T.fill.alternative }]}>
          <View style={s.row}>
            <Text style={typo("headline2", "semibold")}>나의 {rules.trust.name}</Text>
            <Icon name="chevron-right" size={20} color={T.label.assistive} />
          </View>
          <TrustGauge score={trustScore(trustEvents, member.id)} />
        </Pressable>
      </GroupCard>
    </GroupSection>
  );
}

const s = StyleSheet.create({
  card: { padding: SP[16], gap: SP[16] },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SP[8] },
  badge: { paddingHorizontal: SP[8], paddingVertical: 2, borderRadius: RAD.full, borderWidth: 1 },
});
