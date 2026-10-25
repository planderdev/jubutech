import { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect, type Href } from "expo-router";
import { loadLastService, type ServiceMode } from "@/lib/service";
import { T } from "@/theme";

/** 앱 진입 — 마지막으로 쓴 서비스 홈으로 보낸다 (PHP `/` 는 `/finance` 로). */
export default function Entry() {
  const [service, setService] = useState<ServiceMode | null>(null);
  useEffect(() => {
    let alive = true;
    loadLastService().then((s) => alive && setService(s));
    return () => {
      alive = false;
    };
  }, []);
  if (!service) return <View style={{ flex: 1, backgroundColor: T.background.normalAlternative }} />;
  return <Redirect href={`/${service}` as Href} />;
}
