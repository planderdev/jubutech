import { Text } from "react-native";
import { Screen } from "@/components/screen";
import { Card } from "@/components/ui";
import { text } from "@/theme";
import { POSTS } from "@jubutech/shared";
const LIST = POSTS.map((p) => <Card key={p.id} style={{ gap: 6 }}><Text style={text.title16}>{p.title}</Text><Text style={text.body13} numberOfLines={2}>{p.body}</Text></Card>);
export default function Community() {
  return (
    <Screen title="커뮤니티" subtitle="수익 인증부터 지원금 제보, 매매 복기까지">
      <Card><Text style={text.body14}>피그마 「주부테크 앱 UI」 03 Screens 의 커뮤니티 화면을 여기에 구현합니다.</Text></Card>
      {LIST}
    </Screen>
  );
}
