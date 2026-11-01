import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { demoCampaignClosingSoon, demoCampaignState, demoVisibleCampaigns, type DemoCampaign, type DemoCampaignCategory } from "@jubutech/shared";
import { CampaignGrid, ChipRow, EmptyState, Pagination } from "@/components/campaign";
import { SearchInput } from "@/components/form";
import { Icon } from "@/components/icon";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, GroupCard, GroupSection, IconButton, TextButton } from "@/components/ui";
import { ELEV, RAD, SP, T, typo } from "@/theme";

type StateFilter = "" | "open" | "soon" | "upcoming" | "closed";
const STATES: { key: StateFilter; label: string }[] = [
  { key: "", label: "전체" },
  { key: "open", label: "모집 중" },
  { key: "soon", label: "마감 임박" },
  { key: "upcoming", label: "모집 예정" },
  { key: "closed", label: "모집 종료" },
];
const CATEGORIES: ("" | DemoCampaignCategory)[] = ["", "식품", "육아", "생활", "반려생활", "방문", "설문"];
const PER_PAGE = 6;

/**
 * 체험단 탐색 — PHP `campaignExplore()` (`/campaigns/explore?q&state&category&page`):
 * 검색 → 상태 칩 → 분류 라벨 + 필터 시트 → 2열 그리드(6개/페이지) → 페이지네이션.
 */
export default function CampaignExplore() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; state?: string; category?: string }>();
  const [q, setQ] = useState(params.q ?? "");
  const [query, setQuery] = useState(params.q ?? "");
  const [state, setState] = useState<StateFilter>((params.state as StateFilter) ?? "");
  const [category, setCategory] = useState<"" | DemoCampaignCategory>((params.category as DemoCampaignCategory) ?? "");
  const [draft, setDraft] = useState(category);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  // 탭에서 다시 진입했을 때 쿼리 파라미터(홈 숏컷·검색)를 반영
  const paramKey = `${params.q ?? ""}|${params.state ?? ""}|${params.category ?? ""}`;
  const [seenKey, setSeenKey] = useState(paramKey);
  if (seenKey !== paramKey) {
    setSeenKey(paramKey);
    setQ(params.q ?? "");
    setQuery(params.q ?? "");
    setState((params.state as StateFilter) ?? "");
    setCategory((params.category as DemoCampaignCategory) ?? "");
    setDraft((params.category as DemoCampaignCategory) ?? "");
    setPage(1);
  }

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return demoVisibleCampaigns().filter((c) => {
      const s = demoCampaignState(c);
      if (category && c.categoryId !== category) return false;
      if (state && (state === "soon" ? !demoCampaignClosingSoon(c) : s !== state)) return false;
      if (needle && !`${c.title} ${c.brand}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [query, state, category]);
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const items = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const openDetail = (c: DemoCampaign) => router.push(`/campaign/${c.id}` as Href);

  return (
    <AppScreen segments="campaigns">
      <ContentSection style={{ paddingTop: SP[16], paddingBottom: SP[8] }}>
        <SearchInput value={q} onChangeText={setQ} onSubmit={() => { setQuery(q); setPage(1); }} placeholder="제품이나 브랜드를 검색하세요" label="체험단 검색" icon="arrow-right" />
      </ContentSection>
      <ChipRow items={STATES} value={state} onChange={(k) => { setState(k); setPage(1); }} />
      <ContentSection style={s.between}>
        <Text style={typo("label2", "regular", T.label.alternative)}>{category || "모든 카테고리"}</Text>
        <TextButton label="필터" icon={null} color={T.label.normal} onPress={() => { setDraft(category); setFilterOpen(true); }} style={s.filterButton} />
      </ContentSection>

      <GroupSection>
        <GroupCard>
          <ContentSection style={s.gridWrap}>
            <Text style={s.srOnly} accessibilityLiveRegion="polite">{rows.length}개의 체험</Text>
            {items.length ? <CampaignGrid campaigns={items} onPress={openDetail} /> : <EmptyState icon="gift" title="지금은 맞는 체험이 없어요" text="조건을 바꾸어 다른 체험을 만나보세요." />}
            <Pagination page={current} pages={pages} onChange={setPage} />
          </ContentSection>
        </GroupCard>
      </GroupSection>

      <FilterSheet open={filterOpen} value={draft} onChange={setDraft} onClose={() => setFilterOpen(false)} onReset={() => { setCategory(""); setDraft(""); setPage(1); setFilterOpen(false); }} onApply={() => { setCategory(draft); setPage(1); setFilterOpen(false); }} />
    </AppScreen>
  );
}

/** PHP `sheetStart('campaign-filter','체험 조건을 골라주세요')` — 분류 라디오 바텀시트, 필터 해제 / 필터 적용 */
function FilterSheet({ open, value, onChange, onClose, onReset, onApply }: { open: boolean; value: "" | DemoCampaignCategory; onChange: (v: "" | DemoCampaignCategory) => void; onClose: () => void; onReset: () => void; onApply: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="닫기" />
      <View style={[s.sheet, { paddingBottom: SP[16] + insets.bottom }]}>
        <View style={s.sheetHeader}>
          <Text style={typo("heading2", "bold")}>체험 조건을 골라주세요</Text>
          <IconButton name="x" label="닫기" onPress={onClose} />
        </View>
        <Text style={[typo("headline2", "semibold"), { paddingHorizontal: SP[16], marginBottom: SP[8] }]}>체험 분류</Text>
        {CATEGORIES.map((c) => {
          const active = c === value;
          return (
            <Pressable key={c || "all"} onPress={() => onChange(c)} accessibilityRole="radio" accessibilityState={{ selected: active }} style={[s.choice, active && s.choiceActive]}>
              <Text style={[typo("body1", active ? "semibold" : "regular"), { flex: 1 }]}>{c || "전체"}</Text>
              <View style={[s.radio, active && s.radioActive]}>{active ? <View style={s.radioDot} /> : null}</View>
            </Pressable>
          );
        })}
        <View style={s.sheetButtons}>
          <Button label="필터 해제" variant="neutral" onPress={onReset} style={{ flex: 1 }} />
          <Button label="필터 적용" onPress={onApply} style={{ flex: 1.4 }} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: SP[8] },
  filterButton: { paddingHorizontal: 0 },
  gridWrap: { paddingVertical: SP[16] },
  srOnly: { position: "absolute", width: 1, height: 1, opacity: 0 },
  backdrop: { flex: 1, backgroundColor: T.material.dimmer },
  sheet: { backgroundColor: T.background.normalNormal, borderTopLeftRadius: RAD.xl, borderTopRightRadius: RAD.xl, paddingTop: SP[8], ...ELEV.large },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: SP[24], paddingRight: SP[8], minHeight: SP[56], marginBottom: SP[8] },
  choice: { flexDirection: "row", alignItems: "center", gap: SP[16], marginHorizontal: SP[16], paddingHorizontal: SP[16], minHeight: SP[56], borderRadius: RAD.lg, borderWidth: 1, borderColor: "transparent" },
  choiceActive: { backgroundColor: T.primary.soft, borderColor: T.primary.normal },
  radio: { width: 24, height: 24, borderRadius: RAD.full, borderWidth: 2, borderColor: T.line.normalNormal, alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: T.primary.normal },
  radioDot: { width: 12, height: 12, borderRadius: RAD.full, backgroundColor: T.primary.normal },
  sheetButtons: { flexDirection: "row", gap: SP[8], paddingHorizontal: SP[16], paddingTop: SP[16] },
});
