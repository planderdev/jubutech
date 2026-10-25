import { AppScreen } from "@/components/screen";
import { Placeholder } from "@/components/ui";

/** 마이 — PHP 데모 `/mypage?mode=finance` 사양으로 구현 예정 */
export default function Screen() {
  return (
    <AppScreen scroll={false}>
      <Placeholder title="마이" description="포인트·미션·배지·설정이 들어갈 자리예요." phpPath="/mypage?mode=finance" />
    </AppScreen>
  );
}
