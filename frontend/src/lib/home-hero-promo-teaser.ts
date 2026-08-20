import type { HomeHeroPromoSlide } from "@/lib/home-hero-banner-schema";

/** Подпись как в карусели на главной: «01 · Топас 4 в подарок». */
export function formatHomeHeroPromoSlideEyebrow(index: number, label: string): string {
  const n = String(Math.max(1, index + 1)).padStart(2, "0");
  const clean = label.replace(/\s+/g, " ").trim();
  return clean ? `${n} · ${clean}` : n;
}

export function resolveHomeHeroPromoCaption(slide: Pick<HomeHeroPromoSlide, "label" | "caption">): string {
  const caption = slide.caption.replace(/\s+/g, " ").trim();
  if (caption) return caption;
  const label = slide.label.replace(/\s+/g, " ").trim().toLowerCase();
  return label ? `Фрагмент серии — ${label}.` : "";
}

/** Промо из баннера главной для вставки в мобильные фильтры каталога. */
export function homeHeroPromosForCatalogFilters(
  promos: HomeHeroPromoSlide[] | null | undefined,
): HomeHeroPromoSlide[] {
  if (!promos?.length) return [];
  return promos.filter(
    (p) =>
      p.image.trim() &&
      p.href.trim() &&
      (p.title.trim() || p.label.trim()),
  );
}
