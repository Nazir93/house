"use client";

import { YANDEX_MAPS_RATING_SCORE, YANDEX_REVIEWS_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Уже́ сжатый вид для мобильной шапки */
  compact?: boolean;
};

/**
 * Ссылка на отзывы Яндекс.Карт: марка «Я» и числовой рейтинг.
 */
export function YandexMapsRatingChip({ className, compact }: Props) {
  const href = YANDEX_REVIEWS_URL.trim();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border transition hover:bg-black/[0.04] dark:hover:bg-white/10",
        compact ? "h-8 px-2" : "h-7 px-2",
        className
      )}
      style={{
        borderColor: "var(--header-bar-border)",
        color: "var(--header-bar-text)",
      }}
      aria-label={`Рейтинг ${YANDEX_MAPS_RATING_SCORE} на Яндекс Картах — открыть отзывы`}
      title="Отзывы на Яндекс Картах"
    >
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-[#FC3F1D] text-[10px] font-black leading-none text-white">
        Я
      </span>
      <span className="text-[11px] font-bold tabular-nums leading-none">{YANDEX_MAPS_RATING_SCORE}</span>
    </a>
  );
}
