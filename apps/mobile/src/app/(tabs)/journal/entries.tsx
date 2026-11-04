import { Fragment, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { demoDateLabel, type DemoJournal } from "@jubutech/shared";
import { EmptyState, PageTitle, Pagination } from "@/components/campaign";
import { Field, SearchInput } from "@/components/form";
import { JournalRow, Segmented } from "@/components/journal";
import { AppScreen, ContentSection } from "@/components/screen";
import { BottomSheet } from "@/components/sheet";
import { Button, GroupCard, GroupSection, ListHeader } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

const PER_PAGE = 6;
type Side = "" | "buy" | "sell";
const SIDES: { key: Side; label: string }[] = [{ key: "", label: "전체" }, { key: "buy", label: "매수" }, { key: "sell", label: "매도" }];

/** 나의 투자 기록 — PHP `journalList()`: 조건 요약 + 검색·필터 시트(검색어·거래일·구분) → 날짜별 묶음 → 페이지 → 매매 기록하기 */
export default function JournalEntries() {
  const router = useRouter();
  const { journals, member } = useDemo();
  const [sheet, setSheet] = useState(false);
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [side, setSide] = useState<Side>("");
  const [draft, setDraft] = useState({ q: "", date: "", side: "" as Side });
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return journals
      .filter((j) => j.memberId === member.id && (!needle || `${j.stockName} ${j.reason}`.toLowerCase().includes(needle)) && (!date || j.tradeDate === date) && (!side || j.side === side))
      .sort((a, b) => b.tradeDate.localeCompare(a.tradeDate));
  }, [journals, member.id, q, date, side]);
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const items = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const open = () => { setDraft({ q, date, side }); setSheet(true); };
  const apply = () => { setQ(draft.q); setDate(draft.date); setSide(draft.side); setPage(1); setSheet(false); };
  const clear = () => { setQ(""); setDate(""); setSide(""); setPage(1); setSheet(false); };

  return (
    <AppScreen segments="journal">
      <ContentSection><PageTitle title="나의 투자 기록" sub="숫자 뒤에 있는 생각을 돌아봐요." /></ContentSection>
      <ContentSection style={s.between}>
        <Text style={[typo("label2", "regular", T.label.alternative), { flex: 1 }]}>{date || "모든 날짜"} · {side === "buy" ? "매수" : side === "sell" ? "매도" : "전체 거래"}{q ? ` · “${q}”` : ""}</Text>
        <Button label="검색·필터" variant="neutral" size="md" onPress={open} />
      </ContentSection>
      <GroupSection>
        <GroupCard>
          {items.map((j, i) => <Group key={j.id} journal={j} prev={items[i - 1]} last={i === items.length - 1} onPress={() => router.push(`/journal-entry/${j.id}` as Href)} />)}
          {items.length === 0 ? <EmptyState icon="notebook-pen" title="기록이 없어요" text="조건을 바꾸거나 새로운 기록을 남겨보세요." /> : null}
          <Pagination page={current} pages={pages} onChange={setPage} />
        </GroupCard>
      </GroupSection>
      <ContentSection><Button label="매매 기록하기" full onPress={() => router.push("/journal-entry/form" as Href)} /></ContentSection>
      <BottomSheet open={sheet} title="기록 검색·필터" onClose={() => setSheet(false)} footer={<><Button label="필터 해제" variant="neutral" onPress={clear} style={{ flex: 1 }} /><Button label="기록 찾기" onPress={apply} style={{ flex: 1.4 }} /></>}>
        <View style={{ gap: SP[16] }}>
          <SearchInput value={draft.q} onChangeText={(v) => setDraft((d) => ({ ...d, q: v }))} onSubmit={apply} placeholder="종목명 또는 메모 검색" label="일지 검색" icon="arrow-right" />
          <Field label="거래일" value={draft.date} onChangeText={(v) => setDraft((d) => ({ ...d, date: v }))} placeholder="2026-10-21" />
          <View style={{ gap: SP[8] }}>
            <Text style={typo("label1", "semibold")}>거래 구분</Text>
            <Segmented items={SIDES} value={draft.side} onChange={(k) => setDraft((d) => ({ ...d, side: k }))} label="거래 구분" />
          </View>
        </View>
      </BottomSheet>
    </AppScreen>
  );
}

function Group({ journal, prev, last, onPress }: { journal: DemoJournal; prev?: DemoJournal; last: boolean; onPress: () => void }) {
  return (
    <Fragment>
      {prev?.tradeDate !== journal.tradeDate ? <ListHeader title={demoDateLabel(journal.tradeDate, "n월 j일")} action="" /> : null}
      <JournalRow journal={journal} onPress={onPress} last={last} />
    </Fragment>
  );
}

const s = StyleSheet.create({ between: { flexDirection: "row", alignItems: "center", gap: SP[8], marginBottom: SP[8] } });
