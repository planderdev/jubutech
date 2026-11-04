import { Linking, Share, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { demoCategoryName, demoDateLabel, demoVisibleArticles } from "@jubutech/shared";
import { EmptyState } from "@/components/campaign";
import { ArticleRow } from "@/components/finance";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, GroupCard, GroupSection, ListHeader, TextButton } from "@/components/ui";
import { noticeDialog } from "@/lib/dialog";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

/** 정보 글 — PHP `articleDetail()` (`/finance/articles/{id}`): 분류·제목·작성 → 요약 → 본문 블록 → 출처 → 저장·공유 → 이런 이야기도 있어요 */
export default function ArticleDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { saved, toggleSaved } = useDemo();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/finance/categories" as Href));
  const articles = demoVisibleArticles();
  const a = articles.find((x) => x.id === id);
  if (!a) {
    return (
      <AppScreen title="정보" onBack={back} tabBar={false}>
        <ContentSection><EmptyState icon="newspaper" title="찾는 정보가 없어요" text="내려갔거나 주소가 바뀐 글이에요." actionLabel="정보 둘러보기" actionVariant="weak" onAction={() => router.replace("/finance/categories" as Href)} /></ContentSection>
      </AppScreen>
    );
  }
  const isSaved = saved.includes(a.id);
  const related = articles.filter((r) => r.id !== a.id).slice(0, 2);
  const share = async () => {
    try {
      await Share.share({ message: `${a.title}\n${a.summary}`, title: a.title });
    } catch {
      noticeDialog("공유", "이 기기에서는 공유 시트를 열 수 없어요.");
    }
  };

  return (
    <AppScreen title={demoCategoryName(a.categoryId)} onBack={back} tabBar={false}>
      <View style={s.paper}>
        <ContentSection style={s.article}>
          <View style={{ gap: SP[8] }}>
            <Text style={typo("label2", "regular", T.label.alternative)}>{demoCategoryName(a.categoryId)}</Text>
            <Text style={typo("title2", "bold")}>{a.title}</Text>
            <Text style={typo("caption1", "regular", T.label.alternative)}>주부테크 편집팀 · {demoDateLabel(a.publishedAt, "Y.m.d")}</Text>
          </View>
          <Text style={typo("body1", "semibold")}>{a.summary}</Text>
          {a.bodyBlocks.filter((b) => b.text.trim() !== a.summary.trim()).map((b, i) => (b.type === "heading" ? <Text key={i} style={[typo("heading2", "bold"), { marginTop: SP[8] }]}>{b.text}</Text> : <Text key={i} style={typo("body1", "regular")}>{b.text}</Text>))}
          <View style={s.source}>
            <Text style={typo("caption1", "regular", T.label.alternative)}>출처: {a.source} · {demoDateLabel(a.publishedAt, "Y.m.d")} 기준</Text>
            <Text style={typo("caption2", "regular", T.label.alternative)}>화면 검토용 예시입니다. 실제 정책 금액·조건은 공식 안내를 확인해 주세요.</Text>
            {a.sourceUrl ? <TextButton label="공식 출처" icon="external-link" onPress={() => Linking.openURL(a.sourceUrl)} style={{ paddingHorizontal: 0, alignSelf: "flex-start" }} /> : null}
          </View>
          <View style={s.actions}>
            <Button label={isSaved ? "저장됨" : "저장"} variant="weak" size="lg" onPress={() => toggleSaved(a.id)} style={{ flex: 1 }} />
            <Button label="공유" variant="neutral" size="lg" onPress={share} style={{ flex: 1 }} />
          </View>
        </ContentSection>
      </View>
      <GroupSection>
        <GroupCard>
          <ListHeader title="이런 이야기도 있어요" action="" />
          {related.map((r, i) => <ArticleRow key={r.id} article={r} saved={saved.includes(r.id)} onPress={() => router.push(`/article/${r.id}` as Href)} onToggleSave={() => toggleSaved(r.id)} last={i === related.length - 1} />)}
        </GroupCard>
      </GroupSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  paper: { backgroundColor: T.background.normalNormal },
  article: { gap: SP[16], paddingVertical: SP[16] },
  source: { gap: 4, paddingTop: SP[16], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.line.solidNormal },
  actions: { flexDirection: "row", gap: SP[8] },
});
