import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DemoProvider } from "@/lib/demo-store";
import { T } from "@/theme";

/**
 * 루트 스택. `/finance`·`/journal`·`/campaigns` 가 각각 서비스별 하단 탭 그룹이고,
 * 상세 화면(`/campaign/[id]`, `/campaign/[id]/apply`, `/application/[id]`)은 이 스택 위에 쌓인다(탭바 없음, PHP 상세 페이지와 같음).
 * Pretendard 는 app.json 의 expo-font 플러그인으로 네이티브 번들.
 */
export default function RootLayout() {
  return (
    <DemoProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.background.normalAlternative } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="finance" />
        <Stack.Screen name="journal" />
        <Stack.Screen name="campaigns" />
        <Stack.Screen name="campaign/[id]/index" />
        <Stack.Screen name="campaign/[id]/apply" />
        <Stack.Screen name="application/[id]/index" />
        <Stack.Screen name="application/[id]/review" />
      </Stack>
    </DemoProvider>
  );
}
