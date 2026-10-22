import { Text } from "react-native";
import { Screen } from "@/components/screen";
import { Card } from "@/components/ui";
import { text } from "@/theme";
import { CAMPAIGNS } from "@jubutech/shared";
const LIST = CAMPAIGNS.map((c) => <Card key={c.id} style={{ gap: 6 }}><Text style={text.label12}>{c.brand}</Text><Text style={text.title16}>{c.title}</Text><Text style={text.body13}>{c.reward.desc}</Text></Card>);
export default function Campaigns() {
  return (
    <Screen title="체험단 · 미션" subtitle="검증된 광고주의 캠페인만 올라와요">
      <Card><Text style={text.body14}>피그마 「주부테크 앱 UI」 03 Screens 의 체험단 · 미션 화면을 여기에 구현합니다.</Text></Card>
      {LIST}
    </Screen>
  );
}
