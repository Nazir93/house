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
    "Авторские проекты домов: подбор по материалу, этажности, площади и бюджету; на главной — расширенный конструктор подбора.",
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
    "Типовые проекты от нашего партнёра: фильтры по этажности, площади, цене, комнатам и санузлам и подробные карточки.",
  detailBreadcrumbLabel: "Каталог типовых проектов",
  adminListPath: "/admin/partner-house-projects",
  adminNewPath: "/admin/partner-house-projects/new",
  adminListTitle: "Типовые проекты (партнёр)",
  adminListDescription: "Каталог типовых проектов на сайте (/typical-projects).",
  adminFormTitleNew: "Новый типовой проект",
  adminFormTitleEdit: "Типовой проект дома",
  adminFormDescription: "Карточка в каталоге типовых проектов партнёра.",
};

export function getHouseProjectCatalog(kind: HouseProjectCatalogKind): HouseProjectCatalogConfig {
  return kind === "partner" ? PARTNER_HOUSE_PROJECT_CATALOG : AUTHOR_HOUSE_PROJECT_CATALOG;
}

export function houseProjectDetailPath(catalog: HouseProjectCatalogConfig, slug: string): string {
  return `${catalog.basePath}/${slug}`;
}

export function parseHouseProjectCatalogKind(value: unknown): HouseProjectCatalogKind {
  return value === "partner" ? "partner" : "author";
}
