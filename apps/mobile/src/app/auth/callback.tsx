import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import * as Linking from "expo-linking";
import { useAuth } from "@/lib/auth";
import { DEFAULT_SERVICE } from "@/lib/service";
import { SP, T, typo } from "@/theme";

/**
 * OAuth 콜백 딥링크(`jubutech://auth/callback?code=…`) — 보통은 `openAuthSessionAsync` 가 URL 을 바로 돌려주지만,
 * 브라우저가 앱을 새로 띄우는 경우(안드로이드 일부) 이 화면이 받아서 세션으로 바꾸고 홈으로 보낸다.
 */
export default function AuthCallback() {
  const router = useRouter();
  const { completeFromUrl } = useAuth();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    Linking.getInitialURL()
      .then((url) => (url ? completeFromUrl(url) : false))
      .then((ok) => {
        if (!alive) return;
        if (ok) router.replace(`/${DEFAULT_SERVICE}` as Href);
        else setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [completeFromUrl, router]);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: SP[16], backgroundColor: T.background.normalNormal }}>
      {failed ? <Text style={typo("body2", "regular", T.label.alternative)}>로그인 응답을 처리하지 못했어요. 다시 시도해 주세요.</Text> : <ActivityIndicator color={T.primary.normal} />}
      {failed ? <Text style={typo("label1", "semibold", T.primary.normal)} onPress={() => router.replace("/login" as Href)}>로그인으로 돌아가기</Text> : null}
    </View>
  );
}
