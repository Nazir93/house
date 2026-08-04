/** Только 400/700 — без 500 (лишний woff2 на мобиле). */
export const MONTSERRAT_WEIGHTS = ["400", "700"] as const;

/** swap: Montserrat применяется сразу после загрузки, без «залипания» на системном. */
export const MONTSERRAT_DISPLAY = "swap" as const;

/** true: preload woff2, чтобы бренд-шрифт успевал на первом экране. */
export const MONTSERRAT_PRELOAD = true as const;
