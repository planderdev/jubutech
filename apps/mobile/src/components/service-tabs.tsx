import { Tabs } from "expo-router";
import { FloatingTabBar } from "@/components/floating-tab-bar";
import { serviceMeta, type ServiceMode } from "@/lib/service";
import { T } from "@/theme";

/**
 * 서비스별 하단 탭 레이아웃 — `app/<service>/_layout.tsx` 가 이 컴포넌트를 서비스 키만 바꿔 쓴다.
 * 탭 구성은 `SERVICES[].tabs`(PHP `$navs`)에서 온다.
 */
export function ServiceTabs({ service }: { service: ServiceMode }) {
  const meta = serviceMeta(service);
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: T.background.normalAlternative }, lazy: true }}
      tabBar={(props) => <FloatingTabBar {...props} tabs={meta.tabs} />}
    >
      {meta.tabs.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}
