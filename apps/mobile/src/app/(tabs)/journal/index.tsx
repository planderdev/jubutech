import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { addDays, daysInMonth, journalMonthStats, journalToday, journalWeek, parseDate } from "@jubutech/shared";
import { MoneyCards } from "@/components/money-cards";
import { EmptyState } from "@/components/campaign";
import { Field } from "@/components/form";
import { Icon } from "@/components/icon";
import { JournalRow, Metric, ProgressBar } from "@/components/journal";
import { AppScreen, ContentSection } from "@/components/screen";
import { BottomSheet } from "@/components/sheet";
import { Button, GroupCard, GroupSection, IconButton, ListHeader, TextButton } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { RAD, SP, T, typo } from "@/theme";

const WEEK_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

/**
 * 매매일지 요약 — PHP `journalHome()`: 월 제목·분석 → 기록한 날·작성한 일지 → 이번 달 목표(시트) → 주간 기록(이전/오늘/다음, 기록 점) → 그날의 기록 → 매매 기록하기.
 */
export default function JournalHome() {
  const router = useRouter();
  const { journals, member, journalGoals, setJournalGoal } = useDemo();
  const today = journalToday();
  const [date, setDate] = useState(today);
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("12");
  const [goalError, setGoalError] = useState("");
  const month = date.slice(0, 7);
  const d = parseDate(date);
  const mine = journals.filter((j) => j.memberId === member.id);
  const stats = journalMonthStats(mine, month);
  const goal = journalGoals[month];
  const week = journalWeek(date);
  const recorded = new Set(mine.map((j) => j.tradeDate));
  const daily = mine.filter((j) => j.tradeDate === date);
  const openGoal = () => { setGoalInput(String(goal ?? 12)); setGoalError(""); setGoalOpen(true); };
  const saveGoal = () => {
    const n = Number(goalInput);
    const max = daysInMonth(month);
    if (!Number.isInteger(n) || n < 1 || n > max) return setGoalError(`1~${max}일로 설정할 수 있어요.`);
    setJournalGoal(month, n);
    setGoalOpen(false);
  };

  return (
    <AppScreen segments="journal">
      <MoneyCards />
      <GroupSection>
        <GroupCard style={s.summary}>
          <View style={s.monthRow}>
            <Text style={typo("headline1", "bold")}>{d.getFullYear()}년 {d.getMonth() + 1}월</Text>
            <Button label="분석" variant="neutral" size="md" onPress={() => router.replace("/journal/analysis" as Href)} />
          </View>
          <View style={s.metrics}>
            <Metric label="기록한 날" value={stats.days} unit="일" />
            <Metric label="작성한 일지" value={stats.total} unit="건" />
          </View>
          <View style={s.goal}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={typo("caption1", "regular", T.label.alternative)}>이번 달 기록 목표</Text>
              <Text style={typo("label1", "semibold")}>{goal ? `${goal}일 중 ${stats.days}일 완료` : "작은 목표부터 시작해요"}</Text>
            </View>
            <Button label={goal ? "목표 수정" : "목표 설정"} variant="weak" size="md" onPress={openGoal} />
          </View>
          {goal ? <ProgressBar value={stats.days / goal} label={`이번 달 기록 목표 ${goal}일 중 ${stats.days}일 완료`} /> : null}
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard>
          <View style={s.weekHead}>
            <Text style={typo("headline1", "bold")}>주간 기록</Text>
            <View style={s.weekActions}>
              <IconButton name="chevron-left" label="이전 주" onPress={() => setDate(addDays(date, -7))} />
              <TextButton label="오늘" icon={null} color={T.label.normal} onPress={() => setDate(today)} />
              <IconButton name="chevron-right" label="다음 주" onPress={() => setDate(addDays(date, 7))} />
            </View>
          </View>
          <View style={s.week}>
            {week.map((day, i) => {
              const on = day === date;
              const has = recorded.has(day);
              return (
                <Pressable key={day} onPress={() => setDate(day)} accessibilityRole="button" accessibilityLabel={`${parseDate(day).getMonth() + 1}월 ${parseDate(day).getDate()}일${has ? ", 기록 있음" : ""}`} accessibilityState={{ selected: on }} style={s.day}>
                  <Text style={typo("caption1", "regular", T.label.alternative)}>{WEEK_NAMES[i]}</Text>
                  <View style={[s.dayNum, on && s.dayNumOn, !on && day === today && s.dayNumToday]}>
                    <Text style={typo("label1", on ? "bold" : "regular", on ? T.alias.staticWhite : T.label.normal)}>{parseDate(day).getDate()}</Text>
                  </View>
                  <View style={[s.dot, has && s.dotOn]} />
                </Pressable>
              );
            })}
          </View>
          <ListHeader title={date === today ? "오늘의 기록" : `${d.getMonth() + 1}월 ${d.getDate()}일의 기록`} action={`${daily.length}건`} onAction={() => router.replace("/journal/entries" as Href)} />
          {daily.map((j, i) => <JournalRow key={j.id} journal={j} onPress={() => router.push(`/journal-entry/${j.id}` as Href)} last={i === daily.length - 1} />)}
          {daily.length === 0 ? <EmptyState icon="notebook-pen" title="아직 남긴 기록이 없어요" text="오늘의 판단을 짧게라도 기록해 보세요." /> : null}
        </GroupCard>
      </GroupSection>

      <ContentSection style={s.compose}>
        <Button label="매매 기록하기" full onPress={() => router.push(`/journal-entry/form?date=${date}` as Href)} />
        <View style={s.privateRow}>
          <Icon name="lock-keyhole" size={16} color={T.label.alternative} />
          <Text style={typo("caption1", "regular", T.label.alternative)}>나의 매매일지는 나만 볼 수 있어요</Text>
        </View>
      </ContentSection>

      <BottomSheet open={goalOpen} title="작은 목표부터 시작해요" onClose={() => setGoalOpen(false)} footer={<Button label="기록 목표 저장" onPress={saveGoal} style={{ flex: 1 }} />}>
        <Text style={[typo("body2", "regular", T.label.alternative), { marginBottom: SP[16], paddingHorizontal: SP[8] }]}>{d.getMonth() + 1}월은 1~{daysInMonth(month)}일로 설정할 수 있어요. 임시 저장은 집계에서 제외해요.</Text>
        <Field label="이번 달 목표 기록 일수" value={goalInput} onChangeText={setGoalInput} keyboardType="number-pad" error={goalError} />
      </BottomSheet>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  summary: { padding: SP[16], gap: SP[16] },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metrics: { flexDirection: "row", gap: SP[16] },
  goal: { flexDirection: "row", alignItems: "center", gap: SP[16] },
  weekHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: SP[16], paddingRight: SP[8], paddingTop: SP[8] },
  weekActions: { flexDirection: "row", alignItems: "center" },
  week: { flexDirection: "row", paddingHorizontal: SP[8], paddingBottom: SP[8] },
  day: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 4 },
  dayNum: { width: 36, height: 36, borderRadius: RAD.full, alignItems: "center", justifyContent: "center" },
  dayNumOn: { backgroundColor: T.primary.normal },
  dayNumToday: { borderWidth: 1, borderColor: T.primary.normal },
  dot: { width: 6, height: 6, borderRadius: RAD.full, backgroundColor: "transparent" },
  dotOn: { backgroundColor: T.primary.normal },
  compose: { gap: SP[8], marginTop: SP[8] },
  privateRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SP[8] },
});
