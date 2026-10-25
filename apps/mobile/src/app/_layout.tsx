import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { C } from "@/theme";

/** 루트: 탭 그룹 + 상세 스택. Pretendard 는 app.json 의 expo-font 플러그인으로 네이티브 번들(런타임 로딩 불필요). */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.canvas } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
