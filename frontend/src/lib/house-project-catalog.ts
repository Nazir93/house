import type { MaterialFilterId } from "@/lib/project-filters";

export type HouseProjectCatalogKind = "author" | "partner";

export type HouseProjectCatalogConfig = {
  kind: HouseProjectCatalogKind;
  basePath: string;
  listTitle: string;
  listBreadcrumb: string;
  listDescription: string;
  detailBreadcrumbLabel: string;
  adminListPath: string;
  adminNewPath: string;
  adminListTitle: string;
  adminListDescription: string;
  adminFormTitleNew: string;
  adminFormTitleEdit: string;
  adminFormDescription: string;
};

export const AUTHOR_HOUSE_PROJECT_CATALOG: HouseProjectCatalogConfig = {
  kind: "author",
  basePath: "/projects",
  listTitle: "Каталог авторских проектов",
  listBreadcrumb: "Каталог авторских проектов",
  listDescription:
    "Выберите авторский проект дома под ваш участок, состав семьи и бюджет. В каталоге представлены одно- и двухэтажные дома из газобетона, кирпича и керамоблока с планировками и расчётом стоимости строительства в Санкт-Петербурге и Ленинградской области.",
  detailBreadcrumbLabel: "Каталог авторских проектов",
  adminListPath: "/admin/house-projects",
  adminNewPath: "/admin/house-projects/new",
  adminListTitle: "Авторские проекты домов",
  adminListDescription: "Каталог авторских проектов на сайте (/projects).",
  adminFormTitleNew: "Новый авторский проект",
  adminFormTitleEdit: "Авторский проект дома",
  adminFormDescription: "Карточка в каталоге авторских проектов.",
};

export const PARTNER_HOUSE_PROJECT_CATALOG: HouseProjectCatalogConfig = {
  kind: "partner",
  basePath: "/typical-projects",
  listTitle: "Каталог типовых проектов",
  listBreadcrumb: "Каталог типовых проектов",
  listDescription:
    "Готовые проекты каменных домов для строительства в Санкт-Петербурге и Ленинградской области. Выберите дом по площади, этажности, цене и планировке — в каждой карточке представлены фасады и предварительный расчёт стоимости строительства",
  detailBreadcrumbLabel: "Каталог типовых проектов",
  adminListPath: "/admin/partner-house-projects",
  adminNewPath: "/admin/partner-house-projects/new",
  adminListTitle: "Типовые проекты",
  adminListDescription: "Каталог типовых проектов на сайте (/typical-projects).",
  adminFormTitleNew: "Новый типовой проект",
  adminFormTitleEdit: "Типовой проект дома",
  adminFormDescription: "Карточка в каталоге типовых проектов.",
};

export function getHouseProjectCatalog(kind: HouseProjectCatalogKind): HouseProjectCatalogConfig {
  return kind === "partner" ? PARTNER_HOUSE_PROJECT_CATALOG : AUTHOR_HOUSE_PROJECT_CATALOG;
}

export function houseProjectDetailPath(
  catalog: HouseProjectCatalogConfig,
  slug: string,
  options?: { material?: MaterialFilterId },
): string {
  const base = `${catalog.basePath}/${slug}`;
  const material = options?.material;
  if (!material || material === "all") return base;
  return `${base}?material=${encodeURIComponent(material)}`;
}

export function parseHouseProjectCatalogKind(value: unknown): HouseProjectCatalogKind {
  return value === "partner" ? "partner" : "author";
}
