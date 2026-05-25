import type { ServiceItem } from "@/lib/get-services";

/**
 * Запасные изображения для карточек услуг (главная, fallback), если в админке нет обложки.
 * Ключ — путь `/services/{slug}` из CMS.
 */
const FALLBACK_SIDE_IMAGE_BY_SLUG: Record<string, string> = {
  "/services/proektirovanie": "/images/banner/proektirovanie-hero.png",
  "/services/projecting": "/images/banner/proektirovanie-hero.png",
  "/services/fundament": "/images/hero/hero-02.png",
  "/services/foundation": "/images/hero/hero-02.png",
  "/services/karkas": "/images/hero/hero-03.png",
  "/services/krovlya": "/images/hero/hero-04.png",
  "/services/roofing": "/images/hero/hero-04.png",
  "/services/inzheneriya": "/images/hero/hero-05.png",
  "/services/engineering": "/images/hero/hero-05.png",
  "/services/otdelka": "/images/hero/architectural-lighting.png",
  "/services/finishing": "/images/hero/architectural-lighting.png",
};

function normalizeSlugPath(slug: string): string {
  return slug.split("?")[0]?.replace(/\/$/, "") ?? slug;
}

/**
 * Картинки баннера под H1 на странице услуги — те же файлы, что у карточки на главной.
 */
export function getServiceLandingHeroBannerFields(slugPath: string): {
  bannerImageDesktop: string;
  bannerImageMobile: string;
} | null {
  const path = normalizeSlugPath(slugPath);
  const img = FALLBACK_SIDE_IMAGE_BY_SLUG[path];
  if (!img) return null;
  return { bannerImageDesktop: img, bannerImageMobile: img };
}

/**
 * Медиа для карточки услуги: сначала данные из админки (обложка / видео), иначе картинка из макета.
 */
export function resolveServiceCardMedia(s: ServiceItem): {
  coverImage: string | null;
  videoUrl: string | null;
} {
  if (s.coverImage?.trim()) {
    return { coverImage: s.coverImage.trim(), videoUrl: null };
  }
  if (s.videoUrl?.trim()) {
    return { coverImage: null, videoUrl: s.videoUrl.trim() };
  }
  const path = normalizeSlugPath(s.slug);
  const fallback = FALLBACK_SIDE_IMAGE_BY_SLUG[path];
  if (fallback) return { coverImage: fallback, videoUrl: null };
  return { coverImage: null, videoUrl: null };
}

/** Для LCP: есть ли что показать в карточке (в т.ч. fallback-картинка). */
export function serviceCardHasVisualMedia(s: ServiceItem): boolean {
  const m = resolveServiceCardMedia(s);
  return Boolean(m.coverImage || m.videoUrl);
}
