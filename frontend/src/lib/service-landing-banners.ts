import type { ServiceLandingDocument } from "@/lib/service-landing-schema";

/**
 * Баннеры из полей услуги в админке перекрывают картинки из шаблона/landingJson.
 * Если задан только один URL — подставляем его и на desktop, и на mobile.
 */
export function mergeHeroBannersFromDb(
  document: ServiceLandingDocument,
  bannerImageDesktop: string | null | undefined,
  bannerImageMobile: string | null | undefined
): ServiceLandingDocument {
  const d = bannerImageDesktop?.trim() || undefined;
  const m = bannerImageMobile?.trim() || undefined;
  if (!d && !m) return document;
  const desktop = d ?? m;
  const mobile = m ?? d;
  return {
    sections: document.sections.map((section) => {
      if (section.type !== "hero" && section.type !== "heroCinematic") return section;
      return {
        ...section,
        bannerImageDesktop: desktop,
        bannerImageMobile: mobile,
      };
    }),
  };
}
