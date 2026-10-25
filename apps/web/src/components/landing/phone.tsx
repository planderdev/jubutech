import Image from "next/image";
import { cn } from "@/lib/utils";

/** 앱 스크린샷용 폰 프레임 (390×844 비율) */
export function Phone({ src, alt, className, priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={cn("relative w-[260px] aspect-[390/844] rounded-[40px] bg-stage p-[10px] shadow-float", className)}>
      <div className="absolute left-1/2 top-[10px] -translate-x-1/2 h-[26px] w-[90px] rounded-full bg-stage z-10" aria-hidden />
      <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-canvas">
        <Image src={src} alt={alt} fill sizes="260px" priority={priority} className="object-cover object-top" />
      </div>
    </div>
  );
}
