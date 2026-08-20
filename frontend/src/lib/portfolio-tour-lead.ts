/** Источник заявки: запись на экскурсию со страницы объекта портфолио. */
export const PORTFOLIO_TOUR_LEAD_SOURCE = "portfolio-tour";

export type PortfolioTourObjectInput = {
  title: string;
  slug: string;
  siteStatus?: string | null;
};

export type PortfolioTourEstimatePayload = {
  source: typeof PORTFOLIO_TOUR_LEAD_SOURCE;
  service: string;
  calcData: Record<string, unknown>;
};

export function isPortfolioTourLeadSource(source: string | null | undefined): boolean {
  return source === PORTFOLIO_TOUR_LEAD_SOURCE;
}

/** Подпись услуги в заявке — сразу видно в админке рядом с именем и телефоном. */
export function buildPortfolioTourServiceLabel(title: string): string {
  const clean = title.replace(/\s+/g, " ").trim();
  return clean ? `Экскурсия: ${clean}` : "Экскурсия на объект";
}

export function buildPortfolioTourCalcData(object: PortfolioTourObjectInput): Record<string, unknown> {
  return {
    formType: "portfolio-tour",
    intent: "tour",
    projectTitle: object.title.trim(),
    objectTitle: object.title.trim(),
    objectSlug: object.slug.trim(),
    objectSiteStatus: object.siteStatus?.trim() || null,
    objectPath: `/portfolio/${object.slug.trim()}`,
  };
}

/** Payload для модалки контактов (имя + телефон). */
export function buildPortfolioTourEstimatePayload(
  object: PortfolioTourObjectInput,
): PortfolioTourEstimatePayload {
  return {
    source: PORTFOLIO_TOUR_LEAD_SOURCE,
    service: buildPortfolioTourServiceLabel(object.title),
    calcData: buildPortfolioTourCalcData(object),
  };
}

export type PortfolioTourModalCopy = {
  eyebrow: string;
  title: string;
  description: string;
  badge: string | null;
  submitLabel: string;
};

export function resolvePortfolioTourModalCopy(objectTitle: string): PortfolioTourModalCopy {
  const title = objectTitle.replace(/\s+/g, " ").trim();
  return {
    eyebrow: "Экскурсия на объект",
    title: "Запись на экскурсию",
    description: title
      ? `Оставьте имя и телефон — перезвоним и согласуем визит на объект «${title}».`
      : "Оставьте имя и телефон — перезвоним и согласуем удобное время экскурсии.",
    badge: title ? `Объект: ${title}` : null,
    submitLabel: "Записаться на экскурсию",
  };
}
