import { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { DEFAULT_RULES, DEMO_CAMPAIGNS, DEMO_CAMPAIGN_STATE_LABEL, REVIEW_STATUS, demoAppStatus, demoApplicationNext, demoCampaignState, demoDateLabel, demoReview, missionWithDefaults, reviewCheckSummary } from "@jubutech/shared";
import { DateRow, EmptyState } from "@/components/campaign";
import { Accordion, Field } from "@/components/form";
import { CheckResultList, MissionChecklist } from "@/components/review";
import { AppScreen, ContentSection } from "@/components/screen";
import { Badge, Button, GroupCard, GroupSection, TextButton } from "@/components/ui";
import { ApplicationCard } from "@/app/campaigns/applications";
import { useDemo } from "@/lib/demo-store";
import { SHELL, SP, T, typo } from "@/theme";

/**
 * 응모 내역 — PHP `applicationDetail()` (`/applications/{id}?complete`):
 * 상태 제목 → 응모한 체험 카드 → 참여 일정 → 내 신청 내용 → (후기 검토) → (배송 정보) → 버튼들.
 */
export default function ApplicationDetail() {
  const router = useRouter();
  const { id, complete, submitted } = useLocalSearchParams<{ id: string; complete?: string; submitted?: string }>();
  const store = useDemo();
  const a = store.applications.find((x) => x.id === id && x.memberId === store.member.id);
  const c = a ? DEMO_CAMPAIGNS.find((x) => x.id === a.campaignId) : undefined;
  const r = a ? demoReview(a.id, store.reviews) : undefined;
  const [recipient, setRecipient] = useState(a?.shipping?.recipient ?? "");
  const [address, setAddress] = useState(a?.shipping?.address ?? "");
  const [shippingError, setShippingError] = useState("");

  const back = () => (router.canGoBack() ? router.back() : router.replace("/campaigns/applications" as Href));
  if (!a || !c) return <AppScreen title="응모 내역" onBack={back} tabBar={false}><EmptyState title="응모 내역을 찾을 수 없어요" text="내 응모 목록에서 다시 확인해 주세요." actionLabel="내 응모 목록" actionVariant="weak" onAction={() => router.replace("/campaigns/applications" as Href)} /></AppScreen>;

  const state = demoCampaignState(c, store.now);
  const label = demoAppStatus(a, r);
  const statusTitle = r
    ? ({ revision: "후기 보완이 필요해요", approved: "체험을 마쳤어요", rejected: "후기 검토 결과를 확인해 주세요", pending: "후기를 확인하고 있어요" } as const)[r.status]
    : ({ selected: "체험단에 선정됐어요", not_selected: "다음 체험에서 만나요", cancelled: "응모가 취소됐어요", applied: "선정 결과를 기다리고 있어요" } as const)[a.selectionStatus];
  const neutral = a.selectionStatus === "not_selected" || a.selectionStatus === "cancelled";
  const canReview = a.selectionStatus === "selected" && (!r || r.status === "revision");
  const mission = missionWithDefaults(DEFAULT_RULES, c.mission);
  const showMission = a.selectionStatus === "selected" && (!r || r.status === "revision");

  const saveShipping = () => {
    if (!recipient.trim() || !address.trim()) {
      setShippingError("가상 수령인과 배송지를 입력해 주세요.");
      return;
    }
    setShippingError("");
    store.saveShipping(a.id, { recipient, address });
    Alert.alert("데모 배송 정보를 저장했어요.");
  };
  const cancel = () =>
    Alert.alert("응모 취소", "이 체험의 응모를 취소할까요? 모집 기간 중에는 다시 응모할 수 있어요.", [
      { text: "닫기", style: "cancel" },
      { text: "응모 취소", style: "destructive", onPress: () => { const res = store.cancelApplication(a.id); Alert.alert(res.message); } },
    ]);

  return (
    <AppScreen title="응모 내역" onBack={back} tabBar={false}>
      <View style={s.heading}>
        <Badge label={label} tone={neutral ? "neutral" : "rose"} weak={label === "신청 완료"} />
        <Text style={typo("title2", "bold")}>{complete ? "응모를 완료했어요" : submitted ? "후기를 제출했어요" : statusTitle}</Text>
        <Text style={typo("body2", "regular", T.label.alternative)}>{complete ? "결과가 나오면 여기에서 확인할 수 있어요." : submitted ? "검토 결과를 기다려 주세요. 결과는 여기와 알림으로 알려 드려요." : demoApplicationNext(a, c, r)}</Text>
      </View>

      <ApplicationCard application={a} campaign={c} footer="체험 상세보기" footerAction={false} onPress={() => router.push(`/campaign/${c.id}` as Href)} />

      <GroupSection>
        <GroupCard style={s.content}>
          <View style={s.sectionHeading}>
            <Text style={typo("headline2", "bold")}>참여 일정</Text>
            <Badge label={DEMO_CAMPAIGN_STATE_LABEL[state]} tone="neutral" />
          </View>
          <DateRow label="신청일" value={demoDateLabel(a.appliedAt)} />
          <DateRow label="선정 발표" value={demoDateLabel(c.announcementAt)} accent={a.selectionStatus === "applied"} />
          <DateRow label="후기 기한" value={demoDateLabel(c.reviewDueAt)} accent={a.selectionStatus === "selected" && !r} last />
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard style={s.content}>
          <Accordion title="내 신청 내용">
            <Text style={typo("headline2", "semibold")}>신청 사유</Text>
            <Text style={typo("body1", "regular")}>{a.answers.reason}</Text>
            <Text style={typo("caption1", "regular", T.label.alternative)}>필수 동의: 동의함 · 선택 동의: {a.consentRecords.optional ? "동의함" : "동의하지 않음"}</Text>
          </Accordion>
        </GroupCard>
      </GroupSection>

      {showMission ? (
        <GroupSection>
          <GroupCard style={[s.content, { gap: SP[16] }]}>
            <Text style={typo("headline2", "bold")}>미션 카드</Text>
            <MissionChecklist mission={mission} dueAt={c.reviewDueAt} now={store.now} includeLink={c.channel !== "설문"} />
          </GroupCard>
        </GroupSection>
      ) : null}

      {r ? (
        <GroupSection>
          <GroupCard style={[s.content, { gap: SP[8] }]}>
            <Text style={typo("headline2", "bold")}>후기 검토: {REVIEW_STATUS[r.status].label}</Text>
            <Text style={typo("body2", "regular", T.label.alternative)}>{r.feedback || "제출해 주신 후기를 확인하고 있어요."}</Text>
            {r.url ? <TextButton label="내 후기 보기" icon="external-link" style={{ alignSelf: "flex-start", paddingHorizontal: 0 }} onPress={() => Linking.openURL(r.url!).catch(() => {})} /> : null}
            {r.check ? (
              <Accordion title={`자동 검사 · ${reviewCheckSummary(r.check).text}`}>
                <CheckResultList check={r.check} />
              </Accordion>
            ) : null}
            {__DEV__ && (r.status === "pending" || r.status === "revision") ? (
              <View style={s.devRow}>
                <Text style={typo("caption1", "regular", T.label.assistive)}>검토용 데모(관리자 대신)</Text>
                <TextButton label="보완 요청 받기" icon={null} onPress={() => store.decideReview(r.id, "revision", "사진 2장을 더 올려 주세요.")} />
                <TextButton label="승인 받기" icon={null} onPress={() => store.decideReview(r.id, "approved")} />
              </View>
            ) : null}
          </GroupCard>
        </GroupSection>
      ) : null}

      {a.selectionStatus === "selected" && c.shipping ? (
        <GroupSection>
          <GroupCard style={s.content}>
            <Accordion title={`배송 정보 ${a.shipping ? "저장됨" : "입력"}`}>
              <Text style={typo("label2", "regular", T.label.alternative)}>가상 배송지로 데모 흐름을 확인하세요. 실제 배송은 진행하지 않아요.</Text>
              <Field label="수령인" value={recipient} onChangeText={setRecipient} autoCapitalize="sentences" />
              <Field label="배송지" value={address} onChangeText={setAddress} error={shippingError} autoCapitalize="sentences" />
              <Button label="배송 정보 저장" variant="weak" size="lg" onPress={saveShipping} />
            </Accordion>
          </GroupCard>
        </GroupSection>
      ) : null}

      <ContentSection style={s.actions}>
        {canReview ? <Button label={r ? "보완 후기 제출" : "후기 제출하기"} full onPress={() => router.push(`/application/${a.id}/review` as Href)} /> : null}
        <Button label="내 응모 목록" variant="neutral" full onPress={() => router.replace("/campaigns/applications" as Href)} />
        {a.selectionStatus === "applied" && state === "open" ? <Button label="응모 취소" variant="danger-weak" full onPress={cancel} /> : null}
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  heading: { gap: SP[8], alignItems: "flex-start", paddingTop: SP[24], paddingBottom: SP[8], paddingHorizontal: SHELL.gutter },
  content: { padding: SP[16] },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SP[16], marginBottom: SP[8] },
  actions: { marginVertical: SP[16], gap: SP[8] },
  devRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: SP[8], marginTop: SP[8] },
});
