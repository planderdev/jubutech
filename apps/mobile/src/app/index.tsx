import { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect, type Href } from "expo-router";
import { loadLastService, loadOnboarded, type ServiceMode } from "@/lib/service";
import { T } from "@/theme";

/** 앱 진입 — 첫 실행이면 온보딩, 아니면 마지막으로 쓴 서비스 홈(기본 체험단). */
export default function Entry() {
  const [target, setTarget] = useState<"onboarding" | ServiceMode | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all([loadOnboarded(), loadLastService()]).then(([done, s]) => alive && setTarget(done ? s : "onboarding"));
    return () => {
      alive = false;
    };
  }, []);
  if (!target) return <View style={{ flex: 1, backgroundColor: T.background.normalAlternative }} />;
  return <Redirect href={`/${target}` as Href} />;
}
