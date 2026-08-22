import type { HouseProjectItem } from "@/lib/construction-data";
import type { HouseProjectCatalogKind } from "@/lib/house-project-catalog";

/** Вкладки единого каталога `/projects`. */
export type ProjectsCatalogTypeFilter = "all" | HouseProjectCatalogKind;

export const PROJECTS_CATALOG_TYPE_QUERY_KEY = "catalog";

export const PROJECTS_CATALOG_TYPE_OPTIONS: Array<{ id: ProjectsCatalogTypeFilter; label: string }> = [
  { id: "all", label: "Все проекты" },
  { id: "author", label: "Авторские" },
  { id: "partner", label: "Типовые" },
];

export function parseProjectsCatalogTypeParam(raw: string | null | undefined): ProjectsCatalogTypeFilter {
  const v = raw?.trim().toLowerCase();
  if (v === "author" || v === "авторские") return "author";
  if (v === "partner" || v === "typical" || v === "типовые") return "partner";
  return "all";
}

export function projectsCatalogTypeQueryValue(filter: ProjectsCatalogTypeFilter): string | null {
  if (filter === "all") return null;
  return filter;
}

/** Ссылка на единый хаб `/projects` с вкладкой каталога. */
export function houseProjectsCatalogHubHref(filter: ProjectsCatalogTypeFilter = "all"): string {
  const catalog = projectsCatalogTypeQueryValue(filter);
  return catalog ? `/projects?${PROJECTS_CATALOG_TYPE_QUERY_KEY}=${catalog}` : "/projects";
}

export function projectMatchesCatalogType(
  project: HouseProjectItem,
  filter: ProjectsCatalogTypeFilter,
): boolean {
  if (filter === "all") return true;
  const kind = project.catalogKind ?? "author";
  return kind === filter;
}
