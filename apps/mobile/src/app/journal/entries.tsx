import { AppScreen } from "@/components/screen";
import { Placeholder } from "@/components/ui";

/** 일지 — PHP 데모 `/journal/entries` 사양으로 구현 예정 */
export default function Screen() {
  return (
    <AppScreen scroll={false}>
      <Placeholder title="일지" description="매매 기록 목록과 작성 버튼이 들어갈 자리예요." phpPath="/journal/entries" />
    </AppScreen>
  );
}
