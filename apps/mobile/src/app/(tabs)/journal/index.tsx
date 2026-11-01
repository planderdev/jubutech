import { MoneyCards } from "@/components/money-cards";
import { AppScreen } from "@/components/screen";
import { Placeholder } from "@/components/ui";

/** 매매일지 요약 — PHP 데모 `/journal` 사양으로 구현 예정. 상단 「돈 되는 일 카드」만 먼저 */
export default function Screen() {
  return (
    <AppScreen segments="journal">
      <MoneyCards />
      <Placeholder title="매매일지 요약" description="이번 달 기록 일수·목표·주간 달력이 들어갈 자리예요." phpPath="/journal" />
    </AppScreen>
  );
}
