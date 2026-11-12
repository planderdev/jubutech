import { Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { DEMO_NOTICES, demoDateLabel } from "@jubutech/shared";
import { PageTitle } from "@/components/campaign";
import { Accordion } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { Badge, GroupCard, GroupSection } from "@/components/ui";
import { SP, T, typo } from "@/theme";

/** 공지사항 — PHP `/notices`. 고정 공지 먼저, 최신순 */
export default function Notices() {
  const router = useRouter();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));
  const rows = [...DEMO_NOTICES].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
  return (
    <AppScreen title="공지사항" onBack={back} tabBar={false}>
      <ContentSection><PageTitle title="공지사항" /></ContentSection>
      <GroupSection>
        <GroupCard style={{ paddingHorizontal: SP[16] }}>
          {rows.map((n, i) => (
            <Accordion key={n.id} title={n.title} defaultOpen={i === 0}>
              <View style={{ flexDirection: "row", gap: SP[8], alignItems: "center" }}>
                {n.pinned ? <Badge label="고정" /> : null}
                <Text style={typo("caption1", "regular", T.label.alternative)}>{demoDateLabel(n.createdAt, "Y.m.d")}</Text>
              </View>
              <Text style={typo("body2", "regular")}>{n.body}</Text>
            </Accordion>
          ))}
        </GroupCard>
      </GroupSection>
    </AppScreen>
  );
}
