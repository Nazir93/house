"use client";

import { cn } from "@/lib/utils";

type Props = {
  message: string | null;
  className?: string;
};

export function ProjectCompareStatusToast({ message, className }: Props) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[90] flex justify-center px-4",
        "bottom-[calc(var(--mobile-bottom-nav-offset,4.5rem)+0.75rem)] lg:bottom-8",
        className,
      )}
    >
      <p className="pointer-events-auto rounded-full bg-[#0f3d2e] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(15,61,46,0.35)]">
        {message}
      </p>
    </div>
  );
}
