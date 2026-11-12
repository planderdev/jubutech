import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { journalMonthStats, journalToday } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { Accordion } from "@/components/form";
import { Metric, ProgressBar, journalToneColor } from "@/components/journal";
import { AppScreen, ContentSection } from "@/components/screen";
import { CardFooterLink, GroupCard, GroupSection, IconButton, ListHeader } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + by, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** 월간 기록 분석 — PHP `journalAnalysis()`: 분석 월 → 작성한 일지·기록한 날 → 매수·매도 비중 → 어떤 종목을 기록했나요 → 손익 안내 */
export default function JournalAnalysis() {
  const router = useRouter();
  const { journals, member } = useDemo();
  const [month, setMonth] = useState(journalToday().slice(0, 7));
  const stats = journalMonthStats(journals.filter((j) => j.memberId === member.id), month);
  const [y, m] = month.split("-").map(Number);
  return (
    <AppScreen segments="journal">
      <ContentSection><PageTitle title="월간 기록 분석" sub="최종 저장한 일지만 집계해요. 임시 저장은 제외해요." /></ContentSection>
      <GroupSection>
        <GroupCard>
          <View style={s.pad}>
            <View style={s.monthRow}>
              <IconButton name="chevron-left" label="이전 달" onPress={() => setMonth(shiftMonth(month, -1))} />
              <Text style={typo("headline1", "bold")}>{y}년 {m}월</Text>
              <IconButton name="chevron-right" label="다음 달" onPress={() => setMonth(shiftMonth(month, 1))} />
            </View>
            <View style={s.metrics}>
              <Metric label="이번 달 작성한 일지" value={stats.total} unit="건" />
              <Metric label="기록한 날" value={stats.days} unit="일" />
            </View>
            <View style={s.side}>
              <Text style={typo("label2", "semibold", journalToneColor("buy"))}>매수 기록 {stats.buys}건</Text>
              <Text style={typo("label2", "semibold", journalToneColor("sell"))}>매도 기록 {stats.sells}건</Text>
            </View>
            {stats.total ? <ProgressBar value={stats.buys / stats.total} color={journalToneColor("buy")} label={`매수 ${stats.buys}건, 매도 ${stats.sells}건`} /> : null}
          </View>
          <CardFooterLink label="나의 일지 보기" onPress={() => router.replace("/journal/entries" as Href)} />
        </GroupCard>
      </GroupSection>
      <GroupSection>
        <GroupCard>
          <ListHeader title="어떤 종목을 기록했나요?" action="" />
          {stats.byStock.length ? (
            <View style={[s.pad, { paddingTop: 0 }]}>
              {stats.byStock.map((row) => (
                <View key={row.name} style={{ gap: 4 }}>
                  <View style={s.side}>
                    <Text style={typo("label1", "regular")}>{row.name}</Text>
                    <Text style={typo("label1", "semibold")}>{row.count}건</Text>
                  </View>
                  <ProgressBar value={row.count / stats.total} label={`${row.name} ${row.count}건, 전체 ${stats.total}건 중`} />
                </View>
              ))}
            </View>
          ) : <EmptyState icon="chart-no-axes-combined" title="아직 분석할 기록이 없어요" text="일지를 남기면 기록 습관을 함께 살펴볼 수 있어요." />}
        </GroupCard>
      </GroupSection>
      <ContentSection>
        <Accordion title="손익을 계산할 기록이 없어요">
          <Text style={typo("body2", "regular", T.label.neutral)}>현재는 거래별 금액을 기록해요. 매입원가와 부분매도 연결 기준이 정해지면 실현 손익을 계산할 수 있어요.</Text>
        </Accordion>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  pad: { padding: SP[16], gap: SP[16] },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metrics: { flexDirection: "row", gap: SP[16] },
  side: { flexDirection: "row", justifyContent: "space-between", gap: SP[8] },
});
