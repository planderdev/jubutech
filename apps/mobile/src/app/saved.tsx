import { useRouter, type Href } from "expo-router";
import { demoVisibleArticles } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { ArticleRow } from "@/components/finance";
import { AppScreen, ContentSection } from "@/components/screen";
import { GroupCard, GroupSection } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";

/** 저장한 정보 — PHP `savedArticles()` (`/finance/saved`) */
export default function SavedArticles() {
  const router = useRouter();
  const { saved, toggleSaved } = useDemo();
  const rows = demoVisibleArticles().filter((a) => saved.includes(a.id));
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));
  return (
    <AppScreen title="저장한 정보" onBack={back} tabBar={false}>
      <ContentSection><PageTitle title="저장한 정보" /></ContentSection>
      {rows.length === 0 ? (
        <ContentSection><EmptyState icon="bookmark" title="아직 저장한 정보가 없어요" text="마음에 드는 글의 북마크를 눌러보세요." actionLabel="정보 둘러보기" actionVariant="weak" onAction={() => router.push("/finance/categories" as Href)} /></ContentSection>
      ) : (
        <GroupSection>
          <GroupCard>
            {rows.map((a, i) => <ArticleRow key={a.id} article={a} saved onPress={() => router.push(`/article/${a.id}` as Href)} onToggleSave={() => toggleSaved(a.id)} last={i === rows.length - 1} />)}
          </GroupCard>
        </GroupSection>
      )}
    </AppScreen>
  );
}
