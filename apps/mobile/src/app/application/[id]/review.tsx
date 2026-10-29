import { useLocalSearchParams, useRouter } from "expo-router";
import { AppScreen } from "@/components/screen";
import { Placeholder } from "@/components/ui";

/** 후기 제출 — W3(1-1 후기 제출·자동 검수)에서 구현. PHP `reviewForm()` (`/applications/{id}/review`) */
export default function ReviewForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <AppScreen title="후기 제출" onBack={() => router.back()} tabBar={false} scroll={false} grouped={false}>
      <Placeholder title="후기 제출" description="미션 체크리스트 · 링크/직접 작성 · 자동 검사는 다음 작업(W3)에서 들어와요." phpPath={`/applications/${id}/review`} />
    </AppScreen>
  );
}
