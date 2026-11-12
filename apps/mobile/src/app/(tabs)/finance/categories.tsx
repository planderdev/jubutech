import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { ChipRow, EmptyState, Pagination } from "@/components/campaign";
import { ArticleRow } from "@/components/finance";
import { SearchInput } from "@/components/form";
import { Icon } from "@/components/icon";
import { AppScreen, ContentSection } from "@/components/screen";
import { BottomSheet } from "@/components/sheet";
import { GroupCard, GroupSection, TextButton } from "@/components/ui";
import { useContent } from "@/lib/content";
import { useDemo } from "@/lib/demo-store";
import { RAD, SP, T, TOUCH, typo } from "@/theme";

const PER_PAGE = 6;
const SORTS = [{ key: "newest", label: "최신순" }, { key: "oldest", label: "오래된순" }] as const;
type Sort = (typeof SORTS)[number]["key"];

/** 돈되는 정보 — PHP `financeList()` (`/finance/categories?category&q&sort&page`): 검색 → 카테고리 칩 → 건수·정렬 시트 → 목록 6개/페이지 */
export default function FinanceList() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; q?: string }>();
  const { saved, toggleSaved } = useDemo();
  const content = useContent();
  const CHIPS = useMemo(() => [{ key: "", label: "전체" }, ...content.categories.map((c) => ({ key: c.id, label: c.name }))], [content.categories]);
  const [q, setQ] = useState(params.q ?? "");
  const [query, setQuery] = useState(params.q ?? "");
  const [category, setCategory] = useState(params.category ?? "");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState(false);

  // 홈 숏컷으로 다시 들어오면 쿼리를 반영한다
  const paramKey = `${params.category ?? ""}|${params.q ?? ""}`;
  const [seen, setSeen] = useState(paramKey);
  if (seen !== paramKey) {
    setSeen(paramKey);
    setCategory(params.category ?? "");
    setQ(params.q ?? "");
    setQuery(params.q ?? "");
    setPage(1);
  }

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = content.articles.filter((a) => (!category || a.categoryId === category) && (!needle || `${a.title} ${a.summary}`.toLowerCase().includes(needle)));
    return list.sort((a, b) => (sort === "newest" ? b.publishedAt.localeCompare(a.publishedAt) : a.publishedAt.localeCompare(b.publishedAt)));
  }, [query, category, sort, content.articles]);
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const items = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const reset = () => { setQ(""); setQuery(""); setCategory(""); setPage(1); };

  return (
    <AppScreen segments="finance">
      <ContentSection style={{ paddingTop: SP[16], paddingBottom: SP[8] }}>
        <SearchInput value={q} onChangeText={setQ} onSubmit={() => { setQuery(q); setPage(1); }} placeholder="정보 검색" label="정보 검색" />
      </ContentSection>
      <ChipRow items={CHIPS} value={category} onChange={(k) => { setCategory(k); setPage(1); }} />
      <ContentSection style={s.between}>
        <Text style={typo("label2", "regular", T.label.alternative)}><Text style={typo("label2", "bold", T.primary.normal)}>{rows.length}</Text>개의 정보</Text>
        <TextButton label={SORTS.find((x) => x.key === sort)?.label ?? "최신순"} icon="chevron-down" onPress={() => setSheet(true)} style={{ paddingHorizontal: 0 }} />
      </ContentSection>
      <GroupSection style={{ marginTop: SP[8] }}>
        <GroupCard>
          {items.map((a, i) => <ArticleRow key={a.id} article={a} saved={saved.includes(a.id)} onPress={() => router.push(`/article/${a.id}` as Href)} onToggleSave={() => toggleSaved(a.id)} last={i === items.length - 1} />)}
          {items.length === 0 ? <EmptyState icon="search" title="찾는 정보가 없어요" text="검색어와 카테고리를 초기화하고 다시 찾아보세요." actionLabel="조건 초기화" actionVariant="weak" onAction={reset} /> : null}
          <Pagination page={current} pages={pages} onChange={setPage} />
        </GroupCard>
      </GroupSection>
      <BottomSheet open={sheet} title="정보 정렬" onClose={() => setSheet(false)}>
        {SORTS.map((o) => (
          <Pressable key={o.key} onPress={() => { setSort(o.key); setPage(1); setSheet(false); }} accessibilityRole="radio" accessibilityState={{ selected: sort === o.key }} style={[s.choice, sort === o.key && s.choiceActive]}>
            <Text style={[typo("body1", sort === o.key ? "semibold" : "regular"), { flex: 1 }]}>{o.label}</Text>
            {sort === o.key ? <Icon name="check" size={20} color={T.primary.normal} /> : null}
          </Pressable>
        ))}
        <View style={{ height: SP[8] }} />
      </BottomSheet>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SP[8] },
  choice: { flexDirection: "row", alignItems: "center", gap: SP[16], minHeight: TOUCH, paddingHorizontal: SP[16], borderRadius: RAD.lg },
  choiceActive: { backgroundColor: T.primary.soft },
});
