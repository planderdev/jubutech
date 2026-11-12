import { Tabs } from "expo-router";
import { FloatingTabBar } from "@/components/floating-tab-bar";
import { ROOT_TABS } from "@/lib/service";
import { T } from "@/theme";

/** 하단 5탭(B안): 체험단 · 지원금 · 주식 · 커뮤니티 · 마이. 서비스 탭 안은 각각 Stack(홈·하위 화면) */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: T.background.normalAlternative }, lazy: true }} tabBar={(props) => <FloatingTabBar {...props} tabs={ROOT_TABS} />}>
      {ROOT_TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}
