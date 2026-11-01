import { useState } from "react";
import { Alert, Share, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter, type Href } from "expo-router";
import { DEFAULT_RULES, DEMO_MEMBERS, inviteBonusLabel, inviteShareMessage } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { InfoBox } from "@/components/form";
import { Icon } from "@/components/icon";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, GroupCard, GroupSection, ListHeader } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { RAD, SP, T, typo } from "@/theme";

/**
 * 친구 초대 (2-3) — 내 초대 코드 큰 글씨 + 복사 + 공유(시스템 공유 시트 → 카카오톡 등), 보너스 안내, 초대한 친구 목록.
 * 코드는 회원당 하나(결정적 생성). 보너스 종류는 설정 `invite.bonus`.
 */
export default function Invite() {
  const router = useRouter();
  const store = useDemo();
  const mine = store.myInviteCode();
  const bonus = inviteBonusLabel(DEFAULT_RULES);
  const [copied, setCopied] = useState(false);
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL;
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));

  const copy = async () => {
    await Clipboard.setStringAsync(mine.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const share = async () => {
    try {
      await Share.share({ message: inviteShareMessage(mine.code, DEFAULT_RULES, webUrl), title: "주부테크 초대" });
    } catch (e) {
      Alert.alert("공유하지 못했어요", e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <AppScreen title="친구 초대" onBack={back} tabBar={false}>
      <ContentSection>
        <PageTitle title="친구를 초대하면 둘 다 좋아요" sub={`초대받은 친구가 가입하면 두 사람 모두 ${bonus.short}.`} />
      </ContentSection>

      <GroupSection style={{ marginTop: 0 }}>
        <GroupCard style={s.codeCard}>
          <Text style={typo("label2", "regular", T.label.alternative)}>내 초대 코드</Text>
          <Text style={typo("display2", "bold", T.primary.normal)} selectable accessibilityLabel={`초대 코드 ${mine.code}`}>{mine.code}</Text>
          <View style={s.buttons}>
            <Button label={copied ? "복사됨" : "코드 복사"} variant="neutral" size="lg" onPress={copy} style={{ flex: 1 }} />
            <Button label="카톡으로 공유" size="lg" onPress={share} style={{ flex: 1.4 }} />
          </View>
          <Text style={typo("caption1", "regular", T.label.alternative)}>공유 버튼은 기기의 공유 시트를 열어요. 카카오톡을 고르면 코드가 담긴 글이 보내져요.</Text>
        </GroupCard>
      </GroupSection>

      <ContentSection>
        <InfoBox>
          <View style={s.row}><Icon name="gift" size={20} color={T.primary.normal} /><Text style={[typo("label1", "semibold"), { flex: 1 }]}>{bonus.short}</Text></View>
          <Text style={typo("body2", "regular", T.label.neutral)}>{bonus.detail}</Text>
          <Text style={typo("caption1", "regular", T.label.alternative)}>친구는 가입(온보딩) 화면에서 코드를 넣어요. 한 사람은 코드 하나만 쓸 수 있고, 내 코드는 내가 쓸 수 없어요.</Text>
        </InfoBox>
      </ContentSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title={`초대한 친구 ${mine.uses.length}명`} />
          {mine.uses.length === 0 ? (
            <EmptyState icon="user-round" title="아직 초대한 친구가 없어요" text="코드를 공유하면 가입한 친구가 여기에 보여요." />
          ) : (
            mine.uses.map((u, i) => {
              const m = DEMO_MEMBERS.find((x) => x.id === u.userId);
              return (
                <View key={u.userId} style={[s.use, i < mine.uses.length - 1 && s.useDivider]}>
                  <View style={s.avatar}><Text style={typo("label1", "bold", T.primary.normal)}>{(m?.nickname ?? "친구").slice(0, 1)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={typo("body2", "semibold")}>{m?.nickname ?? "새 회원"}</Text>
                    <Text style={typo("caption1", "regular", T.label.alternative)}>{u.usedAt.slice(0, 10).replace(/-/g, ".")} 가입 · {bonus.short} 지급</Text>
                  </View>
                </View>
              );
            })
          )}
        </GroupCard>
      </GroupSection>

      <ContentSection>
        <Text style={[typo("caption2", "regular", T.label.alternative), { marginVertical: SP[16] }]}>보너스 종류와 조건은 운영 설정에서 바뀔 수 있어요 · 검토용 데모</Text>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  codeCard: { padding: SP[24], gap: SP[16], alignItems: "center" },
  buttons: { flexDirection: "row", gap: SP[8], alignSelf: "stretch" },
  row: { flexDirection: "row", alignItems: "center", gap: SP[8] },
  use: { flexDirection: "row", alignItems: "center", gap: SP[16], paddingHorizontal: SP[16], paddingVertical: SP[16] },
  useDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  avatar: { width: SP[40], height: SP[40], borderRadius: RAD.full, backgroundColor: T.primary.soft, alignItems: "center", justifyContent: "center" },
});
