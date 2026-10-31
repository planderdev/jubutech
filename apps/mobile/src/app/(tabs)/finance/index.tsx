import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter, type Href } from "expo-router";
import { DEMO_MEMBERS, DEMO_SAVED, DEMO_SETTINGS, demoHomeCategories, demoVisibleArticles, demoVisibleBanners } from "@jubutech/shared";
import { BannerSlider } from "@/components/banner-slider";
import { MoneyCards } from "@/components/money-cards";
import { ArticleRow, CategoryShortcuts, HomeContext } from "@/components/finance";
import { AppScreen, ContentSection } from "@/components/screen";
import { CardFooterLink, GroupCard, GroupSection, ListHeader, MenuRow } from "@/components/ui";
import { SP, T, typo } from "@/theme";

/**
 * 재테크 홈 — PHP `financeHome()` (`/finance`) 그대로:
 * 홈 컨텍스트 → 배너 슬라이더 → 카테고리 숏컷 → 지금 읽기 좋은 정보 3건 → 나의 정보 모아보기 → 검토용 캡션.
 */
export default function FinanceHome() {
  const router = useRouter();
  const me = DEMO_MEMBERS[0];
  const [saved, setSaved] = useState<Set<string>>(() => new Set(DEMO_SAVED[me.id] ?? []));

  const articles = demoVisibleArticles();
  const featured = articles.find((a) => a.placement === "featured") ?? articles[0];
  const reading = articles.filter((a) => a.id !== featured?.id).slice(0, 3);
  const banners = demoVisibleBanners("finance");
  const categories = demoHomeCategories().slice(0, 4);

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const goCategories = () => router.push("/finance/categories");

  return (
    <AppScreen segments="finance">
      <ContentSection>
        <HomeContext name={me.nickname} message={DEMO_SETTINGS.financeIntro.replace("\n", " ")} />
      </ContentSection>

      <MoneyCards />

      <BannerSlider banners={banners} />

      <GroupSection>
        <GroupCard>
          <CategoryShortcuts categories={categories} onPress={goCategories} onAll={goCategories} />
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title="지금 읽기 좋은 정보" onAction={goCategories} />
          {reading.map((a, i) => (
            <ArticleRow key={a.id} article={a} saved={saved.has(a.id)} onToggleSave={() => toggleSave(a.id)} last={i === reading.length - 1} />
          ))}
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title="나의 정보 모아보기" />
          <MenuRow icon="bookmark" title="저장한 정보 다시 읽기" sub={`${saved.size}개`} />
          <MenuRow icon="messages-square" title="함께 나누는 이야기" sub="경험과 생활 팁" onPress={() => router.push("/community" as Href)} last />
          <CardFooterLink label="나의 활동 확인" onPress={() => router.push("/my" as Href)} />
        </GroupCard>
      </GroupSection>

      <ContentSection>
        <Text style={[typo("caption2", "regular", T.label.alternative), s.caption]}>화면 검토용 데모 · 2026.10.21 기준</Text>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({ caption: { marginVertical: SP[16] } });
