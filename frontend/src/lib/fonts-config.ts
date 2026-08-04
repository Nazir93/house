/** Только 400/700 — без 500: на 4G один лишний woff2 тянул критический путь LCP. */
export const MONTSERRAT_WEIGHTS = ["400", "700"] as const;

/**
 * optional: текст рисуется fallback'ом, без блокировки на webfont.
 * На медленном 4G Montserrat может не успеть — зато FCP/LCP не висят на шрифте.
 */
export const MONTSERRAT_DISPLAY = "optional" as const;

/**
 * false: не <link rel=preload> на woff2 в critical path (PSI: ~68 KiB / ~1 с).
 * Шрифт подгружается после CSS, не конкурирует с LCP-изображением.
 */
export const MONTSERRAT_PRELOAD = false as const;
