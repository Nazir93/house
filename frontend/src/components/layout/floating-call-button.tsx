"use client";

import { usePathname } from "next/navigation";
import { useContactConfig } from "@/lib/contact-config-context";

/**
 * Иконка кнопки: файл из `frontend/public/images/` — отдаётся с корня сайта как `/images/...`.
 * PNG по умолчанию; чтобы использовать SVG, положите файл рядом и поменяйте имя ниже.
 */
const FLOATING_CALL_ICON_SRC = "/images/floating-call-smartphone.png";

/**
 * Быстрый звонок: тот же номер, что в шапке (phone2Raw / phone2).
 * Скрыта на главной. z-[115] — поверх ContactModal (z-[100]–110), ниже кастомного курсора.
 */
export function FloatingCallButton() {
  const pathname = usePathname();
  const contact = useContactConfig();

  if (pathname === "/") return null;

  const raw = contact.phone2Raw?.trim();
  if (!raw) return null;

  const positionClasses =
    "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] lg:bottom-10 lg:right-[max(1.5rem,env(safe-area-inset-right))]";

  return (
    <a
      href={`tel:${raw}`}
      className={
        "fixed z-[115] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 touch-manipulation " +
        positionClasses
      }
      style={{
        backgroundColor: "var(--accent)",
        color: "var(--accent-contrast)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.12)",
      }}
      aria-label={`Позвонить: ${contact.phone2}`}
    >
      {/* Обычный img — без оптимизатора next/image, стабильно для локальных png/svg из public */}
      <img
        src={FLOATING_CALL_ICON_SRC}
        alt=""
        width={42}
        height={42}
        className="h-[42px] w-[42px] object-contain select-none pointer-events-none"
        decoding="async"
        draggable={false}
        aria-hidden
      />
    </a>
  );
}
