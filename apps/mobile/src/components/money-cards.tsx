import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { DEMO_CAMPAIGNS, demoCampaignDeadline, demoCampaignState, demoRegionalArticles, demoVisibleArticles, demoVisibleCampaigns } from "@jubutech/shared";
import { Icon } from "@/components/icon";
import { useWallet, won } from "@/components/wallet";
import { useDemo } from "@/lib/demo-store";
import { ELEV, RAD, SHELL, SP, T, typo } from "@/theme";

/**
 * 「돈 되는 일 카드」 3종 (1-4) — 각 서비스 홈 상단에 가로 스크롤: ① 마감 임박 체험단 ② 내 지역 지원금(`member.region`) ③ 지갑 요약(오늘 번 돈 + 다음 할 일).
 */
export function MoneyCards() {
  const router = useRouter();
  const store = useDemo();
  const { summary, next } = useWallet();
  const mine = store.applications.filter((a) => a.memberId === store.member.id && a.selectionStatus !== "cancelled");
  const closing = demoVisibleCampaigns(DEMO_CAMPAIGNS, store.now)
    .filter((c) => demoCampaignState(c, store.now) === "open" && !mine.some((a) => a.campaignId === c.id))
    .sort((a, b) => Date.parse(a.recruitmentEndAt) - Date.parse(b.recruitmentEndAt))[0];
  const region = store.member.region;
  const article = (region ? demoRegionalArticles(region)[0] : undefined) ?? demoVisibleArticles().find((a) => a.categoryId === "subsidy");

  const cards = [
    { key: "campaign", icon: "gift", eyebrow: closing ? `체험단 모집 ${demoCampaignDeadline(closing, store.now)}` : "체험단", title: closing ? `${closing.brand} · ${closing.title}` : "지금 열린 체험을 둘러보세요", cta: closing ? "응모하기" : "탐색", href: closing ? `/campaign/${closing.id}` : "/campaigns/explore" },
    { key: "subsidy", icon: "landmark", eyebrow: `${region ?? "내 지역"} 지원금`, title: article?.title ?? "우리 집이 받을 수 있는 지원금", cta: "자세히", href: "/finance/categories" },
    { key: "wallet", icon: "wallet", eyebrow: `오늘 번 돈 ${won(summary.today)}`, title: next.text, cta: next.cta, href: next.kind === "none" ? "/wallet" : next.href },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} style={{ flexGrow: 0 }} accessibilityLabel="돈 되는 일">
      {cards.map((c) => (
        <Pressable key={c.key} onPress={() => router.push(c.href as Href)} accessibilityRole="link" style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}>
          <View style={s.top}>
            <View style={s.iconWrap}><Icon name={c.icon} size={18} color={T.primary.normal} /></View>
            <Text style={[typo("caption1", "semibold", T.primary.normal), { flex: 1 }]} numberOfLines={1}>{c.eyebrow}</Text>
          </View>
          <Text style={[typo("headline2", "bold"), { flex: 1 }]} numberOfLines={2}>{c.title}</Text>
          <View style={s.cta}>
            <Text style={typo("label2", "semibold", T.label.neutral)}>{c.cta}</Text>
            <Icon name="arrow-right" size={16} color={T.label.neutral} />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: SP[8], paddingHorizontal: SHELL.gutter, paddingVertical: SP[8] },
  card: { width: 240, minHeight: 124, padding: SP[16], gap: SP[8], borderRadius: RAD.xl, backgroundColor: T.background.normalNormal, ...ELEV.small },
  top: { flexDirection: "row", alignItems: "center", gap: SP[8] },
  iconWrap: { width: SP[32], height: SP[32], borderRadius: RAD.full, backgroundColor: T.primary.soft, alignItems: "center", justifyContent: "center" },
  cta: { flexDirection: "row", alignItems: "center", gap: 4 },
});
