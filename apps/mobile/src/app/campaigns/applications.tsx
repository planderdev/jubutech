import { AppScreen } from "@/components/screen";
import { Placeholder } from "@/components/ui";

/** 내 응모 — PHP 데모 `/applications` 사양으로 구현 예정 */
export default function Screen() {
  return (
    <AppScreen scroll={false}>
      <Placeholder title="내 응모" description="응모 현황(응모·선정·미선정)과 후기 제출이 들어갈 자리예요." phpPath="/applications" />
    </AppScreen>
  );
}
