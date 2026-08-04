/** Версия ассета — менять при замене файла (cache bust). */
export const BRAND_LOGO_ASSET_V = "6";

/** Пропорции исходного logo.png (ширина / высота). */
export const BRAND_LOGO_AR = 1024 / 442;

export const BRAND_LOGO_SRC = `/images/brand/logo.png?v=${BRAND_LOGO_ASSET_V}`;
