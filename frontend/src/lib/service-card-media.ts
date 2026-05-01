import type { ServiceItem } from "@/lib/get-services";

/**
 * Запасные изображения для карточек услуг (главная hero, fallback), если в админке не загружено фото/видео.
 * Ключ — полный путь slug из {@link ServiceItem.slug}.
 */
const FALLBACK_SIDE_IMAGE_BY_SLUG: Record<string, string> = {
  "/services/acoustics": "/images/hero/hero-01.png",
  "/services/smart-home": "/images/hero/hero-02.png",
  "/services/electrical": "/images/hero/hero-03.png",
  "/services/structured-cabling": "/images/hero/hero-04.png",
  "/services/security": "/images/hero/hero-05.png",
  "/services/architectural-lighting": "/images/hero/architectural-lighting.png",
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
