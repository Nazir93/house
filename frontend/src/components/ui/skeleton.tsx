import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  /** Скругление: по умолчанию rounded-xl */
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
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

/** Пульсирующий блок-заглушка в стиле сайта. */
export function Skeleton({ className, rounded = "xl" }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer", roundedClass[rounded], className)}
      aria-hidden
    />
  );
}
