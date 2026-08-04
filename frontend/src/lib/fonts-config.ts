/** Только 400/700 — без 500: на 4G один лишний woff2 тянул критический путь LCP (~68 KiB). */
export const MONTSERRAT_WEIGHTS = ["400", "700"] as const;

/**
 * optional: текст LCP рисуется сразу fallback'ом, без ожидания webfont.
 * На медленном 4G Montserrat может не успеть — зато FCP/LCP не висят на шрифте.
 */
export const MONTSERRAT_DISPLAY = "optional" as const;
