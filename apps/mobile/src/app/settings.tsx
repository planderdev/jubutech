import { Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import Constants from "expo-constants";
import { PageTitle } from "@/components/campaign";
import { Checkbox } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { GroupCard, GroupSection, ListHeader, MenuRow } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

/**
 * 설정 — 앱 정보와 개발 빌드 검토 스위치. 알림 설정은 알림 단위(2단계 W10)에서 이 화면에 붙는다.
 * 검토 스위치는 `__DEV__` 에서만: 운영 값은 관리자 설정(`/admin7/settings`) → `app_settings` 로 바뀐다.
 */
export default function Settings() {
  const router = useRouter();
  const { rules, setRuleOverride } = useDemo();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));
  return (
    <AppScreen title="설정" onBack={back} tabBar={false}>
      <ContentSection><PageTitle title="설정" /></ContentSection>
      <GroupSection>
        <GroupCard>
          <ListHeader title="앱 정보" action="" />
          <MenuRow icon="clipboard-check" title="약관·개인정보" onPress={() => router.push("/legal/terms" as Href)} />
          <MenuRow icon="sparkles" title="앱 버전" sub={Constants.expoConfig?.version ?? "0.1.0"} subAccent={false} last />
        </GroupCard>
      </GroupSection>
      {__DEV__ ? (
        <GroupSection>
          <GroupCard>
            <ListHeader title="검토용 스위치 (개발 빌드)" action="" />
            <View style={{ paddingHorizontal: SP[16], paddingBottom: SP[16], gap: SP[8] }}>
              <Checkbox checked={rules.trust.visibleToUsers} onChange={(v) => setRuleOverride("trust.visibleToUsers", v)} label={`${rules.trust.name} 사용자에게 보이기`} sub="운영에서는 관리자 설정의 trust.visibleToUsers" />
              <Text style={typo("caption1", "regular", T.label.alternative)}>이 기기에만 적용돼요.</Text>
            </View>
          </GroupCard>
        </GroupSection>
      ) : null}
    </AppScreen>
  );
}
