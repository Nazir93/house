import { CITY, SITE_NAME, getDefaultSiteGeoDescription } from "@/lib/constants";
import { htmlToPlainText } from "@/lib/html-to-plain-text";

/** Рекомендуемая длина сниппета в выдаче. */
export const META_DESCRIPTION_MAX_LENGTH = 180;

/** Короче — считаем текст недостаточным и берём следующий кандидат / шаблон. */
export const META_DESCRIPTION_MIN_USEFUL_LENGTH = 40;

export type MetaDescriptionKind = "portfolio" | "blog" | "project" | "service" | "page";

/** Первый непустой (после trim) текст. */
export function pickNonEmptyMetaText(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const text = (value ?? "").replace(/\s+/g, " ").trim();
    if (text) return text;
  }
  return "";
}

/** Обрезает meta description до max с многоточием, по возможности по границе слова. */
export function clampMetaDescription(
  text: string,
  maxLength = META_DESCRIPTION_MAX_LENGTH,
): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;

  const limit = Math.max(1, maxLength - 1);
  const sliced = normalized.slice(0, limit).trimEnd();
  const lastSpace = sliced.lastIndexOf(" ");
  const base = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace).trimEnd() : sliced;
  return `${base}…`;
}

function titleFallback(kind: MetaDescriptionKind, title: string): string {
  const name = title.trim();
  switch (kind) {
    case "portfolio":
      return `${name} — объект ${SITE_NAME}. Строительство загородных домов в ${CITY}: фото, этапы и характеристики.`;
    case "blog":
      return `${name} — материал ${SITE_NAME} о проектировании и строительстве загородных домов в ${CITY}.`;
    case "project":
      return `${name} — проект дома от ${SITE_NAME}. Планировки и комплектация для строительства в ${CITY}.`;
    case "service":
      return `${name} — услуга ${SITE_NAME} в ${CITY}. Консультация и расчёт по вашему участку.`;
    default:
      return `${name} | ${SITE_NAME}. ${getDefaultSiteGeoDescription()}`;
  }
}

/** Слияние description из PageMeta и кода страницы: пустые значения не затирают сниппет. */
export function resolvePageMetaDescription(
  dbDescription: string | null | undefined,
  defaultDescription: string,
): string {
  return (
    pickNonEmptyMetaText(dbDescription, defaultDescription) || getDefaultSiteGeoDescription()
  );
}

/**
 * Собирает meta description: явный текст / HTML → fallback → шаблон по title → geo default.
 * Не возвращает пустую строку.
 */
export function buildMetaDescription(options: {
  primary?: string | null;
  html?: string | null;
  title?: string | null;
  kind?: MetaDescriptionKind;
  fallback?: string | null;
}): string {
  const kind = options.kind ?? "page";
  const candidates = [
    options.primary,
    options.html != null ? htmlToPlainText(options.html) : "",
    options.fallback,
  ];

  for (const candidate of candidates) {
    const clamped = clampMetaDescription(candidate ?? "");
    if (clamped.length >= META_DESCRIPTION_MIN_USEFUL_LENGTH) return clamped;
  }

  // Короткий, но непустой primary — лучше, чем шаблон, если title нет.
  for (const candidate of candidates) {
    const clamped = clampMetaDescription(candidate ?? "");
    if (clamped && !options.title?.trim()) return clamped;
  }

  if (options.title?.trim()) {
    return clampMetaDescription(titleFallback(kind, options.title));
  }

  return clampMetaDescription(getDefaultSiteGeoDescription());
}
