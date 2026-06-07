import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  /** Скругление: по умолчанию rounded-xl */
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
  /** Задержка блика, мс — для каскадного эффекта в сетках */
  delay?: number;
};

const roundedClass: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

/** Анимированный блок-заглушка в стиле сайта. */
export function Skeleton({ className, rounded = "xl", delay = 0 }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer", roundedClass[rounded], className)}
      style={{ "--skeleton-delay": `${delay}ms` } as CSSProperties}
      aria-hidden
    />
  );
}
