import { Share, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { DEMO_CAMPAIGNS, PARTNER_GUIDE, referralLinks } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { InfoBox } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, GroupCard, GroupSection, ListHeader } from "@/components/ui";
import { noticeDialog } from "@/lib/dialog";
import { useDemo } from "@/lib/demo-store";
import { RAD, SP, T, typo } from "@/theme";

/**
 * 추천 링크 (기획안 2-1) — **결정 대기.** `referral.enabled` 가 꺼져 있으면 준비 중. 켜도 수익 배분은 없고 링크 목록과 가이드 자리만 있다.
 * 쿠팡 파트너스 약관·리서치 결과에 따라 "앱이 나눠 준다 / 가이드만 한다"가 정해진다.
 */
export default function Referral() {
  const router = useRouter();
  const { rules, member, applications, reviews, myInviteCode } = useDemo();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));
  if (!rules.referral.enabled) {
    return <AppScreen title="추천 링크" onBack={back} tabBar={false}><ContentSection><EmptyState icon="link" title="추천 링크를 준비하고 있어요" text="체험한 제품을 지인에게 추천하는 기능이에요. 조건이 정해지면 알려 드릴게요." /></ContentSection></AppScreen>;
  }
  const links = referralLinks(member.id, myInviteCode().code, applications, reviews, DEMO_CAMPAIGNS);
  const share = async (message: string) => {
    try {
      await Share.share({ message });
    } catch {
      noticeDialog("공유", "이 기기에서는 공유 시트를 열 수 없어요.");
    }
  };
  return (
    <AppScreen title="추천 링크" onBack={back} tabBar={false}>
      <ContentSection><PageTitle title="체험한 제품을 추천해요" sub="후기가 승인된 제품마다 나만의 링크가 생겨요." /></ContentSection>
      <ContentSection><InfoBox>{"지금은 링크를 나눌 수만 있어요. 구매 집계와 수익 지급은 아직 없어요."}</InfoBox></ContentSection>
      <GroupSection>
        <GroupCard>
          <ListHeader title="내 추천 링크" action="" />
          {links.map((l, i) => (
            <View key={l.campaignId} style={[s.row, i < links.length - 1 && s.divider]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={typo("label2", "regular", T.label.alternative)}>{l.brand}</Text>
                <Text style={typo("label1", "semibold")} numberOfLines={1}>{l.title}</Text>
                <Text style={typo("caption1", "regular", T.label.alternative)}>{l.path}</Text>
              </View>
              <Button label="공유" variant="weak" size="md" onPress={() => share(`${l.brand} 직접 써 봤어요. 주부테크에서 보기 ${l.path}`)} />
            </View>
          ))}
          {links.length === 0 ? <EmptyState icon="link" title="아직 링크가 없어요" text="체험 후기가 승인되면 여기에 생겨요." /> : null}
        </GroupCard>
      </GroupSection>
      <GroupSection>
        <GroupCard>
          <ListHeader title={PARTNER_GUIDE.title} action="" />
          <View style={s.guide}>
            <Text style={typo("caption1", "semibold", T.status.cautionary)}>{PARTNER_GUIDE.note}</Text>
            {PARTNER_GUIDE.steps.map((st, i) => (
              <View key={st.title} style={s.step}>
                <View style={s.num}><Text style={typo("label2", "bold", T.primary.normal)}>{i + 1}</Text></View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={typo("label1", "semibold")}>{st.title}</Text>
                  <Text style={typo("body2", "regular", T.label.neutral)}>{st.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </GroupCard>
      </GroupSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: SP[16], padding: SP[16] },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  guide: { paddingHorizontal: SP[16], paddingBottom: SP[16], gap: SP[16] },
  step: { flexDirection: "row", gap: SP[8] },
  num: { width: 24, height: 24, borderRadius: RAD.full, backgroundColor: T.primary.soft, alignItems: "center", justifyContent: "center" },
});
