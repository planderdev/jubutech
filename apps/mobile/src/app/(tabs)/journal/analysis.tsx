import { AppScreen } from "@/components/screen";
import { Placeholder } from "@/components/ui";

/** 분석 — PHP 데모 `/journal/analysis` 사양으로 구현 예정 */
export default function Screen() {
  return (
    <AppScreen segments="journal" scroll={false}>
      <Placeholder title="분석" description="매수·매도 복기와 체크리스트 통계가 들어갈 자리예요." phpPath="/journal/analysis" />
    </AppScreen>
  );
}
