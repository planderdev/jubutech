import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import type { ServiceMode } from "@jubutech/shared";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, GroupCard, GroupSection, ListHeader, MenuRow, TextButton } from "@/components/ui";
import { WalletCard } from "@/components/wallet";
import { useAuth } from "@/lib/auth";
import { useDemo, useMyApplications } from "@/lib/demo-store";
import { RAD, SP, T, typo } from "@/theme";

/**
 * 마이 — PHP `myPage()` (`/mypage?mode=…`) 그대로:
 * 프로필 카드 → (PHP 포인트 패널 자리에) 1-3 지갑 카드 → 나의 활동 → 주부테크와 함께 → 캡션.
 * B안에서는 루트 `마이` 탭 하나가 이 화면을 쓴다. `mode` 는 나의 활동 첫 두 줄 순서(PHP 와 같음)만 바꾼다.
 */
export function MyPage({ mode = "campaigns" }: { mode?: ServiceMode }) {
  const router = useRouter();
  const { member, saved } = useDemo();
  const mine = useMyApplications();
  const auth = useAuth();
  // 로그인돼 있으면 카카오 프로필 이름을, 아니면 데모 회원(서연맘)을 보여 준다. 데이터 연결(W8) 전까지 응모·지갑은 데모 회원 기준
  const nickname = auth.user?.nickname ?? member.nickname;
  const invited = useDemo().inviteCodes.find((c) => c.ownerId === member.id)?.uses.length ?? 0;
  const soon = (what: string) => () => Alert.alert(what, "이 화면은 다음 작업에서 들어와요.");
  const applications = { icon: "gift", title: "내 응모 현황", sub: `${mine.length}건`, onPress: () => router.push("/campaigns/applications" as Href) };
  const journals = { icon: "notebook-pen", title: "나의 매매일지", sub: "0건", onPress: () => router.push("/journal/entries" as Href) };
  const first = mode === "journal" ? [journals, applications] : [applications, journals];

  return (
    <AppScreen heading="마이">
      <GroupSection>
        <GroupCard style={s.profile}>
          <View style={s.avatar} accessibilityRole="image" accessibilityLabel={`${nickname} 아바타`}>
            <Text style={typo("heading1", "bold", T.primary.normal)}>{nickname.slice(0, 1)}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={typo("label2", "regular", T.label.alternative)}>{auth.status === "signed-in" ? `카카오 계정 · ${auth.user?.email ?? "연결됨"}` : "오늘도 나만의 속도로"}</Text>
            <Text style={typo("title2", "bold")}>{nickname}님</Text>
            <TextButton label="Lv. 3 · 꾸준한 새싹" onPress={soon("배지")} style={{ alignSelf: "flex-start", paddingHorizontal: 0 }} />
          </View>
        </GroupCard>
        {auth.status === "guest" || auth.status === "demo" ? (
          <GroupCard style={[s.profile, { marginTop: SP[8], justifyContent: "space-between" }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={typo("label1", "semibold")}>{auth.status === "demo" ? "데모 계정으로 보는 중" : "로그인하면 내 기록이 저장돼요"}</Text>
              <Text style={typo("caption1", "regular", T.label.alternative)}>{auth.status === "demo" ? "카카오 로그인 키 등록 전" : "카카오로 3초 만에"}</Text>
            </View>
            <Button label="로그인" variant="weak" size="md" onPress={() => router.push("/login?next=/my" as Href)} />
          </GroupCard>
        ) : null}
      </GroupSection>

      <WalletCard />

      <GroupSection>
        <GroupCard>
          <ListHeader title="나의 활동" />
          {first.map((it) => <MenuRow key={it.title} icon={it.icon} title={it.title} sub={it.sub} onPress={it.onPress} />)}
          <MenuRow icon="bookmark" title="저장한 정보" sub={`${saved.length}개`} subAccent={false} onPress={() => router.push("/finance/categories" as Href)} />
          <MenuRow icon="clipboard-check" title="진행 중인 미션" sub={`${mine.filter((a) => a.selectionStatus === "selected").length}건`} onPress={() => router.push("/campaigns/applications" as Href)} />
          <MenuRow icon="messages-square" title="내가 쓴 글" onPress={() => router.push("/community" as Href)} last />
        </GroupCard>
      </GroupSection>

      <GroupSection>
        <GroupCard>
          <ListHeader title="주부테크와 함께" />
          <MenuRow icon="gift" title="친구 초대" sub={`${invited}명 가입`} onPress={() => router.push("/invite" as Href)} />
          <MenuRow icon="megaphone" title="공지사항" onPress={soon("공지사항")} />
          <MenuRow icon="message-circle" title="문의하기" onPress={soon("문의하기")} />
          <MenuRow icon="sprout" title="서비스 소개·제휴 문의" onPress={soon("서비스 소개")} />
          <MenuRow icon="settings" title="설정" onPress={soon("설정")} last={auth.status !== "signed-in"} />
          {auth.status === "signed-in" ? <MenuRow icon="x" title="로그아웃" onPress={() => auth.signOut()} last /> : null}
        </GroupCard>
      </GroupSection>

      <ContentSection>
        <Text style={[typo("caption2", "regular", T.label.alternative), { marginVertical: SP[16] }]}>화면 검토용 데모 · 금액은 실제 지급이 없는 예시예요</Text>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  profile: { flexDirection: "row", alignItems: "center", gap: SP[16], padding: SP[16] },
  avatar: { width: SP[56], height: SP[56], borderRadius: RAD.full, backgroundColor: T.primary.soft, alignItems: "center", justifyContent: "center" },
});
