import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <p className="display-en text-red text-[80px] leading-none">404</p>
      <p className="display text-[20px] mt-4">페이지를 찾을 수 없어요</p>
      <Link href="/" className="inline-block mt-6"><Button variant="secondary">홈으로</Button></Link>
    </div>
  );
}
