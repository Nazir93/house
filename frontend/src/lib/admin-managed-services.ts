import type { ServiceType } from "@prisma/client";
import { FULL_SERVICE_TYPE_DROPDOWN_OPTIONS } from "@/lib/service-type-admin-options";

/** Страница проектирования ведётся кодом; в CMS услуг не редактируем. */
export const CODE_OWNED_SERVICE_SLUG = "proektirovanie";
export const CODE_OWNED_SERVICE_TYPE: ServiceType = "HOUSE_DESIGN";

export function isCodeOwnedAdminService(input: {
  slug?: string | null;
  serviceType?: string | null;
}): boolean {
  const slug = (input.slug ?? "").trim().replace(/^\/services\//, "");
  if (slug === CODE_OWNED_SERVICE_SLUG || slug === "projecting") return true;
  return input.serviceType === CODE_OWNED_SERVICE_TYPE;
}

/** Типы для селекта в админке услуг (без проектирования). */
export const ADMIN_EDITABLE_SERVICE_TYPE_OPTIONS = FULL_SERVICE_TYPE_DROPDOWN_OPTIONS.filter(
  (o) => o.value !== CODE_OWNED_SERVICE_TYPE,
);
