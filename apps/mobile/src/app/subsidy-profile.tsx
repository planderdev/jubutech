import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { CHILD_AGE_OPTIONS, SUBSIDY_REGIONS, type ChildAge } from "@jubutech/shared";
import { PageTitle } from "@/components/campaign";
import { BottomCta, InfoBox } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button } from "@/components/ui";
import { useContent } from "@/lib/content";
import { useDemo } from "@/lib/demo-store";
import { RAD, SP, T, typo } from "@/theme";

function Chip({ label, on, onPress, radio }: { label: string; on: boolean; onPress: () => void; radio?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole={radio ? "radio" : "checkbox"} accessibilityState={radio ? { selected: on } : { checked: on }} style={[s.chip, on && s.chipOn]}>
      <Text style={typo("label1", on ? "semibold" : "regular", on ? T.primary.normal : T.label.normal)}>{label}</Text>
    </Pressable>
  );
}

/** 맞춤 지원금 — 기획안 2-5 세 가지 질문. 소득 등 깊은 정보는 묻지 않고, 답은 이 기기에만 저장한다 */
export default function SubsidyProfileScreen() {
  const router = useRouter();
  const { subsidyProfile, member, saveSubsidyProfile } = useDemo();
  const { categories } = useContent();
  const [region, setRegion] = useState(subsidyProfile.region || member.region || "");
  const [childAge, setChildAge] = useState<ChildAge>(subsidyProfile.childAge);
  const [interests, setInterests] = useState<string[]>(subsidyProfile.interests);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/finance" as Href));
  const toggle = (id: string) => setInterests((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const save = () => {
    saveSubsidyProfile({ region, childAge, interests, answered: true });
    back();
  };
  return (
    <AppScreen title="맞춤 지원금" onBack={back} tabBar={false} grouped={false} bottom={<BottomCta><Button label="이 조건으로 찾기" full onPress={save} style={{ flex: 1 }} /></BottomCta>}>
      <ContentSection style={s.form}>
        <PageTitle title="세 가지만 알려 주세요" sub="맞는 지원금이 마감되기 전에 알려 드려요." />
        <View style={s.block}>
          <Text style={typo("headline2", "semibold")}>어디에 사세요?</Text>
          <View style={s.chips} accessibilityRole="radiogroup">{SUBSIDY_REGIONS.map((r) => <Chip key={r} label={r} radio on={region === r} onPress={() => setRegion(r)} />)}</View>
        </View>
        <View style={s.block}>
          <Text style={typo("headline2", "semibold")}>자녀가 어느 연령대인가요?</Text>
          <View style={s.chips} accessibilityRole="radiogroup">{CHILD_AGE_OPTIONS.map((o) => <Chip key={o.key || "skip"} label={o.label} radio on={childAge === o.key} onPress={() => setChildAge(o.key)} />)}</View>
        </View>
        <View style={s.block}>
          <Text style={typo("headline2", "semibold")}>어떤 분야가 궁금하세요?</Text>
          <Text style={typo("caption1", "regular", T.label.alternative)}>여러 개 골라도 돼요. 안 고르면 전부 보여 드려요.</Text>
          <View style={s.chips}>{categories.map((c) => <Chip key={c.id} label={c.name} on={interests.includes(c.id)} onPress={() => toggle(c.id)} />)}</View>
        </View>
        <InfoBox>{"답은 이 기기에만 저장돼요. 소득이나 자녀 이름 같은 정보는 묻지 않아요. 마이 > 설정에서 알림을 끌 수 있어요."}</InfoBox>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  form: { gap: SP[24] },
  block: { gap: SP[8] },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: SP[8] },
  chip: { minHeight: 40, paddingHorizontal: SP[16], borderRadius: RAD.full, borderWidth: 1, borderColor: T.line.normalNormal, alignItems: "center", justifyContent: "center" },
  chipOn: { borderColor: T.primary.normal, backgroundColor: T.primary.soft },
});
