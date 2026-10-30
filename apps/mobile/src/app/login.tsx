import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icon";
import { KakaoButton } from "@/components/kakao-button";
import { Button, IconButton, TextButton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { DEFAULT_SERVICE } from "@/lib/service";
import { P, RAD, SHELL, SP, T, typo } from "@/theme";

/**
 * 로그인 — 웹 `/login` 과 같은 구성: 로고 → 한 줄 소개 → 카카오 버튼 → (키 없으면) 데모로 둘러보기.
 * `next` 로 돌아갈 경로를 받는다. 네이버는 2단계(웹에만 있음).
 */
export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const target = (next && next.startsWith("/") ? next : `/${DEFAULT_SERVICE}`) as Href;
  const done = () => (router.canGoBack() ? router.back() : router.replace(target));

  const kakao = async () => {
    setError("");
    setBusy(true);
    const r = await auth.signInWithKakao();
    setBusy(false);
    if (r.ok) {
      router.replace(target);
      return;
    }
    if (r.reason === "cancelled") return;
    setError(r.reason === "disabled" ? "소셜 로그인 키가 아직 등록되지 않았어요. 아래 데모로 둘러볼 수 있어요." : r.message || "로그인에 실패했어요. 잠시 후 다시 시도해 주세요.");
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + SP[16] }]}>
      <View style={s.bar}><IconButton name="x" label="닫기" onPress={done} /></View>
      <View style={s.body}>
        <View style={s.logo}><Icon name="sprout" size={28} color={T.primary.normal} /></View>
        <Text style={typo("title1", "bold")}>주부테크</Text>
        <Text style={typo("label1", "semibold", T.primary.normal)}>주부의 일상이 돈이 되는 곳</Text>
        <Text style={[typo("body2", "regular", T.label.alternative), { textAlign: "center", marginTop: SP[8] }]}>가입하면 관심사에 맞는 지원금·체험단을 추천해 드려요.{"\n"}첫 가입 시 1,000P 지급.</Text>
        <View style={{ alignSelf: "stretch", gap: SP[8], marginTop: SP[32] }}>
          <KakaoButton onPress={kakao} busy={busy} disabled={auth.status === "loading"} />
          {auth.status === "signed-in" ? <Text style={[typo("label2", "regular", T.label.alternative), { textAlign: "center" }]}>이미 {auth.user?.nickname}님으로 로그인돼 있어요.</Text> : null}
          {error ? <Text style={[typo("label2", "regular", P.red[600]), { textAlign: "center" }]} accessibilityLiveRegion="polite">{error}</Text> : null}
        </View>
        <Text style={[typo("caption1", "regular", T.label.assistive), { textAlign: "center", marginTop: SP[16] }]}>가입 시 이용약관·개인정보처리방침에 동의하게 됩니다. 자녀 정보는 수집하지 않아요.</Text>
      </View>
      {auth.status === "demo" || auth.status === "guest" ? (
        <View style={s.demo}>
          <Text style={typo("label1", "semibold", T.label.neutral)}>데모 계정으로 둘러보기 <Text style={typo("label2", "regular", T.label.alternative)}>(소셜 로그인 키 등록 전)</Text></Text>
          <Button label="서연맘 · Lv.3 으로 둘러보기" variant="neutral" size="lg" full onPress={done} />
          <TextButton label="나중에 할게요" icon={null} onPress={done} style={{ alignSelf: "center" }} />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.background.normalNormal, paddingHorizontal: SHELL.gutter + SP[8] },
  bar: { height: SHELL.headerHeight, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginRight: -SP[8] },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: SP[8] },
  logo: { width: SP[64], height: SP[64], borderRadius: RAD.xl, backgroundColor: T.primary.soft, alignItems: "center", justifyContent: "center", marginBottom: SP[8] },
  demo: { gap: SP[8], padding: SP[16], borderRadius: RAD.xl, backgroundColor: T.background.normalAlternative },
});
