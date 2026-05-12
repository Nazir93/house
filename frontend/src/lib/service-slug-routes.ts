import type { ServiceType } from "@prisma/client";

/** Редиректы со старых англ. URL услуг (шаблон до миграции) на актуальные slug в CMS. */
export const SERVICE_PATH_REDIRECTS: { source: string; destination: string }[] = [
  { source: "/services/projecting", destination: "/services/proektirovanie" },
  { source: "/services/foundation", destination: "/services/fundament" },
  { source: "/services/roofing", destination: "/services/krovlya" },
  { source: "/services/engineering", destination: "/services/inzheneriya" },
  { source: "/services/finishing", destination: "/services/otdelka" },
];

/** Slug в URL → Prisma ServiceType: страница услуги без строки в БД (до сида / после миграции). */
export const CMS_SERVICE_SLUG_TO_SERVICE_TYPE: Record<string, ServiceType> = {
  proektirovanie: "HOUSE_DESIGN",
  fundament: "HOUSE_FOUNDATION",
  karkas: "HOUSE_STRUCTURE",
  krovlya: "HOUSE_ROOFING",
  inzheneriya: "HOUSE_ENGINEERING",
  otdelka: "HOUSE_FINISHING",
};

export const KNOWN_CMS_SERVICE_SLUGS = Object.keys(CMS_SERVICE_SLUG_TO_SERVICE_TYPE);

/** Внутренний ключ услуги (лиды, константы) → публичный slug (путь /services/{slug}). */
export const CONSTRUCTION_INTERNAL_TO_PUBLIC_SLUG: Record<string, string> = {
  projecting: "proektirovanie",
  foundation: "fundament",
  shell: "karkas",
  roofing: "krovlya",
  engineering: "inzheneriya",
  finishing: "otdelka",
};

export function servicePagePathForInternalKey(internalSlug: string): string {
  const pub = CONSTRUCTION_INTERNAL_TO_PUBLIC_SLUG[internalSlug];
  return pub ? `/services/${pub}` : `/services/${internalSlug}`;
}
