import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { C, F } from "@/theme";

const TABS = [
  { name: "index", title: "홈", icon: "home" },
  { name: "info", title: "돈되는정보", icon: "file-text" },
  { name: "community", title: "커뮤니티", icon: "users" },
  { name: "campaigns", title: "체험단", icon: "volume-2" },
  { name: "my", title: "MY", icon: "user" },
] as const;

/** 하단 5탭 — 피그마 Tab Bar 컴포넌트와 동일 구성 */
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: C.primary, tabBarInactiveTintColor: C.ink3, tabBarStyle: { backgroundColor: C.paper, borderTopColor: C.edge, height: 84, paddingTop: 8 }, tabBarLabelStyle: { fontFamily: F.semibold, fontSize: 11 }, sceneStyle: { backgroundColor: C.canvas } }}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarIcon: ({ color, size }) => <Feather name={t.icon} size={size - 2} color={color} /> }} />
      ))}
    </Tabs>
  );
}
