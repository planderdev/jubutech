import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/lib/auth";
import { DemoProvider } from "@/lib/demo-store";
import { T } from "@/theme";

/**
 * 루트 스택. `(tabs)` 가 하단 5탭(B안: 체험단·지원금·주식·커뮤니티·마이)이고 그 안에서 `/campaigns`·`/finance`·`/journal` 이 서비스 Stack 이다.
 * 상세 화면(`/campaign/[id]`, `/campaign/[id]/apply`, `/application/[id]`, `/wallet`)은 이 스택 위에 쌓인다(탭바 없음, PHP 상세 페이지와 같음).
 * Pretendard 는 app.json 의 expo-font 플러그인으로 네이티브 번들.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
    <DemoProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.background.normalAlternative } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" options={{ presentation: "modal" }} />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="campaign/[id]/index" />
        <Stack.Screen name="campaign/[id]/apply" />
        <Stack.Screen name="application/[id]/index" />
        <Stack.Screen name="application/[id]/review" />
        <Stack.Screen name="wallet" />
      </Stack>
    </DemoProvider>
    </AuthProvider>
  );
}
