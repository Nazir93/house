import { buildImagePrefetchSrc } from "@/lib/image-loading";

/** Типичная ширина LCP на Moto G / mid-mobile в Lighthouse. */
export const HOME_HERO_LCP_WIDTH = 828;

/** Чуть сильнее сжатие для полноэкранного фона — меньше байт на 4G. */
export const HOME_HERO_LCP_QUALITY = 70;

/** Href для `<link rel="preload" as="image">` светлого фона баннера (дефолтная тема). */
export function buildHomeHeroLcpPreloadHref(lightBackgroundSrc: string): string {
  return buildImagePrefetchSrc(lightBackgroundSrc, HOME_HERO_LCP_WIDTH, HOME_HERO_LCP_QUALITY);
}
