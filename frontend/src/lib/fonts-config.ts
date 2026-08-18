/** Только 400/700 — без 500 (лишний woff2 на мобиле). */
export const MONTSERRAT_WEIGHTS = ["400", "700"] as const;

/** swap: задаётся в @fontsource CSS (font-display: swap). */
export const MONTSERRAT_DISPLAY = "swap" as const;

/**
 * Шрифт self-host через @fontsource — отдельный preload link не нужен
 * (и не тянем Google Fonts на этапе next build).
 */
export const MONTSERRAT_PRELOAD = false as const;

/** Источник ассетов: локальный npm-пакет, не fonts.googleapis.com. */
export const MONTSERRAT_SOURCE = "fontsource" as const;
