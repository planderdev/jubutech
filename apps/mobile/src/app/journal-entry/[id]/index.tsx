import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { JOURNAL_ANSWER_LABEL, JOURNAL_CHECKLIST, JOURNAL_MA_DAYS, JOURNAL_TREND_LABEL, demoDateLabel, journalChecklistStats, journalNet, journalTotal } from "@jubutech/shared";
import { EmptyState } from "@/components/campaign";
import { Accordion } from "@/components/form";
import { Icon } from "@/components/icon";
import { Metric, ProgressBar, journalToneColor, won } from "@/components/journal";
import { AppScreen, ContentSection } from "@/components/screen";
import { ActionSheet } from "@/components/sheet";
import { Badge, Button, GroupCard, GroupSection, IconButton, ListHeader } from "@/components/ui";
import { confirmDialog } from "@/lib/dialog";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

/** 일지 상세 — PHP `journalDetail()`: 구분·종목 → 총 거래금액·비용·지출/수령 → 이유와 복기 → 나의 기준 점검 → 이평선·리스크 → 복기 공유. 수정·삭제는 시트 */
export default function JournalDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { journals, member, deleteJournal } = useDemo();
  const [sheet, setSheet] = useState(false);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/journal/entries" as Href));
  const j = journals.find((x) => x.id === id && x.memberId === member.id);
  if (!j) {
    return <AppScreen title="일지" onBack={back} tabBar={false}><ContentSection><EmptyState icon="lock-keyhole" title="접근할 수 없는 기록이에요" text="이 기록은 작성자만 볼 수 있어요." /></ContentSection></AppScreen>;
  }
  const draft = j.draftStatus === "draft";
  const stats = journalChecklistStats(j);
  const notes: [string, string][] = ([["매매 이유", j.reason], ["복기 메모", j.reflection], ["매도 근거", j.sellReview], ["장중 대응", j.intraday], ["5분봉·거래량", j.volumeNote], ["지수 연동", j.indexNote], ["감정", j.emotion]] as [string, string][]).filter(([, v]) => v);
  const risks: [string, string][] = [["목표가", j.targetPrice ? won(j.targetPrice) : ""], ["손절선", j.stopLossPrice ? won(j.stopLossPrice) : ""], ["지지선", j.supportNote], ["저항선", j.resistanceNote]];

  return (
    <AppScreen title="매매 기록" onBack={back} tabBar={false} right={<IconButton name="sliders-horizontal" label="기록 더 보기" onPress={() => setSheet(true)} />}>
      <GroupSection>
        <GroupCard style={s.card}>
          <View style={s.head}>
            <Badge label={draft ? "임시 저장" : j.side === "buy" ? "매수 기록" : "매도 기록"} tone={draft ? "neutral" : "rose"} />
            <Text style={typo("label2", "regular", T.label.alternative)}>{demoDateLabel(j.tradeDate, "Y.m.d")}</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={typo("title2", "bold")}>{j.stockName || "작성 중인 일지"}</Text>
            <Text style={typo("label2", "regular", T.label.alternative)}>{["국내주식", j.side === "buy" ? "매수" : "매도", j.symbol].filter(Boolean).join(" · ")}</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={typo("label2", "regular", T.label.alternative)}>총 거래금액</Text>
            <Text style={typo("title1", "bold", draft ? T.label.normal : journalToneColor(j.side))}>{won(journalTotal(j))}</Text>
            <Text style={typo("caption1", "regular", T.label.alternative)}>{won(j.unitPrice)} × {j.quantity.toLocaleString("ko-KR")}주</Text>
          </View>
          <View style={s.line}><Text style={typo("label2", "regular", T.label.alternative)}>수수료 + 거래세</Text><Text style={typo("label1", "semibold")}>{won(j.fee + j.tax)}</Text></View>
          <View style={s.line}><Text style={typo("label2", "regular", T.label.alternative)}>{j.side === "buy" ? "매수 지출액" : "매도 수령액"}</Text><Text style={typo("label1", "semibold")}>{won(journalNet(j))}</Text></View>
          <Text style={typo("caption2", "regular", T.label.alternative)}>거래금액과 지출·수령액은 실현 손익이 아닙니다.</Text>
        </GroupCard>
      </GroupSection>

      {notes.length ? (
        <GroupSection>
          <GroupCard style={s.accordion}>
            <Accordion title="이유와 복기" defaultOpen>
              {notes.map(([label, v]) => <View key={label} style={{ gap: 4 }}><Text style={typo("label2", "regular", T.label.alternative)}>{label}</Text><Text style={typo("body2", "regular")}>{v}</Text></View>)}
            </Accordion>
          </GroupCard>
        </GroupSection>
      ) : null}

      <GroupSection>
        <GroupCard>
          <ListHeader title="나의 기준 점검" action="" />
          <View style={s.check}>
            <View style={{ flexDirection: "row", gap: SP[16] }}>
              <Metric label="충족" value={`${stats.yes} / ${stats.total}`} />
              <Metric label="점검 완료" value={`${stats.done} / ${stats.total}`} />
            </View>
            <ProgressBar value={stats.total ? stats.done / stats.total : 0} label={`${stats.total}개 중 ${stats.done}개 점검 완료`} />
            {JOURNAL_CHECKLIST.map((c) => {
              const a = j.checklistAnswers[c.id] ?? "unreviewed";
              return <View key={c.id} style={s.line}><Text style={typo("label1", "regular")}>{c.title}</Text><Badge label={JOURNAL_ANSWER_LABEL[a]} tone={a === "yes" ? "green" : "neutral"} /></View>;
            })}
          </View>
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard style={s.accordion}>
          <Accordion title="이평선 추세">
            {JOURNAL_MA_DAYS.map((d) => {
              const v = j.trendChecks[d] ?? "unreviewed";
              return <View key={d} style={s.line}><Text style={typo("label1", "regular")}>{d}일선</Text><Text style={typo("label1", "semibold", journalToneColor(v))}>{JOURNAL_TREND_LABEL[v]}</Text></View>;
            })}
          </Accordion>
          <Accordion title="리스크 관리">
            {risks.map(([label, v]) => <View key={label} style={s.line}><Text style={typo("label1", "regular")}>{label}</Text><Text style={typo("label1", "regular", v ? T.label.normal : T.label.alternative)}>{v || "기록하지 않음"}</Text></View>)}
          </Accordion>
        </GroupCard>
      </GroupSection>

      <ContentSection style={{ gap: SP[8] }}>
        <View style={s.private}><Icon name="lock-keyhole" size={16} color={T.label.alternative} /><Text style={typo("caption1", "regular", T.label.alternative)}>비공개 · 템플릿 v{j.checklistTemplateVersion}</Text></View>
        {!draft ? <Button label="복기 공유" variant="neutral" full onPress={() => router.push(`/journal-entry/${j.id}/share` as Href)} /> : null}
      </ContentSection>

      <ActionSheet open={sheet} title="기록 관리" onClose={() => setSheet(false)} actions={[
        { label: "기록 수정", icon: "pencil", onPress: () => router.push(`/journal-entry/form?id=${j.id}` as Href) },
        { label: "기록 삭제", icon: "x", danger: true, onPress: () => confirmDialog("기록 삭제", "이 매매 기록을 삭제할까요?", () => { deleteJournal(j.id); back(); }, { destructive: true, confirmLabel: "삭제" }) },
      ]} />
    </AppScreen>
  );
}

const s = StyleSheet.create({
  card: { padding: SP[16], gap: SP[16] },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  line: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SP[8] },
  accordion: { paddingHorizontal: SP[16] },
  check: { paddingHorizontal: SP[16], paddingBottom: SP[16], gap: SP[16] },
  private: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SP[8] },
});
