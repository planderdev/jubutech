import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { WALLET_KINDS, WALLET_KIND_LABEL, dailyGoalProgress, walletKindOf, walletWithdrawState, type WalletEntryKind } from "@jubutech/shared";
import { ChipRow, EmptyState, PageTitle } from "@/components/campaign";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, GroupCard, GroupSection, ListHeader } from "@/components/ui";
import { NextActionRow, Stat, WalletEntryRow, useWallet, won } from "@/components/wallet";
import { RAD, SP, T, typo } from "@/theme";

type Filter = "" | WalletEntryKind;
const FILTERS: { key: Filter; label: string }[] = [{ key: "", label: "전체" }, ...WALLET_KINDS.map((k) => ({ key: k, label: WALLET_KIND_LABEL[k] }))];

/**
 * 나의 지갑 — PHP `/mypage/points`(큰 숫자 + 내역)를 1-3 사양으로: 오늘·이번 달 번 돈, 잔액, 받은 제품 가치 따로,
 * 다음 할 일 한 줄, 출금 버튼(오픈 전엔 안내), 유형 칩으로 거르는 내역.
 */
export default function Wallet() {
  const router = useRouter();
  const { entries, summary, next, rules, now } = useWallet();
  const [filter, setFilter] = useState<Filter>("");
  const rows = entries.filter((e) => !filter || walletKindOf(e) === filter);
  const withdraw = walletWithdrawState(rules, summary.balance, now);
  const progress = dailyGoalProgress(rules, summary.today);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/campaigns/my" as Href));

  return (
    <AppScreen title="나의 지갑" onBack={back} tabBar={false}>
      <ContentSection>
        <PageTitle title="오늘 번 돈" sub="후기·추천·이벤트로 번 돈이 여기에 쌓여요. 실제 지급이 없는 데모 금액이에요." />
        <View style={s.hero}>
          <Text style={typo("display2", "bold")}>{won(summary.today)}</Text>
          <Text style={typo("label2", "regular", T.label.alternative)}>하루 목표 {won(rules.reward.dailyGoal)} · {Math.round(progress * 100)}%</Text>
          <View style={s.bar} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
            <View style={[s.barFill, { width: `${Math.max(4, progress * 100)}%` as `${number}%` }]} />
          </View>
        </View>
      </ContentSection>

      <GroupSection style={{ marginTop: 0 }}>
        <GroupCard style={s.stats}>
          <Stat label="이번 달 번 돈" value={won(summary.month)} big />
          <Stat label="출금 가능 잔액" value={won(summary.balance)} big divider />
        </GroupCard>
        <GroupCard style={[s.product, { marginTop: SP[8] }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={typo("label1", "semibold")}>받은 제품 가치</Text>
            <Text style={typo("caption1", "regular", T.label.alternative)}>체험으로 받은 제품은 잔액과 따로 계산해요</Text>
          </View>
          <Text style={typo("heading2", "bold")}>{won(summary.productValue)}</Text>
        </GroupCard>
        <NextActionRow next={next} />
      </GroupSection>

      <ContentSection style={{ gap: SP[8] }}>
        <Button label={withdraw.label} variant={withdraw.enabled ? "primary" : "neutral"} full disabled={!withdraw.enabled} onPress={() => Alert.alert("출금 신청", "데모에서는 출금을 진행하지 않아요. 계좌 입력과 정산은 데이터 연결 뒤에 들어와요.")} />
        <Text style={[typo("caption1", "regular", T.label.alternative), { textAlign: "center" }]}>{withdraw.help}</Text>
      </ContentSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title="내역" />
          <ChipRow items={FILTERS} value={filter} onChange={setFilter} />
          {rows.length === 0 ? <EmptyState icon="coins" title="아직 내역이 없어요" text="후기를 올리면 첫 리워드가 쌓여요." /> : rows.map((e, i) => <WalletEntryRow key={e.id} entry={e} last={i === rows.length - 1} />)}
        </GroupCard>
      </GroupSection>

      <ContentSection>
        <Text style={[typo("caption2", "regular", T.label.alternative), { marginVertical: SP[16] }]}>후기 1건 승인 = +{won(rules.reward.reviewAmount)} · 최소 출금 {won(rules.wallet.withdrawMin)} · 숫자는 운영 설정에서 바뀔 수 있어요</Text>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  hero: { gap: SP[8], marginBottom: SP[16] },
  bar: { height: 10, borderRadius: RAD.full, backgroundColor: T.fill.normal, overflow: "hidden", marginTop: SP[8] },
  barFill: { height: "100%", borderRadius: RAD.full, backgroundColor: T.primary.normal },
  stats: { flexDirection: "row", padding: SP[16] + 4 },
  product: { flexDirection: "row", alignItems: "center", gap: SP[16], padding: SP[16] },
});
