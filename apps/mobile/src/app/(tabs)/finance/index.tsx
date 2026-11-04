import { StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { DEMO_SETTINGS, matchArticles, demoHomeCategories, demoVisibleArticles, demoVisibleBanners } from "@jubutech/shared";
import { BannerSlider } from "@/components/banner-slider";
import { MoneyCards } from "@/components/money-cards";
import { ArticleRow, CategoryShortcuts, HomeContext } from "@/components/finance";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, CardFooterLink, GroupCard, GroupSection, ListHeader, MenuRow } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

/**
 * 재테크 홈 — PHP `financeHome()` (`/finance`) 그대로:
 * 홈 컨텍스트 → 배너 슬라이더 → 카테고리 숏컷 → 지금 읽기 좋은 정보 3건 → 나의 정보 모아보기 → 검토용 캡션.
 */
export default function FinanceHome() {
  const router = useRouter();
  const { member: me, saved, toggleSaved, subsidyProfile, rules } = useDemo();

  const articles = demoVisibleArticles();
  const featured = articles.find((a) => a.placement === "featured") ?? articles[0];
  const reading = articles.filter((a) => a.id !== featured?.id).slice(0, 3);
  const banners = demoVisibleBanners("finance");
  const categories = demoHomeCategories().slice(0, 4);

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
          <ListHeader title="내 조건에 맞는 지원금" action="조건 바꾸기" onAction={subsidyProfile.answered ? () => router.push("/subsidy-profile" as Href) : undefined} />
          {subsidyProfile.answered ? (
            (() => {
              const matched = matchArticles(articles, subsidyProfile).slice(0, 3);
              return matched.length ? matched.map((a, i) => <ArticleRow key={a.id} article={a} saved={saved.includes(a.id)} onPress={() => router.push(`/article/${a.id}` as Href)} onToggleSave={() => toggleSaved(a.id)} last={i === matched.length - 1} />) : <Text style={[typo("body2", "regular", T.label.alternative), s.empty]}>지금 맞는 정보가 없어요. 새로 올라오면 알려 드릴게요.</Text>;
            })()
          ) : (
            <View style={s.prompt}>
              <Text style={typo("body2", "regular", T.label.neutral)}>세 가지만 답하면 맞는 지원금을 골라, 마감 {rules.notify.subsidyDaysBefore}일 전에 알려 드려요.</Text>
              <Button label="맞춤 설정하기" variant="weak" size="lg" onPress={() => router.push("/subsidy-profile" as Href)} />
            </View>
          )}
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard>
          <CategoryShortcuts categories={categories} onPress={(c) => router.push(`/finance/categories?category=${c.id}` as Href)} onAll={goCategories} />
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title="지금 읽기 좋은 정보" onAction={goCategories} />
          {reading.map((a, i) => (
            <ArticleRow key={a.id} article={a} saved={saved.includes(a.id)} onPress={() => router.push(`/article/${a.id}` as Href)} onToggleSave={() => toggleSaved(a.id)} last={i === reading.length - 1} />
          ))}
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title="나의 정보 모아보기" />
          <MenuRow icon="bookmark" title="저장한 정보 다시 읽기" sub={`${saved.length}개`} onPress={() => router.push("/saved" as Href)} />
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

const s = StyleSheet.create({
  caption: { marginVertical: SP[16] },
  empty: { paddingHorizontal: SP[16], paddingBottom: SP[16] },
  prompt: { paddingHorizontal: SP[16], paddingBottom: SP[16], gap: SP[16] },
});
