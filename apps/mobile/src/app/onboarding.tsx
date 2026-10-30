import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icon";
import { KakaoButton } from "@/components/kakao-button";
import { Button, TextButton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { DEFAULT_SERVICE, SERVICES, saveLastService, saveOnboarded, type ServiceMode } from "@/lib/service";
import { RAD, SHELL, SP, T, typo } from "@/theme";

/**
 * 첫 실행 온보딩 (1-4) — "어떤 일상을 시작할까요?" 목적 하나를 고르면 그 서비스가 기본 홈이 된다. 고르지 않으면 체험단.
 * PHP `mode-sheet` 의 선택 행(`.list-row--choice`)과 같은 모양. 초대 코드 입력은 W7 에서 이 화면에 붙는다.
 */
const PURPOSES: { key: ServiceMode; title: string; description: string; icon: string }[] = [
  { key: "campaigns", title: "체험단으로 용돈 벌기", description: "제품 받고 후기 쓰면 리워드가 쌓여요", icon: "gift" },
  { key: "finance", title: "우리 집 지원금 찾기", description: "놓치기 쉬운 지원금·혜택을 모아 봐요", icon: "landmark" },
  { key: "journal", title: "주식 매매 기록하기", description: "나의 판단을 돌아보는 매매일지", icon: "notebook-pen" },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [choice, setChoice] = useState<ServiceMode | null>(null);
  const auth = useAuth();

  const start = (key: ServiceMode) => {
    saveOnboarded();
    saveLastService(key);
    router.replace(`/${key}` as Href);
  };
  /** 카카오로 시작 — 목적을 저장한 뒤 로그인 화면으로. 키가 없으면 로그인 화면이 데모 안내를 띄운다 */
  const startWithKakao = () => {
    const key = choice ?? DEFAULT_SERVICE;
    saveOnboarded();
    saveLastService(key);
    router.replace(`/login?next=/${key}` as Href);
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top + SP[40], paddingBottom: insets.bottom + SP[16] }]}>
      <View style={{ gap: SP[8] }}>
        <Text style={typo("label1", "semibold", T.primary.normal)}>주부테크</Text>
        <Text style={typo("title1", "bold")}>어떤 일상을 시작할까요?</Text>
        <Text style={typo("body2", "regular", T.label.alternative)}>고른 목적의 홈을 먼저 보여 드려요. 아래 탭으로 언제든 바꿀 수 있어요.</Text>
      </View>
      <View style={{ gap: SP[8], marginTop: SP[32] }} accessibilityRole="radiogroup">
        {PURPOSES.map((p) => {
          const active = p.key === choice;
          const meta = SERVICES.find((x) => x.key === p.key);
          return (
            <Pressable key={p.key} onPress={() => setChoice(p.key)} accessibilityRole="radio" accessibilityState={{ selected: active }} style={({ pressed }) => [s.choice, active && s.choiceActive, pressed && !active && { backgroundColor: T.fill.alternative }]}>
              <View style={[s.choiceIcon, active && { backgroundColor: T.background.normalNormal }]}>
                <Icon name={p.icon} size={22} color={active ? T.primary.normal : T.label.neutral} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={typo("body1", "semibold", active ? T.primary.heavy : T.label.normal)}>{p.title}</Text>
                <Text style={typo("label2", "regular", T.label.alternative)}>{p.description} · {meta?.shortLabel} 탭</Text>
              </View>
              {active ? <Icon name="circle-check" size={22} color={T.primary.normal} /> : <Icon name="chevron-right" size={20} color={T.label.assistive} />}
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ gap: SP[8] }}>
        {auth.status !== "signed-in" ? <KakaoButton label="카카오로 시작" onPress={startWithKakao} /> : null}
        <Button label={choice ? `${SERVICES.find((x) => x.key === choice)?.shortLabel} 홈으로 시작` : "로그인 없이 시작하기"} variant={auth.status === "signed-in" ? "primary" : "neutral"} full onPress={() => start(choice ?? DEFAULT_SERVICE)} />
        <TextButton label="건너뛰기 · 체험단 홈으로" icon={null} onPress={() => start(DEFAULT_SERVICE)} style={{ alignSelf: "center" }} />
        <Text style={[typo("caption1", "regular", T.label.assistive), { textAlign: "center" }]}>{auth.status === "demo" ? "검토용 데모 · 로그인 키 등록 전에는 서연맘 계정으로 봅니다" : "로그인하면 응모·후기·지갑이 내 계정에 저장돼요"}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.background.normalNormal, paddingHorizontal: SHELL.gutter + SP[8] },
  choice: { flexDirection: "row", alignItems: "center", gap: SP[16], padding: SP[16], borderRadius: RAD.xl, borderWidth: 1, borderColor: T.line.normalNormal, backgroundColor: T.background.normalNormal },
  choiceActive: { borderColor: T.primary.normal, backgroundColor: T.primary.soft },
  choiceIcon: { width: SP[48], height: SP[48], borderRadius: RAD.lg, backgroundColor: T.fill.normal, alignItems: "center", justifyContent: "center" },
});
