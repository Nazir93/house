import {
  CITY,
  SITE_NAME,
  SITE_URL,
  buildSchemaAreaServed,
  getDefaultSiteGeoDescription,
} from "@/lib/constants";
import { OFFICE_OPENING_HOURS_JSON_LD } from "@/lib/contact-config";
import { buildSelfReferencingCanonical } from "@/lib/seo/self-referencing-canonical";

/**
 * Sitewide JSON-LD компании (ТЗ SEO §17).
 * @type GeneralContractor — без фиктивных рейтингов, отзывов, цен и выдуманных зон.
 */

export const PUBLIC_CONTACT_EMAIL_FALLBACK = "info@chastdushi.ru";

export type GeneralContractorContactInput = {
  phone?: string | null;
  phone2?: string | null;
  email?: string | null;
  address?: string | null;
  sameAs?: readonly string[] | null;
  logoUrl?: string | null;
  /** Реальные регионы с сайта; не выдумывать. */
  includeAreaServed?: boolean;
  includeOpeningHours?: boolean;
  includeDescription?: boolean;
};

export type GeneralContractorJsonLd = {
  "@context": "https://schema.org";
  "@type": "GeneralContractor";
  name: string;
  url: string;
  telephone?: string | string[];
  email?: string;
  address: {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality: string;
    addressCountry: "RU";
  };
  description?: string;
  logo?: { "@type": "ImageObject"; url: string };
  areaServed?: Array<{ "@type": "City" | "AdministrativeArea"; name: string }>;
  sameAs?: string[];
  openingHoursSpecification?: typeof OFFICE_OPENING_HOURS_JSON_LD;
};

/** Убирает город из строки адреса для streetAddress (как в примере ТЗ). */
export function splitOfficeStreetAddress(
  fullAddress: string,
  city: string = CITY,
): { streetAddress?: string; addressLocality: string } {
  const locality = city.trim() || CITY;
  let street = fullAddress.trim();
  if (!street) return { addressLocality: locality };

  const escaped = locality.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  street = street
    .replace(new RegExp(`^г\\.?\\s*${escaped}\\s*,\\s*`, "i"), "")
    .replace(new RegExp(`^${escaped}\\s*,\\s*`, "i"), "")
    .trim();

  return {
    addressLocality: locality,
    ...(street ? { streetAddress: street } : {}),
  };
}

export function resolvePublicContactEmail(email: string | null | undefined): string | undefined {
  const trimmed = email?.trim();
  if (trimmed) return trimmed;
  return PUBLIC_CONTACT_EMAIL_FALLBACK;
}

export function listPublicContactTelephones(
  phone: string | null | undefined,
  phone2?: string | null,
): string[] {
  return [phone, phone2]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);
}

/**
 * Собирает GeneralContractor. Запрещено: aggregateRating, review, offers/цены.
 * areaServed — только из реальных SERVICE_REGIONS сайта (опционально).
 */
export function buildGeneralContractorJsonLd(
  input: GeneralContractorContactInput = {},
): GeneralContractorJsonLd {
  const telephones = listPublicContactTelephones(input.phone, input.phone2);
  const email = resolvePublicContactEmail(input.email);
  const addressParts = splitOfficeStreetAddress(input.address?.trim() || "", CITY);
  const sameAs = (input.sameAs ?? []).map((u) => u.trim()).filter(Boolean);
  const logoUrl = input.logoUrl?.trim();

  const schema: GeneralContractorJsonLd = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: SITE_NAME,
    url: buildSelfReferencingCanonical("/", SITE_URL),
    address: {
      "@type": "PostalAddress",
      addressLocality: addressParts.addressLocality,
      addressCountry: "RU",
      ...(addressParts.streetAddress ? { streetAddress: addressParts.streetAddress } : {}),
    },
  };

  if (telephones.length === 1) schema.telephone = telephones[0];
  else if (telephones.length > 1) schema.telephone = telephones;

  if (email) schema.email = email;

  if (input.includeDescription !== false) {
    schema.description = getDefaultSiteGeoDescription();
  }

  if (logoUrl) {
    schema.logo = { "@type": "ImageObject", url: logoUrl };
  }

  if (input.includeAreaServed !== false) {
    const areas = buildSchemaAreaServed();
    if (areas.length) schema.areaServed = areas;
  }

  if (sameAs.length) schema.sameAs = sameAs;

  if (input.includeOpeningHours !== false) {
    schema.openingHoursSpecification = OFFICE_OPENING_HOURS_JSON_LD;
  }

  return schema;
}

/** Защита от случайного добавления запрещённых полей §17. */
export function assertGeneralContractorHasNoFakes(schema: Record<string, unknown>): string[] {
  const banned = ["aggregateRating", "review", "offers", "hasOfferCatalog", "priceRange", "price"];
  return banned.filter((key) => key in schema);
}
