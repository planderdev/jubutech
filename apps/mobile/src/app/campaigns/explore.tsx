import { AppScreen } from "@/components/screen";
import { Placeholder } from "@/components/ui";

/** 탐색 — PHP 데모 `/campaigns/explore` 사양으로 구현 예정 */
export default function Screen() {
  return (
    <AppScreen scroll={false}>
      <Placeholder title="탐색" description="카테고리·채널 필터와 체험 목록이 들어갈 자리예요." phpPath="/campaigns/explore" />
    </AppScreen>
  );
}
