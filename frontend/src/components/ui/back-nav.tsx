"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Единый вид «Назад»: рамка + фон темы, текст/иконка `var(--text)` — в тёмной теме светлый, в светлой тёмный */
const pillClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-2 min-h-[44px] min-w-[44px] text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text)] transition-colors duration-200 hover:bg-[var(--bg-secondary)] hover:border-[var(--text-muted)] touch-manipulation";

export function BackNavLink({
  href,
  children = "Назад",
  className = "",
}: {
  href: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${pillClass} ${className}`}>
      <ArrowLeft size={16} strokeWidth={2} className="shrink-0" aria-hidden />
      {children}
    </Link>
  );
}

export function BackNavButton({
  onClick,
  children = "Назад",
  className = "",
  type = "button",
}: {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} onClick={onClick} className={`${pillClass} ${className}`}>
      <ArrowLeft size={16} strokeWidth={2} className="shrink-0" aria-hidden />
      {children}
    </button>
  );
}
