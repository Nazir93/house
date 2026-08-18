/** Только 400/700 — без 500 (лишний woff2 на мобиле). */
export const MONTSERRAT_WEIGHTS = ["400", "700"] as const;

/** swap: Montserrat применяется сразу после загрузки, без «залипания» на системном. */
export const MONTSERRAT_DISPLAY = "swap" as const;

/**
 * false: не preload woff2 (~68 KiB). LCP главной — H1-текст; preload ставит шрифт
 * на критический путь и задерживает отрисовку заголовка на медленном 4G.
 */
export const MONTSERRAT_PRELOAD = false as const;
