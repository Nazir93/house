import { prisma } from "@/lib/db";
import type { ServiceType } from "@prisma/client";
import { SERVICES, SITE_NAME } from "@/lib/constants";
import { CMS_SERVICE_SLUG_TO_SERVICE_TYPE } from "@/lib/service-slug-routes";
import { SERVICE_TYPE_LABEL_BY_VALUE } from "@/lib/service-type-admin-options";
import { resolveServiceLandingDocument, stripShowcaseSections } from "@/lib/service-landing-defaults";
import type { ServiceLandingDocument } from "@/lib/service-landing-schema";
import { enrichProektirovanieLandingDocument } from "@/lib/service-proektirovanie-landing";
import { getServiceLandingHeroBannerFields } from "@/lib/service-card-media";
import { mergeHeroBannersFromDb } from "@/lib/service-landing-banners";
import { getServiceSeoBySlug } from "@/lib/seo/service-seo-defaults";
import { buildMetaDescription } from "@/lib/seo/build-meta-description";

/** Если в hero нет баннера (старый JSON из админки) — те же картинки, что на главной в карточке услуги. */
function fillMissingHeroBannersFromSiteAssets(slug: string, document: ServiceLandingDocument): ServiceLandingDocument {
  const fallback = getServiceLandingHeroBannerFields(`/services/${slug}`);
  if (!fallback) return document;
  return {
    sections: document.sections.map((section) => {
      if (section.type !== "hero" && section.type !== "heroCinematic") return section;
      const has =
        Boolean(section.bannerImageDesktop?.trim()) || Boolean(section.bannerImageMobile?.trim());
      if (has) return section;
      return { ...section, ...fallback };
    }),
  };
}

export type ServiceLandingPageData = {
  serviceType: ServiceType;
  published: boolean;
  document: ServiceLandingDocument;
};

type ServiceRowPick = {
  published: boolean;
  landingJson: unknown;
  bannerImageDesktop: string | null;
  bannerImageMobile: string | null;
  serviceType: ServiceType;
};

/** Шаблон лендинга, если в БД нет строки или PostgreSQL недоступен (как fallback в getServicesList). */
export function cmsServiceSlugFallbackRow(slug: string): ServiceRowPick | null {
  const fallbackType = CMS_SERVICE_SLUG_TO_SERVICE_TYPE[slug];
  if (!fallbackType) return null;
  return {
    published: true,
    landingJson: null,
    bannerImageDesktop: null,
    bannerImageMobile: null,
    serviceType: fallbackType,
  };
}

async function loadServiceRowForSlug(slug: string): Promise<ServiceRowPick | null> {
  try {
    const bySlug = await prisma.service.findUnique({
      where: { slug },
      select: {
        published: true,
        landingJson: true,
        bannerImageDesktop: true,
        bannerImageMobile: true,
        serviceType: true,
      },
    });
    if (bySlug) return bySlug;
  } catch {
    // БД недоступна — шаблон ниже
  }

  return cmsServiceSlugFallbackRow(slug);
}

/**
 * Значения по умолчанию для {@link getPageMeta}: из строки услуги в БД или из шаблона кода.
 * Перекрываются записями в «SEO» (PageMeta) по пути `/services/{slug}`.
 */
export async function getServiceMetadataDefaults(slug: string): Promise<{
  title: string;
  description: string;
  keywords?: string[];
} | null> {
  const semanticSeo = getServiceSeoBySlug(slug);
  if (semanticSeo) {
    return {
      title: semanticSeo.title,
      description: semanticSeo.description,
      keywords: semanticSeo.keywords,
    };
  }

  try {
    const s = await prisma.service.findUnique({
      where: { slug },
      select: { title: true, shortDescription: true },
    });
    if (s) {
      return {
        title: `${s.title} | ${SITE_NAME}`,
        description: buildMetaDescription({
          primary: s.shortDescription,
          title: s.title,
          kind: "service",
        }),
        keywords: [s.title, SITE_NAME],
      };
    }
  } catch {
    // БД недоступна
  }

  const fromConstants = SERVICES.find((x) => x.slug === `/services/${slug}`);
  if (fromConstants) {
    return {
      title: `${fromConstants.title} | ${SITE_NAME}`,
      description: buildMetaDescription({
        primary: fromConstants.shortDescription,
        title: fromConstants.title,
        kind: "service",
      }),
      keywords: [fromConstants.title, SITE_NAME],
    };
  }

  const st = CMS_SERVICE_SLUG_TO_SERVICE_TYPE[slug];
  if (st) {
    const title = SERVICE_TYPE_LABEL_BY_VALUE[st] ?? slug;
    return {
      title: `${title} | ${SITE_NAME}`,
      description: buildMetaDescription({
        title,
        kind: "service",
        fallback: `Услуги загородного строительства: ${title.toLowerCase()}. ${SITE_NAME}.`,
      }),
      keywords: [title, SITE_NAME],
    };
  }

  return null;
}

export async function getServiceLandingPageData(slug: string): Promise<ServiceLandingPageData | null> {
  const row = await loadServiceRowForSlug(slug);
  if (!row) return null;

  let document = resolveServiceLandingDocument(row.landingJson, row.serviceType);
  document = mergeHeroBannersFromDb(document, row.bannerImageDesktop, row.bannerImageMobile);
  document = fillMissingHeroBannersFromSiteAssets(slug, document);
  document = stripShowcaseSections(document);
  document = enrichProektirovanieLandingDocument(slug, document);
  return { serviceType: row.serviceType, published: row.published, document };
}
