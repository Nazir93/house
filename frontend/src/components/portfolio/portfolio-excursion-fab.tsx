"use client";

import Link from "next/link";

/** Круглая плавающая кнопка в духе domgazobeton.com — ведёт на контакты. */
export function PortfolioExcursionFab() {
  return (
    <Link
      href="/contacts"
      className="fixed bottom-4 right-4 z-[60] flex h-[6.75rem] w-[6.75rem] items-center justify-center rounded-full border-2 border-white/15 bg-[#0c0c0c] px-3 text-center text-[10px] font-bold uppercase leading-snug tracking-[0.06em] text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition duration-300 hover:scale-[1.04] hover:border-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:bottom-6 sm:right-6 sm:h-[7.5rem] sm:w-[7.5rem] sm:text-[11px] md:h-32 md:w-32 md:text-xs"
      title="Записаться на экскурсию по строительным площадкам"
    >
      <span className="block max-w-[12ch]">Записаться на экскурсию на объекты</span>
    </Link>
  );
}
