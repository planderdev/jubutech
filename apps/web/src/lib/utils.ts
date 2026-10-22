// 웹 전용(clsx/tailwind-merge) + 공용 유틸 재수출
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export * from "@jubutech/shared/utils";
