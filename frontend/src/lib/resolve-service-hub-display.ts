import {
  getServiceHubCopy,
  resolveServiceHubCtaAction,
  type ServiceHubCopy,
  type ServiceHubFeature,
} from "@/lib/services-hub-data";

/** Спец-вкладка: тексты с хаб-шаблона, CMS только как fallback. */
export function isCodeOwnedServiceHubSegment(segment: string): boolean {
  return segment === "proektirovanie" || segment === "projecting";
}

export type ServiceHubCmsFields = {
  title?: string | null;
  shortDescription?: string | null;
};

export type ResolvedServiceHubDisplay = {
  navTitle: string;
  cardTitle: string;
  cardDescription: string;
  sectionParagraphs: string[];
  features: ServiceHubFeature[];
  ctaLabel: string;
  ctaAction: "modal" | "link";
  centerImageSrc?: string | null;
};

function trimOrEmpty(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Тексты вкладки на `/services`.
 * Для проектирования — код (hub copy); для остальных — title/shortDescription из CMS при наличии.
 */
export function resolveServiceHubDisplay(
  segment: string,
  cms: ServiceHubCmsFields,
  hub: ServiceHubCopy | null = getServiceHubCopy(segment),
): ResolvedServiceHubDisplay {
  const cmsTitle = trimOrEmpty(cms.title);
  const cmsDescription = trimOrEmpty(cms.shortDescription);
  const codeOwned = isCodeOwnedServiceHubSegment(segment);

  const navTitle = codeOwned
    ? trimOrEmpty(hub?.navTitle) || cmsTitle || "Услуга"
    : cmsTitle || trimOrEmpty(hub?.navTitle) || "Услуга";

  const cardTitle = navTitle;

  const cardDescription = codeOwned
    ? trimOrEmpty(hub?.cardDescription) || cmsDescription
    : cmsDescription || trimOrEmpty(hub?.cardDescription);

  return {
    navTitle,
    cardTitle,
    cardDescription,
    sectionParagraphs: hub?.sectionParagraphs.slice(0, 2) ?? [],
    features: hub?.features ?? [],
    ctaLabel: hub?.ctaLabel ?? "Подробнее об услуге",
    ctaAction: resolveServiceHubCtaAction(hub),
    centerImageSrc: hub?.centerImageSrc,
  };
}
