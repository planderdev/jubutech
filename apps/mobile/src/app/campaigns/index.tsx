import { AppScreen } from "@/components/screen";
import { Placeholder } from "@/components/ui";

/** 체험단 홈 — PHP 데모 `/campaigns` 사양으로 구현 예정 */
export default function Screen() {
  return (
    <AppScreen scroll={false}>
      <Placeholder title="체험단 홈" description="모집 중인 체험 카드와 배너가 들어갈 자리예요." phpPath="/campaigns" />
    </AppScreen>
  );
}
