import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { DEMO_CAMPAIGNS, demoAppStatus, demoApplicationNext, demoDateLabel, demoReview, type DemoAppStatusLabel, type DemoApplication, type DemoCampaign } from "@jubutech/shared";
import { CampaignVisual, ChipRow, EmptyState, PageTitle } from "@/components/campaign";
import { Icon } from "@/components/icon";
import { AppScreen, ContentSection } from "@/components/screen";
import { Badge, GroupCard, GroupSection } from "@/components/ui";
import { useMyApplications } from "@/lib/demo-store";
import { CTRL, SP, T, typo } from "@/theme";

type Filter = "" | DemoAppStatusLabel;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "", label: "전체" },
  { key: "신청 완료", label: "신청 완료" },
  { key: "선정", label: "선정" },
  { key: "미선정", label: "미선정" },
  { key: "후기 제출", label: "후기 제출" },
  { key: "보완 요청", label: "보완 요청" },
  { key: "완료", label: "완료" },
  { key: "반려", label: "반려" },
];

/** 내 응모 — PHP `applicationList()` (`/applications?status`): 제목 → 상태 칩 → 응모 카드 목록 */
export default function Applications() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("");
  const mine = useMyApplications();
  const rows = mine
    .map((a) => ({ a, c: DEMO_CAMPAIGNS.find((c) => c.id === a.campaignId), r: demoReview(a.id) }))
    .filter(({ a, r }) => !filter || demoAppStatus(a, r) === filter);

  return (
    <AppScreen>
      <ContentSection>
        <PageTitle title="내 응모" />
      </ContentSection>
      <ChipRow items={FILTERS} value={filter} onChange={setFilter} />
      {rows.length === 0 ? (
        <GroupSection>
          <GroupCard>
            <EmptyState icon="gift" title="아직 응모 내역이 없어요" text="나에게 맞는 체험을 찾아보세요." actionLabel="체험 둘러보기" actionVariant="weak" onAction={() => router.push("/campaigns/explore" as Href)} />
          </GroupCard>
        </GroupSection>
      ) : (
        rows.map(({ a, c, r }) => <ApplicationCard key={a.id} application={a} campaign={c} next={c ? demoApplicationNext(a, c, r) : ""} label={demoAppStatus(a, r)} onPress={() => router.push(`/application/${a.id}` as Href)} />)
      )}
    </AppScreen>
  );
}

/** `.card--group.card--interactive > .application-layout + .application-next` */
export function ApplicationCard({ application: a, campaign: c, label, next, onPress, footer = next, footerAction }: { application: DemoApplication; campaign?: DemoCampaign; label?: DemoAppStatusLabel; next?: string; onPress: () => void; footer?: string; footerAction?: boolean }) {
  const needsAction = footerAction ?? (label === "선정" || label === "보완 요청");
  const neutral = a.selectionStatus === "not_selected" || a.selectionStatus === "cancelled";
  return (
    <GroupSection>
      <Pressable onPress={onPress} accessibilityRole="link" style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
        <GroupCard>
          <View style={s.layout}>
            {c ? <CampaignVisual campaign={c} style={s.thumb} /> : <View style={[s.thumb, { backgroundColor: T.fill.normal }]} />}
            <View style={s.content}>
              {label ? <Badge label={label} tone={neutral ? "neutral" : "rose"} weak={label === "신청 완료"} /> : <Text style={typo("caption1", "regular", T.label.alternative)}>{c?.brand}</Text>}
              <Text style={typo("headline2", "bold")} numberOfLines={2}>{c?.title ?? "종료된 체험"}</Text>
              {label ? <Text style={typo("caption1", "regular", T.label.alternative)}>{c?.brand ?? ""} · {demoDateLabel(a.appliedAt, "m.d")} 신청</Text> : null}
            </View>
          </View>
          <View style={s.next}>
            <Text style={[typo("label2", needsAction ? "semibold" : "regular", needsAction ? T.primary.normal : T.label.alternative), { flex: 1 }]} numberOfLines={2}>{footer}</Text>
            <Icon name="chevron-right" size={20} color={needsAction ? T.primary.normal : T.label.alternative} />
          </View>
        </GroupCard>
      </Pressable>
    </GroupSection>
  );
}

const s = StyleSheet.create({
  layout: { flexDirection: "row", alignItems: "flex-start", gap: SP[16], padding: SP[16] },
  thumb: { width: SP[80], height: SP[80] },
  content: { flex: 1, minWidth: 0, gap: SP[8], alignItems: "flex-start" },
  next: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SP[8], minHeight: CTRL.lg, paddingVertical: SP[8], paddingHorizontal: SP[16], borderTopWidth: 1, borderTopColor: T.line.normalNeutral },
});
