import { Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { STORE_LISTING } from "@jubutech/shared";
import { PageTitle } from "@/components/campaign";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, GroupCard, GroupSection } from "@/components/ui";
import { SP, T, typo } from "@/theme";

/** 서비스 소개·제휴 — 스토어 설명과 같은 문구(`STORE_LISTING`). 제휴는 문의하기로 받는다 */
export default function About() {
  const router = useRouter();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));
  return (
    <AppScreen title="서비스 소개" onBack={back} tabBar={false}>
      <ContentSection><PageTitle title={STORE_LISTING.name} sub={STORE_LISTING.subtitle} /></ContentSection>
      <GroupSection>
        <GroupCard style={{ padding: SP[16], gap: SP[8] }}>
          <Text style={typo("body2", "regular")}>{STORE_LISTING.description}</Text>
        </GroupCard>
      </GroupSection>
      <GroupSection>
        <GroupCard style={{ padding: SP[16], gap: SP[16] }}>
          <View style={{ gap: 4 }}>
            <Text style={typo("headline2", "semibold")}>제품을 체험단으로 알리고 싶으세요?</Text>
            <Text style={typo("body2", "regular", T.label.alternative)}>광고주 센터에서 직접 등록하거나, 선정까지 맡기실 수 있어요.</Text>
          </View>
          <Button label="제휴 문의하기" variant="weak" size="lg" onPress={() => router.push("/contact" as Href)} />
        </GroupCard>
      </GroupSection>
    </AppScreen>
  );
}
