import { getKnownServiceSeoSlugs } from "@/lib/seo/service-seo-defaults";
import { getProjectCatalogSliceSeoPages } from "@/lib/seo/project-catalog-slice-seo";
import { getProjectMaterialSeoPages } from "@/lib/seo/project-material-seo";
import {
  lookupRedirectResolved,
  normalizeRedirectPath,
  type RedirectMap,
} from "@/lib/seo/redirect-map";

/**
 * Стабильность индексируемых URL (ТЗ SEO §22).
 * Не менять ради «красоты» структуры. Если путь всё же меняется — обязателен 301/308.
 */

/** Каноны, которые уже в индексе / Вебмастере — не переименовывать без нужды. */
export const PROTECTED_INDEXED_PATHS = [
  "/",
  "/projects",
  "/typical-projects",
  "/portfolio",
  "/portfolio/under-construction",
  "/portfolio/map",
  "/calculator",
  "/services",
  "/services/proektirovanie",
  "/services/fundament",
  "/services/karkas",
  "/services/krovlya",
  "/services/inzheneriya",
  "/services/otdelka",
  "/projects/gazobeton",
  "/projects/kirpich",
  "/projects/keramoblok",
  "/about",
  "/contacts",
  "/reviews",
  "/blog",
  "/mortgage",
] as const;

export type ProtectedIndexedPath = (typeof PROTECTED_INDEXED_PATHS)[number];

export function isProtectedIndexedPath(pathname: string): boolean {
  const path = normalizeRedirectPath(pathname);
  return (PROTECTED_INDEXED_PATHS as readonly string[]).includes(path);
}

/**
 * Актуальные каноны из SEO-модулей сайта (материалы / срезы / услуги).
 * Если сюда попадёт «новый красивый» путь вместо старого — тест §22 упадёт.
 */
export function listCurrentSeoCanonicalPaths(): string[] {
  const paths = new Set<string>([
    "/",
    "/projects",
    "/portfolio",
    "/calculator",
    "/services",
  ]);
  for (const page of getProjectMaterialSeoPages()) paths.add(page.path);
  for (const page of getProjectCatalogSliceSeoPages()) paths.add(page.path);
  for (const slug of getKnownServiceSeoSlugs()) paths.add(`/services/${slug}`);
  return [...paths].sort();
}

/**
 * Правило смены URL: старый → permanent redirect → новый.
 * Без записи в карте редиректов менять protected path нельзя.
 */
export function urlChangeHasRequiredPermanentRedirect(
  oldPath: string,
  newPath: string,
  map: RedirectMap,
): boolean {
  const from = normalizeRedirectPath(oldPath);
  const to = normalizeRedirectPath(newPath);
  if (from === to) return true;
  const resolved = lookupRedirectResolved(map, from);
  if (!resolved) return false;
  return resolved.permanent && normalizeRedirectPath(resolved.toPath) === to;
}

/** Запрет «переезда» protected URL без 301/308. */
export function assertProtectedUrlRenameAllowed(
  oldPath: string,
  newPath: string,
  map: RedirectMap,
): { ok: true } | { ok: false; reason: string } {
  if (!isProtectedIndexedPath(oldPath)) return { ok: true };
  if (normalizeRedirectPath(oldPath) === normalizeRedirectPath(newPath)) {
    return { ok: true };
  }
  if (urlChangeHasRequiredPermanentRedirect(oldPath, newPath, map)) {
    return { ok: true };
  }
  return {
    ok: false,
    reason: `§22: нельзя менять ${normalizeRedirectPath(oldPath)} → ${normalizeRedirectPath(newPath)} без permanent redirect`,
  };
}
