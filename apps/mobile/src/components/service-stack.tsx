import { Stack } from "expo-router";
import { serviceMeta, type ServiceMode } from "@/lib/service";
import { T } from "@/theme";

/** 서비스 탭 안의 Stack — 홈과 하위 화면(세그먼트). 전환은 `ServiceSegments` 가 replace 로 한다 */
export function ServiceStack({ service }: { service: ServiceMode }) {
  const meta = serviceMeta(service);
  return (
    <Stack screenOptions={{ headerShown: false, animation: "none", contentStyle: { backgroundColor: T.background.normalAlternative } }}>
      {meta.tabs.map((t) => (
        <Stack.Screen key={t.name} name={t.name} />
      ))}
    </Stack>
  );
}
