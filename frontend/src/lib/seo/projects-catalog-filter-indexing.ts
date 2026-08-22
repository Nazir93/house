import type { MaterialFilterId } from "@/lib/project-filters";
import { getProjectMaterialSeoSlugs, type ProjectMaterialSeoSlug } from "@/lib/seo/project-material-seo";

/**
 * SEO фильтров каталога проектов (ТЗ SEO §9).
 * GET-комбинации не индексируем массово; SEO-срезы — отдельные ЧПУ.
 */

export type ProjectsCatalogHubPath = "/projects" | "/typical-projects";

type SearchParamsLike = Record<string, string | string[] | undefined>;

function readParam(sp: SearchParamsLike, key: string): string | null {
  const raw = sp[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

/** Известные SEO-слаги материалов (`/projects/gazobeton` и т.п.). */
export function isProjectMaterialSeoSlug(value: string | null | undefined): value is ProjectMaterialSeoSlug {
  if (!value) return false;
  return (getProjectMaterialSeoSlugs() as readonly string[]).includes(value);
}

/** Нормализация опечаток вроде gasobeton → gazobeton. */
export function normalizeProjectsCatalogMaterialParam(raw: string | null): MaterialFilterId | "all" {
  if (!raw) return "all";
  const v = raw.trim().toLowerCase();
  if (v === "gazobeton" || v === "gasobeton" || v === "gas-block" || v === "газобетон") return "gazobeton";
  if (v === "keramoblok" || v === "ceramoblok" || v === "ceramic" || v === "керамоблок") return "keramoblok";
  if (v === "kirpich" || v === "brick" || v === "кирпич") return "kirpich";
  return "all";
}

/** GET-ключи фильтров каталога — для Clean-param (Яндекс) и §9/§16, не для Disallow. */
export const PROJECTS_CATALOG_FILTER_QUERY_KEYS = [
  "material",
  "floors",
  "areaMin",
  "areaMax",
  "priceMin",
  "priceMax",
  "q",
  "sort",
  "catalog",
] as const;

const FILTER_QUERY_KEYS = PROJECTS_CATALOG_FILTER_QUERY_KEYS;

export function listProjectsCatalogFilterQueryKeys(sp: SearchParamsLike): string[] {
  return FILTER_QUERY_KEYS.filter((key) => readParam(sp, key) != null);
}

export function projectsCatalogHasFilterQuery(sp: SearchParamsLike): boolean {
  return listProjectsCatalogFilterQueryKeys(sp).length > 0;
}

export type ProjectsCatalogFilterSeoAction = {
  /** Канон без GET. */
  canonicalPath: string;
  /** Закрыть от индекса комбинации фильтров. */
  noindex: boolean;
  /** Раньше: material SEO → ЧПУ. Сейчас не используется (всегда null). */
  redirectTo: string | null;
};

/**
 * Политика индексации `/projects` и `/typical-projects` при GET-фильтрах.
 * - без query → индексируем хаб;
 * - любой GET-фильтр (в т.ч. только material=…) → noindex + canonical на хаб, без редиректа.
 *
 * SEO-посадочные материалов остаются отдельными ЧПУ `/projects/{материал}` (sitemap / перелинковка).
 * Каталог с `?material=` показывает все проекты этого материала и не должен уводить на коммерческую страницу.
 */
export function resolveProjectsCatalogFilterSeoAction(
  sp: SearchParamsLike,
  hubPath: ProjectsCatalogHubPath = "/projects",
): ProjectsCatalogFilterSeoAction {
  const keys = listProjectsCatalogFilterQueryKeys(sp);
  if (keys.length === 0) {
    return { canonicalPath: hubPath, noindex: false, redirectTo: null };
  }

  return { canonicalPath: hubPath, noindex: true, redirectTo: null };
}

/** Sitemap / robots: URL с `?` не должны попадать в карту сайта. */
export function sitemapUrlHasDisallowedQuery(url: string): boolean {
  try {
    const u = new URL(url);
    return u.search.length > 1;
  } catch {
    return url.includes("?");
  }
}

/**
 * Раньше UI при выборе только материала уводил на ЧПУ коммерческой посадочной.
 * Теперь остаёмся в каталоге с `?material=` — полный список проектов материала.
 */
export function projectsCatalogMaterialOnlyHref(
  _hubPath: string,
  _material: MaterialFilterId,
  _opts: { floors: string; q: string; sort: string; rangeCustom: boolean },
): string | null {
  return null;
}
