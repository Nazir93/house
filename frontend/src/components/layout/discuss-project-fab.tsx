"use client";

import { MessageCircle } from "lucide-react";

import { useModal } from "@/lib/modal-context";
import { cn } from "@/lib/utils";

const FAB_RIGHT =
  "right-[max(1rem,env(safe-area-inset-right))] lg:right-[max(1.5rem,env(safe-area-inset-right))]";
const FAB_BOTTOM =
  "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:bottom-10";

/**
 * Плавающая кнопка «Обсудить проект».
 *
 * Раньше на главной позиция считалась от нижнего края баннера — при выходе баннера из зоны
 * видимости кнопка резко перескакивала вниз экрана и визуально «перепрыгивала» следующую секцию
 * («Материалы и старт цены»). На всех страницах один режим: закрепление снизу справа.
 */
export function DiscussProjectFab() {
  const { openModal, isOpen } = useModal();

  /** Не показываем поверх модалки (у FAB z выше диалога — иначе «второй» слой кнопки на форме). */
  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => openModal()}
      className={cn(
        "fixed z-[115] touch-manipulation rounded-full shadow-lg transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "flex h-16 w-16 min-h-16 min-w-16 flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 text-[var(--accent-contrast)] sm:gap-1 sm:px-2 sm:py-2",
        FAB_RIGHT,
        FAB_BOTTOM
      )}
      style={{
        backgroundColor: "var(--accent)",
        color: "var(--accent-contrast)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.12)",
      }}
      aria-label="Обсудить проект — ориентировочный расчёт стоимости"
    >
      <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="mt-0.5 max-w-[3.5rem] text-center text-[6.5px] font-bold uppercase leading-[1.05] tracking-wide sm:mt-1 sm:max-w-[3.75rem] sm:text-[7.5px]">
        <span className="block">Обсудить</span>
        <span className="block">проект</span>
      </span>
    </button>
  );
}
