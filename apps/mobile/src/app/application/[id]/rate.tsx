import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { DEMO_CAMPAIGNS, canRateBrand, type BrandRating } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { BottomCta, Field, InfoBox } from "@/components/form";
import { Icon } from "@/components/icon";
import { Segmented } from "@/components/journal";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button } from "@/components/ui";
import { noticeDialog } from "@/lib/dialog";
import { useDemo } from "@/lib/demo-store";
import { P, SP, T, typo } from "@/theme";

const ON_TIME: { key: BrandRating["shippedOnTime"]; label: string }[] = [{ key: "yes", label: "제때 왔어요" }, { key: "no", label: "늦었어요" }];
const MATCH: { key: BrandRating["matchedGuide"]; label: string }[] = [{ key: "yes", label: "같았어요" }, { key: "no", label: "달랐어요" }];

/** 광고주 평가 (기획안 1-2 상호 평가) — 별점 · 제때 발송 · 안내 일치 · 한 줄 의견. 광고주에게는 닉네임 없이 통계로만 간다 */
export default function RateBrand() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { applications, reviews, brandRatings, member, rateBrand } = useDemo();
  const a = applications.find((x) => x.id === id && x.memberId === member.id);
  const c = a ? DEMO_CAMPAIGNS.find((x) => x.id === a.campaignId) : undefined;
  const r = reviews.find((x) => x.applicationId === id);
  const [stars, setStars] = useState(0);
  const [onTime, setOnTime] = useState<BrandRating["shippedOnTime"]>(c?.shipping ? "yes" : "na");
  const [match, setMatch] = useState<BrandRating["matchedGuide"]>("yes");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const back = () => (router.canGoBack() ? router.back() : router.replace(`/application/${id}` as Href));
  if (!a || !c || !canRateBrand(a, r, brandRatings)) {
    return <AppScreen title="광고주 평가" onBack={back} tabBar={false}><ContentSection><EmptyState icon="star" title="평가할 수 없는 체험이에요" text="후기가 승인된 체험만, 한 번 평가할 수 있어요." actionLabel="돌아가기" actionVariant="weak" onAction={back} /></ContentSection></AppScreen>;
  }
  const submit = () => {
    const res = rateBrand({ applicationId: a.id, stars, shippedOnTime: onTime, matchedGuide: match, comment });
    if (!res.ok) return setError(res.message);
    noticeDialog("광고주 평가", res.message);
    back();
  };
  return (
    <AppScreen title="광고주 평가" onBack={back} tabBar={false} grouped={false} bottom={<BottomCta status={error || undefined} tone="error"><Button label="평가 남기기" full onPress={submit} style={{ flex: 1 }} /></BottomCta>}>
      <ContentSection style={s.form}>
        <PageTitle title={`${c.brand} 체험은 어땠나요?`} sub="내 후기 평가와 마찬가지로, 광고주도 평가받아요." />
        <View style={{ gap: SP[8] }}>
          <Text style={typo("label1", "semibold")}>전체적으로 몇 점인가요?</Text>
          <View style={s.stars} accessibilityRole="radiogroup" accessibilityLabel="별점">
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => { setStars(n); setError(""); }} accessibilityRole="radio" accessibilityState={{ selected: stars === n }} accessibilityLabel={`${n}점`} hitSlop={4} style={s.star}>
                <Icon name="star" size={36} strokeWidth={1.25} color={n <= stars ? P.yellow[400] : P.grey[300]} fill={n <= stars ? P.yellow[400] : "none"} />
              </Pressable>
            ))}
          </View>
        </View>
        {c.shipping ? (
          <View style={{ gap: SP[8] }}>
            <Text style={typo("label1", "semibold")}>제품이 약속한 때 왔나요?</Text>
            <Segmented items={ON_TIME} value={onTime} onChange={setOnTime} label="제때 발송" />
          </View>
        ) : null}
        <View style={{ gap: SP[8] }}>
          <Text style={typo("label1", "semibold")}>안내와 같았나요?</Text>
          <Segmented items={MATCH} value={match} onChange={setMatch} label="안내 일치" />
        </View>
        <Field label="한 줄 의견 (선택)" value={comment} onChangeText={(v) => setComment(v.slice(0, 200))} multiline autoCapitalize="sentences" placeholder="다음 회원에게 도움이 될 이야기를 남겨 주세요." />
        <InfoBox>{"광고주에게는 닉네임 없이 통계로만 보여요. 건수가 적을 때는 통계도 공개하지 않아요."}</InfoBox>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  form: { gap: SP[24], paddingTop: 0 },
  stars: { flexDirection: "row", gap: SP[8] },
  star: { padding: 2 },
});
