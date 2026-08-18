import { buildImagePrefetchSrc } from "@/lib/image-loading";

/** Ширина LCP под Moto G / mid-mobile — ближе к реальному CSS-пиксельному вьюпорту. */
export const HOME_HERO_LCP_WIDTH = 750;

/** Сильнее сжатие полноэкранного фона (PSI: q=70 ещё ~24 KiB spare). */
export const HOME_HERO_LCP_QUALITY = 60;

/** Href для `<link rel="preload" as="image">` светлого фона баннера (дефолтная тема). */
export function buildHomeHeroLcpPreloadHref(lightBackgroundSrc: string): string {
  return buildImagePrefetchSrc(lightBackgroundSrc, HOME_HERO_LCP_WIDTH, HOME_HERO_LCP_QUALITY);
}

/**
 * Промо-карусель не competing LCP: high только у фона баннера.
 * Активный слайд eager, остальные lazy — без preload в `<head>`.
 */
export function homeHeroCarouselImageLoading(isActive: boolean): {
  priority: false;
  fetchPriority: "low";
  loading: "eager" | "lazy";
} {
  return {
    priority: false,
    fetchPriority: "low",
    loading: isActive ? "eager" : "lazy",
  };
}
