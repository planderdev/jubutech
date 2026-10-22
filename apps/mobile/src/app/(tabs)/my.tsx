import { Text } from "react-native";
import { Screen } from "@/components/screen";
import { Card } from "@/components/ui";
import { text } from "@/theme";
import { USERS } from "@jubutech/shared";
const LIST = <Card style={{ gap: 4 }}><Text style={text.title18}>{USERS[0].nickname}</Text><Text style={text.body13}>{USERS[0].region} · {USERS[0].points.toLocaleString()}P</Text></Card>;
export default function My() {
  return (
    <Screen title="MY" subtitle="내 활동과 포인트">
      <Card><Text style={text.body14}>피그마 「주부테크 앱 UI」 03 Screens 의 MY 화면을 여기에 구현합니다.</Text></Card>
      {LIST}
    </Screen>
  );
}
