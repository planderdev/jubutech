import { StyleSheet, Text, View } from "react-native";
import { INFO, POSTS, USERS, fmtNum } from "@jubutech/shared";
import { Screen } from "@/components/screen";
import { Badge, Button, Card, Chip, SectionHeader } from "@/components/ui";
import { C, text } from "@/theme";

const QUICK = ["지원금", "체험단", "부업", "매매일지", "육아·교육", "반려생활"];

export default function Home() {
  const me = USERS[0];
  return (
    <Screen title={`${me.nickname}님, 반가워요`}>
      <View style={{ flexDirection: "row", gap: 8 }}>{["전체", "수익인증", "부업후기", "지원금제보"].map((c, i) => <Chip key={c} label={c} on={i === 0} />)}</View>
      <Card style={{ alignItems: "center", paddingVertical: 10 }}><Text style={[text.body13, { color: C.primary }]}>이번 주 첫 수익을 만든 <Text style={text.label13}>5명의 주부</Text></Text></Card>
      <View style={s.grid}>{QUICK.map((q) => <View key={q} style={s.quick}><View style={s.quickIcon} /><Text style={text.label12}>{q}</Text></View>)}</View>
      <Card style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
        <View style={s.tile} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={text.label12}>오늘의 미션</Text>
          <Text style={text.title16}>영수증 한 장으로 <Text style={{ color: C.primary }}>+500P</Text></Text>
          <Text style={text.body13}>7일 연속이면 보너스까지.</Text>
          <View style={{ alignSelf: "flex-start", marginTop: 6 }}><Button label="인증하러 가기" variant="ink" /></View>
        </View>
      </Card>
      <SectionHeader title="오늘의 돈되는 정보" action="전체 보기" />
      {INFO.slice(0, 2).map((a) => (
        <Card key={a.id} style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}><Badge label={a.category === "subsidy" ? "지원금" : "정보"} tone="soft" />{a.deadline ? <Badge label="D-day" tone="primary" /> : null}<Text style={[text.label12, { marginLeft: "auto", color: C.primary }]}>+{a.rewardPoints}P</Text></View>
          <Text style={text.title16}>{a.title}</Text>
          <Text style={text.body13} numberOfLines={2}>{a.summary}</Text>
        </Card>
      ))}
      <SectionHeader title="커뮤니티" action="더 보기" />
      {POSTS.slice(0, 2).map((p) => (
        <Card key={p.id} style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}><Badge label={p.board} />{p.income ? <Text style={[text.label12, { color: C.up }]}>+{fmtNum(p.income)}원</Text> : null}</View>
          <Text style={text.title16}>{p.title}</Text>
          <Text style={text.body13} numberOfLines={2}>{p.body}</Text>
        </Card>
      ))}
    </Screen>
  );
}
const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 4 },
  quick: { width: "31%", alignItems: "center", gap: 8, paddingVertical: 10 },
  quickIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: C.primaryTint },
  tile: { width: 88, height: 88, borderRadius: 16, backgroundColor: C.inset },
});
