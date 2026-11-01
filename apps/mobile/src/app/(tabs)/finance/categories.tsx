import { AppScreen } from "@/components/screen";
import { Placeholder } from "@/components/ui";

/** 돈되는 정보 — PHP 데모 `/finance/categories` 사양으로 구현 예정 */
export default function Screen() {
  return (
    <AppScreen segments="finance" scroll={false}>
      <Placeholder title="돈되는 정보" description="카테고리 칩·검색·정렬과 정보 목록이 들어갈 자리예요." phpPath="/finance/categories" />
    </AppScreen>
  );
}
