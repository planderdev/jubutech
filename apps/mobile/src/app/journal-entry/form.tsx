import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { JOURNAL_ANSWER_LABEL, JOURNAL_CHECKLIST, JOURNAL_EMOTIONS, JOURNAL_MA_DAYS, JOURNAL_STEPS, JOURNAL_TREND_LABEL, emptyJournalAnswers, emptyJournalTrends, journalChecklistStats, journalToday, validateJournal, type JournalAnswer, type JournalErrors, type JournalInput, type JournalSide, type JournalTrend } from "@jubutech/shared";
import { ChipRow, EmptyState } from "@/components/campaign";
import { Accordion, BottomCta, Field, InfoBox } from "@/components/form";
import { Icon } from "@/components/icon";
import { ProgressBar, Segmented, won } from "@/components/journal";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, TextButton } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

const SIDES: { key: JournalSide; label: string }[] = [{ key: "buy", label: "매수 기록" }, { key: "sell", label: "매도·청산 기록" }];
const ANSWERS = (["unreviewed", "yes", "no"] as JournalAnswer[]).map((k) => ({ key: k, label: JOURNAL_ANSWER_LABEL[k] }));
const TRENDS = (["unreviewed", "up", "down", "flat"] as JournalTrend[]).map((k) => ({ key: k, label: JOURNAL_TREND_LABEL[k] }));
const EMOTIONS = [{ key: "", label: "선택 안 함" }, ...JOURNAL_EMOTIONS.map((e) => ({ key: e as string, label: e as string }))];
const TITLES: [string, string][] = [["어떤 거래를\n기록할까요?", "먼저 기본 거래 정보를 알려주세요."], ["나의 기준을\n점검해 볼까요?", "확인한 항목만 기록해도 괜찮아요."], ["추세와 리스크를\n차분히 살펴봐요", "선택 항목은 건너뛰어도 괜찮아요."], ["그때의 생각을\n짧게 남겨보세요", "미래의 내가 다시 읽어볼 이야기예요."], ["오늘의 기록을\n저장할 준비가 됐어요", "입력한 내용을 한 번 더 확인해 주세요."]];

/** 일지 작성·수정 — PHP `journalForm()`: 5단계(기본 거래 → 기준 점검 → 추세·리스크 → 생각 → 확인) + 임시 저장. `?id=` 수정, `?date=` 거래일 */
export default function JournalForm() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const { journals, member, saveJournal } = useDemo();
  const existing = params.id ? journals.find((j) => j.id === params.id && j.memberId === member.id) : undefined;
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<JournalErrors>({});
  const [f, setF] = useState<JournalInput>(() => ({
    tradeDate: existing?.tradeDate ?? params.date ?? journalToday(),
    symbol: existing?.symbol ?? "", stockName: existing?.stockName ?? "", side: existing?.side ?? "buy",
    unitPrice: existing ? String(existing.unitPrice) : "", quantity: existing ? String(existing.quantity) : "", fee: existing ? String(existing.fee) : "0", tax: existing ? String(existing.tax) : "0",
    reason: existing?.reason ?? "", reflection: existing?.reflection ?? "", emotion: existing?.emotion ?? "",
    checklistAnswers: existing?.checklistAnswers ?? emptyJournalAnswers(), trendChecks: existing?.trendChecks ?? emptyJournalTrends(),
    targetPrice: existing?.targetPrice ? String(existing.targetPrice) : "", stopLossPrice: existing?.stopLossPrice ? String(existing.stopLossPrice) : "",
    supportNote: existing?.supportNote ?? "", resistanceNote: existing?.resistanceNote ?? "", sellReview: existing?.sellReview ?? "", intraday: existing?.intraday ?? "", volumeNote: existing?.volumeNote ?? "", indexNote: existing?.indexNote ?? "",
  }));
  const up = <K extends keyof JournalInput>(k: K, v: JournalInput[K]) => setF((s) => ({ ...s, [k]: v }));
  const back = () => (step > 0 ? setStep(step - 1) : router.canGoBack() ? router.back() : router.replace("/journal" as Href));
  if (params.id && !existing) {
    return <AppScreen title="일지" onBack={back} tabBar={false}><ContentSection><EmptyState icon="lock-keyhole" title="접근할 수 없는 기록이에요" text="이 기록은 작성자만 볼 수 있어요." /></ContentSection></AppScreen>;
  }
  const stats = journalChecklistStats(f);
  const total = Number(f.unitPrice || 0) * Number(f.quantity || 0);
  const save = (draft: boolean) => {
    const e = validateJournal(f, draft);
    setErrors(e);
    if (Object.keys(e).length) {
      setStep(0);
      return;
    }
    const r = saveJournal({ id: existing?.id, input: f, draft });
    router.replace(`/journal-entry/${r.id}` as Href);
  };
  const next = () => {
    if (step === 0) {
      const e = validateJournal(f, false);
      setErrors(e);
      if (Object.keys(e).length) return;
    }
    setStep(step + 1);
  };
  const last = step === JOURNAL_STEPS.length - 1;

  return (
    <AppScreen title={existing ? "일지 수정" : "매매 기록"} onBack={back} tabBar={false} grouped={false} bottom={
      <BottomCta status={Object.keys(errors).length ? "입력을 확인해 주세요." : undefined} tone="error">
        <Button label="임시 저장" variant="neutral" onPress={() => save(true)} style={{ flex: 1 }} />
        {last ? <Button label="일지 저장" onPress={() => save(false)} style={{ flex: 1.4 }} /> : <Button label="다음" onPress={next} style={{ flex: 1.4 }} />}
      </BottomCta>
    }>
      <ContentSection style={s.stepHead}>
        <View style={s.between}>
          <Text style={typo("label2", "semibold", T.primary.normal)}>{JOURNAL_STEPS[step]}</Text>
          <Text style={typo("label2", "regular", T.label.alternative)}>{step + 1} / {JOURNAL_STEPS.length}</Text>
        </View>
        <ProgressBar value={(step + 1) / JOURNAL_STEPS.length} label={`${JOURNAL_STEPS.length}단계 중 ${step + 1}단계`} />
        <Text style={[typo("title2", "bold"), { marginTop: SP[8] }]}>{TITLES[step][0]}</Text>
        <Text style={typo("body2", "regular", T.label.neutral)}>{TITLES[step][1]}</Text>
      </ContentSection>

      {step === 0 ? (
        <ContentSection style={s.form}>
          <Segmented items={SIDES} value={f.side} onChange={(k) => up("side", k)} label="거래 구분" />
          <Field label="거래일" value={f.tradeDate} onChangeText={(v) => up("tradeDate", v)} placeholder="2026-10-21" error={errors.tradeDate} />
          <Text style={typo("caption1", "regular", T.label.alternative)}>국내주식 · 원화 기준</Text>
          <Field label="종목명" value={f.stockName} onChangeText={(v) => up("stockName", v.slice(0, 80))} placeholder="예: 삼성전자" error={errors.stockName} />
          <Field label="종목 코드 (선택)" value={f.symbol} onChangeText={(v) => up("symbol", v)} placeholder="예: 005930" keyboardType="number-pad" />
          <Field label="거래 단가 (원)" value={f.unitPrice} onChangeText={(v) => up("unitPrice", v)} keyboardType="decimal-pad" error={errors.unitPrice} />
          <Field label="수량 (주)" value={f.quantity} onChangeText={(v) => up("quantity", v)} keyboardType="number-pad" error={errors.quantity} />
          <Field label="수수료 (원)" value={f.fee} onChangeText={(v) => up("fee", v)} keyboardType="number-pad" error={errors.fee} />
          <Field label="거래세 (원)" value={f.tax} onChangeText={(v) => up("tax", v)} keyboardType="number-pad" error={errors.tax} />
          {total > 0 ? <InfoBox>{`총 거래금액 ${won(total)}`}</InfoBox> : null}
        </ContentSection>
      ) : null}

      {step === 1 ? (
        <ContentSection style={s.form}>
          <Text style={typo("label1", "semibold")}>{stats.yes}/{stats.total} 충족 · {stats.done}/{stats.total} 점검 완료</Text>
          {JOURNAL_CHECKLIST.filter((c) => c.enabled).map((c) => (
            <View key={c.id} style={{ gap: SP[8] }}>
              <Text style={typo("label1", "semibold")}>{c.title}</Text>
              <Text style={typo("caption1", "regular", T.label.alternative)}>{c.help}</Text>
              <Segmented items={ANSWERS} value={f.checklistAnswers[c.id] ?? "unreviewed"} onChange={(k) => up("checklistAnswers", { ...f.checklistAnswers, [c.id]: k })} label={c.title} />
            </View>
          ))}
          <Text style={typo("caption1", "regular", T.label.alternative)}>체크 결과는 나의 기준을 점검하는 기록이며 투자 추천 점수가 아니에요.</Text>
          <TextButton label="이 단계 건너뛰기" icon={null} onPress={() => setStep(2)} style={{ alignSelf: "center" }} />
        </ContentSection>
      ) : null}

      {step === 2 ? (
        <ContentSection style={s.form}>
          <Text style={typo("headline1", "bold")}>이평선 추세</Text>
          {JOURNAL_MA_DAYS.map((d) => (
            <View key={d} style={s.trend}>
              <Text style={[typo("label1", "regular"), { width: SP[48] }]}>{d}일선</Text>
              <View style={{ flex: 1 }}><Segmented items={TRENDS} value={f.trendChecks[d] ?? "unreviewed"} onChange={(k) => up("trendChecks", { ...f.trendChecks, [d]: k })} label={`${d}일선 추세`} /></View>
            </View>
          ))}
          <Text style={typo("headline1", "bold")}>리스크 관리</Text>
          <Field label="목표가 (원)" value={f.targetPrice} onChangeText={(v) => up("targetPrice", v)} keyboardType="number-pad" error={errors.targetPrice} />
          <Field label="손절선 (원)" value={f.stopLossPrice} onChangeText={(v) => up("stopLossPrice", v)} keyboardType="number-pad" error={errors.stopLossPrice} />
          <Field label="지지선 메모" value={f.supportNote} onChangeText={(v) => up("supportNote", v)} />
          <Field label="저항선 메모" value={f.resistanceNote} onChangeText={(v) => up("resistanceNote", v)} />
          <TextButton label="이 단계 건너뛰기" icon={null} onPress={() => setStep(3)} style={{ alignSelf: "center" }} />
        </ContentSection>
      ) : null}

      {step === 3 ? (
        <View>
          <ContentSection style={s.form}>
            <Field label="매매 이유" value={f.reason} onChangeText={(v) => up("reason", v)} multiline placeholder="어떤 기준으로 결정했나요?" />
            {f.side === "sell" ? <Field label="매도·청산 근거" value={f.sellReview} onChangeText={(v) => up("sellReview", v)} multiline /> : null}
            <Field label="복기 메모" value={f.reflection} onChangeText={(v) => up("reflection", v)} multiline placeholder="잘한 점, 다음에 바꾸고 싶은 점" />
            <Text style={typo("label1", "semibold")}>거래할 때의 감정</Text>
          </ContentSection>
          <ChipRow items={EMOTIONS} value={f.emotion} onChange={(k) => up("emotion", k)} />
          <ContentSection>
            <Accordion title="장중 대응과 시장 메모">
              <Field label="장중 대응" value={f.intraday} onChangeText={(v) => up("intraday", v)} multiline />
              <Field label="5분봉·거래량" value={f.volumeNote} onChangeText={(v) => up("volumeNote", v)} multiline />
              <Field label="지수 연동" value={f.indexNote} onChangeText={(v) => up("indexNote", v)} multiline />
            </Accordion>
          </ContentSection>
        </View>
      ) : null}

      {step === 4 ? (
        <ContentSection style={s.form}>
          <InfoBox>
            <Text style={typo("headline2", "semibold")}>{f.stockName || "종목명 없음"} · {f.side === "buy" ? "매수" : "매도"}</Text>
            <Text style={typo("body2", "regular", T.label.neutral)}>{f.tradeDate} · {won(total)} · 기준 {stats.yes}/{stats.total} 충족</Text>
          </InfoBox>
          <View style={s.private}>
            <Icon name="lock-keyhole" size={20} color={T.label.alternative} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={typo("label1", "semibold")}>나만 볼 수 있는 비공개 일지</Text>
              <Text style={typo("caption1", "regular", T.label.alternative)}>커뮤니티 공유는 저장 후 공개할 항목을 직접 고를 수 있어요.</Text>
            </View>
          </View>
        </ContentSection>
      ) : null}
    </AppScreen>
  );
}

const s = StyleSheet.create({
  stepHead: { gap: SP[8], paddingTop: SP[8], paddingBottom: SP[16] },
  between: { flexDirection: "row", justifyContent: "space-between" },
  form: { gap: SP[16] },
  trend: { flexDirection: "row", alignItems: "center", gap: SP[8] },
  private: { flexDirection: "row", gap: SP[8], alignItems: "center" },
});
