import { Text } from "react-native";
import { Screen } from "@/components/screen";
import { Card } from "@/components/ui";
import { text } from "@/theme";
import { INFO } from "@jubutech/shared";
const LIST = INFO.map((a) => <Card key={a.id} style={{ gap: 6 }}><Text style={text.title16}>{a.title}</Text><Text style={text.body13} numberOfLines={2}>{a.summary}</Text></Card>);
export default function Info() {
  return (
    <Screen title="돈되는정보" subtitle="정책·지원금·카드혜택을 출처와 기준일까지">
      <Card><Text style={text.body14}>피그마 「주부테크 앱 UI」 03 Screens 의 돈되는정보 화면을 여기에 구현합니다.</Text></Card>
      {LIST}
    </Screen>
  );
}
