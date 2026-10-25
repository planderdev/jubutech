import { AppScreen } from "@/components/screen";
import { Placeholder } from "@/components/ui";

/** 커뮤니티 — PHP 데모 `/community` 사양으로 구현 예정 */
export default function Screen() {
  return (
    <AppScreen scroll={false}>
      <Placeholder title="커뮤니티" description="경험과 생활 팁을 나누는 글 목록이 들어갈 자리예요." phpPath="/community" />
    </AppScreen>
  );
}
