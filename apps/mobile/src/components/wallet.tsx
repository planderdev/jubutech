import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { DEFAULT_RULES, DEMO_CAMPAIGNS, WALLET_KIND_LABEL, dailyGoalProgress, walletKindOf, walletNextAction, walletSummary, type DemoPoint, type WalletNextAction } from "@jubutech/shared";
import { Icon } from "@/components/icon";
import { GroupCard, GroupSection } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { P, RAD, SP, T, typo } from "@/theme";

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/** 내 지갑 집계 + 다음 할 일 — 마이 탭 카드와 `/wallet` 이 같이 쓴다 */
export function useWallet() {
  const store = useDemo();
  const entries = store.points.filter((p) => p.memberId === store.member.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const summary = walletSummary(entries, store.now);
  const next = walletNextAction({ memberId: store.member.id, applications: store.applications, campaigns: DEMO_CAMPAIGNS, reviews: store.reviews, savedCount: store.saved.length, rules: DEFAULT_RULES, now: store.now });
  return { entries, summary, next, rules: DEFAULT_RULES, now: store.now };
}

/**
 * 마이 탭 상단 지갑 카드 — PHP `.points-panel`(나의 포인트 → /mypage/points) 자리에 1-3 "오늘 번 돈" 카드.
 * 오늘 번 돈(목표 대비 막대) · 이번 달 · 잔액, 아래에 "다음 할 일" 한 줄.
 */
export function WalletCard() {
  const router = useRouter();
  const { summary, next, rules } = useWallet();
  const progress = dailyGoalProgress(rules, summary.today);
  return (
    <GroupSection>
      <Pressable onPress={() => router.push("/wallet" as Href)} accessibilityRole="link" accessibilityLabel="나의 지갑 열기" style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
        <GroupCard style={s.card}>
          <View style={s.row}>
            <Text style={typo("label2", "regular", T.label.alternative)}>오늘 번 돈</Text>
            <Icon name="chevron-right" size={20} color={T.label.assistive} />
          </View>
          <View style={s.valueRow}>
            <Text style={typo("title1", "bold")}>{won(summary.today)}</Text>
            <Text style={typo("caption1", "regular", T.label.alternative)}>목표 {won(rules.reward.dailyGoal)}</Text>
          </View>
          <View style={s.bar} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
            <View style={[s.barFill, { width: `${Math.max(4, progress * 100)}%` as `${number}%` }]} />
          </View>
          <View style={s.stats}>
            <Stat label="이번 달" value={won(summary.month)} />
            <Stat label="잔액" value={won(summary.balance)} divider />
            <Stat label="받은 제품" value={won(summary.productValue)} divider />
          </View>
        </GroupCard>
      </Pressable>
      <NextActionRow next={next} />
    </GroupSection>
  );
}

export function Stat({ label, value, divider, big }: { label: string; value: string; divider?: boolean; big?: boolean }) {
  return (
    <View style={[s.stat, divider && s.statDivider]}>
      <Text style={typo("caption1", "regular", T.label.alternative)}>{label}</Text>
      <Text style={typo(big ? "heading1" : "headline2", "bold")} numberOfLines={1}>{value}</Text>
    </View>
  );
}

/** `.application-next` 느낌의 한 줄 — 눌러서 바로 그 일로 */
export function NextActionRow({ next }: { next: WalletNextAction }) {
  const router = useRouter();
  const accent = next.kind === "review_due" || next.kind === "closing_soon";
  return (
    <Pressable onPress={() => router.push(next.href as Href)} accessibilityRole="link" style={({ pressed }) => [s.next, pressed && { opacity: 0.8 }]}>
      <View style={[s.nextIcon, { backgroundColor: accent ? T.primary.soft : T.fill.normal }]}>
        <Icon name={next.kind === "review_due" ? "pencil" : next.kind === "closing_soon" ? "gift" : next.kind === "saved" ? "bookmark" : "search"} size={18} color={accent ? T.primary.normal : T.label.neutral} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={typo("caption1", "regular", T.label.alternative)}>다음 할 일</Text>
        <Text style={typo("label1", "semibold", accent ? T.primary.normal : T.label.normal)} numberOfLines={2}>{next.text}</Text>
      </View>
      <Text style={typo("label2", "semibold", T.label.neutral)}>{next.cta}</Text>
      <Icon name="chevron-right" size={18} color={T.label.assistive} />
    </Pressable>
  );
}

const KIND_ICON: Record<string, string> = { review: "pencil", referral: "user-round", event: "gift", product_value: "shopping-basket", withdraw: "banknote", adjust: "sliders-horizontal" };

/** PHP `/mypage/points` 의 `.list-row--lg` — 사유·날짜 · ±금액 */
export function WalletEntryRow({ entry, last }: { entry: DemoPoint; last?: boolean }) {
  const kind = walletKindOf(entry);
  const d = new Date(entry.createdAt);
  const positive = entry.amount > 0;
  const product = kind === "product_value";
  return (
    <View style={[s.entry, !last && s.entryDivider]}>
      <View style={[s.entryIcon, { backgroundColor: product ? T.background.statusCautionary : positive ? T.primary.soft : T.fill.normal }]}>
        <Icon name={KIND_ICON[kind] ?? "coins"} size={18} color={product ? P.yellow[700] : positive ? T.primary.normal : T.label.neutral} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={typo("body2", "semibold")} numberOfLines={2}>{entry.reason}</Text>
        <Text style={typo("caption1", "regular", T.label.alternative)}>{WALLET_KIND_LABEL[kind]} · {d.getFullYear()}.{String(d.getMonth() + 1).padStart(2, "0")}.{String(d.getDate()).padStart(2, "0")}</Text>
      </View>
      <Text style={typo("headline2", "bold", product ? T.label.neutral : positive ? T.primary.normal : T.label.normal)}>{product ? "" : positive ? "+" : ""}{won(entry.amount)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: SP[16], gap: SP[8] },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  valueRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: SP[8] },
  bar: { height: 8, borderRadius: RAD.full, backgroundColor: T.fill.normal, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: RAD.full, backgroundColor: T.primary.normal },
  stats: { flexDirection: "row", marginTop: SP[8] },
  stat: { flex: 1, gap: 2, minWidth: 0 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: T.line.normalNeutral, paddingLeft: SP[16], marginLeft: SP[16] },
  next: { flexDirection: "row", alignItems: "center", gap: SP[8] + 4, marginTop: SP[8], paddingVertical: SP[8] + 4, paddingHorizontal: SP[16], backgroundColor: T.background.normalNormal, borderRadius: RAD.xl },
  nextIcon: { width: SP[32], height: SP[32], borderRadius: RAD.full, alignItems: "center", justifyContent: "center" },
  entry: { flexDirection: "row", alignItems: "center", gap: SP[16], paddingVertical: SP[16], paddingHorizontal: SP[16] },
  entryDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  entryIcon: { width: SP[40], height: SP[40], borderRadius: RAD.full, alignItems: "center", justifyContent: "center" },
});
