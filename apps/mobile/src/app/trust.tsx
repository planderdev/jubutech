import { StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { TRUST_EVENT_LABEL, TRUST_GRADE_BENEFIT, TRUST_GRADE_LABEL, TRUST_GRADE_ORDER, demoDateLabel, trustGrade, trustRuleRows, trustScore, trustTimeline, type TrustGrade } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { AppScreen, ContentSection } from "@/components/screen";
import { GradeBadge, TrustGauge, gradeColor } from "@/components/trust";
import { GroupCard, GroupSection, ListHeader } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { P, SP, T, typo } from "@/theme";

/**
 * 생활력 상세 — 기획안 1-2 + 당근 매너온도 벤치마크: 내 온도 → 등급과 혜택 → 이렇게 오르고 내려요 → 최근 변동.
 * 점수의 기준을 그대로 보여 준다(한쪽만 평가받는다는 불만을 줄이려면 규칙이 보여야 한다). 노출이 꺼져 있으면 준비 중 안내만.
 */
export default function TrustScreen() {
  const router = useRouter();
  const { rules, trustEvents, member } = useDemo();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));
  const name = rules.trust.name;
  if (!rules.trust.visibleToUsers) {
    return <AppScreen title={name} onBack={back} tabBar={false}><ContentSection><EmptyState icon="sprout" title={`${name} 공개를 준비하고 있어요`} text="활동 기록이 충분히 쌓이면 이 자리에서 볼 수 있어요." /></ContentSection></AppScreen>;
  }
  const score = trustScore(trustEvents, member.id);
  const mine = trustGrade(score, rules);
  const history = trustTimeline(trustEvents, member.id);
  const floor = (g: TrustGrade) => ({ caution: "0점 미만", normal: `0~${rules.trust.gradeGood - 1}점`, good: `${rules.trust.gradeGood}~${rules.trust.gradeExcellent - 1}점`, excellent: `${rules.trust.gradeExcellent}점 이상` })[g];

  return (
    <AppScreen title={name} onBack={back} tabBar={false}>
      <ContentSection><PageTitle title={`나의 ${name}`} sub={`체험을 약속대로 마칠수록 올라가요. 처음 온도는 ${rules.trust.baseTemperature}°예요.`} /></ContentSection>
      <GroupSection><GroupCard style={s.pad}><TrustGauge score={score} /></GroupCard></GroupSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title="등급과 혜택" action="" />
          {[...TRUST_GRADE_ORDER].reverse().map((g, i) => (
            <View key={g} style={[s.row, i < TRUST_GRADE_ORDER.length - 1 && s.divider, g === mine && { backgroundColor: T.primary.soft }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={s.inline}>
                  <GradeBadge grade={g} />
                  <Text style={typo("caption1", "regular", T.label.alternative)}>{floor(g)}{g === mine ? " · 지금 여기" : ""}</Text>
                </View>
                <Text style={typo("label2", "regular", T.label.neutral)}>{TRUST_GRADE_BENEFIT[g]}</Text>
              </View>
            </View>
          ))}
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title="이렇게 오르고 내려요" action="" />
          {trustRuleRows(rules).map((r, i, all) => (
            <View key={r.kind} style={[s.line, i < all.length - 1 && s.divider]}>
              <Text style={[typo("label1", "regular"), { flex: 1 }]}>{r.label}</Text>
              <Text style={typo("label1", "semibold", r.delta.startsWith("-") ? P.red[500] : T.label.normal)}>{r.delta}</Text>
            </View>
          ))}
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title="최근 변동" action="" />
          {history.slice(0, 10).map((e, i, all) => (
            <View key={e.id} style={[s.line, i < all.length - 1 && s.divider]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={typo("label1", "regular")}>{TRUST_EVENT_LABEL[e.kind]}</Text>
                <Text style={typo("caption1", "regular", T.label.alternative)}>{demoDateLabel(e.createdAt, "Y.m.d")}{e.note ? ` · ${e.note}` : ""}</Text>
              </View>
              <Text style={typo("label1", "bold", e.delta < 0 ? P.red[500] : gradeColor("good"))}>{e.delta > 0 ? `+${e.delta}` : e.delta}</Text>
            </View>
          ))}
          {history.length === 0 ? <EmptyState icon="sprout" title="아직 변동이 없어요" text="첫 체험 후기를 올리면 여기에 쌓여요." /> : null}
        </GroupCard>
      </GroupSection>

      <ContentSection>
        <Text style={[typo("caption2", "regular", T.label.alternative), { marginVertical: SP[16] }]}>{name} 점수는 체험 선정과 응모 자격을 정하는 데 쓰여요. 숫자와 등급 기준은 운영 설정에 따라 바뀔 수 있어요. {TRUST_GRADE_LABEL.caution} 등급은 후기를 기한 안에 올리면 벗어날 수 있어요.</Text>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  pad: { padding: SP[16] },
  row: { flexDirection: "row", paddingHorizontal: SP[16], paddingVertical: SP[16] },
  line: { flexDirection: "row", alignItems: "center", gap: SP[16], paddingHorizontal: SP[16], paddingVertical: SP[16] },
  inline: { flexDirection: "row", alignItems: "center", gap: SP[8], marginBottom: 4 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
});
