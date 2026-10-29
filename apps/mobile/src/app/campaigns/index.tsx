import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter, type Href } from "expo-router";
import { DEMO_MEMBERS, DEMO_SETTINGS, demoCampaignState, demoVisibleBanners, demoVisibleCampaigns } from "@jubutech/shared";
import { BannerSlider } from "@/components/banner-slider";
import { CampaignGrid, CampaignShortcuts } from "@/components/campaign";
import { HomeContext } from "@/components/finance";
import { SearchInput } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { GroupCard, GroupSection, ListHeader } from "@/components/ui";
import { SP, T, typo } from "@/theme";

/**
 * 체험단 홈 — PHP `campaignHome()` (`/campaigns`):
 * 검색 → 배너 → 분류 숏컷 → "지금 참여할 수 있는 체험" 4건 → 검토용 캡션.
 */
export default function CampaignHome() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const me = DEMO_MEMBERS[0];
  const open = demoVisibleCampaigns().filter((c) => demoCampaignState(c) === "open");
  const explore = (params: Record<string, string>) => router.push({ pathname: "/campaigns/explore", params } as Href);

  return (
    <AppScreen>
      <ContentSection>
        <HomeContext name={me.nickname} message={DEMO_SETTINGS.campaignsIntro.replace("\n", " ")} />
        <SearchInput value={q} onChangeText={setQ} onSubmit={() => explore({ q })} placeholder="어떤 체험을 찾으세요?" label="체험단 검색" />
      </ContentSection>

      <BannerSlider banners={demoVisibleBanners("campaigns")} onPress={() => explore({})} />

      <GroupSection>
        <GroupCard>
          <CampaignShortcuts onPress={(category) => explore({ category })} />
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title="지금 참여할 수 있는 체험" onAction={() => explore({})} />
          <ContentSection style={s.gridWrap}>
            <CampaignGrid campaigns={open.slice(0, 4)} onPress={(c) => router.push(`/campaign/${c.id}` as Href)} />
          </ContentSection>
        </GroupCard>
      </GroupSection>

      <ContentSection>
        <Text style={[typo("caption2", "regular", T.label.alternative), s.caption]}>데모 기준 2026.10.21 · 제공 내역과 보상은 예시예요.</Text>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({ gridWrap: { paddingBottom: SP[16] }, caption: { marginVertical: SP[24] } });
