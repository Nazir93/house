import { SITE_NAME } from "@/lib/constants";
import { PARTNER_HOUSE_PROJECT_CATALOG } from "@/lib/house-project-catalog";

/**
 * SEO хаба `/projects` (ТЗ SEO §7–§8).
 * Запрос Вебмастера «авторские проекты домов» привязан к этому URL.
 */

export type AuthorProjectsCatalogSeo = {
  path: "/projects";
  title: string;
  description: string;
  h1: string;
  /** Текст под H1 в HTML (короткий; большой текст — только после каталога). */
  intro: string;
  keywords: string[];
};

export const AUTHOR_PROJECTS_CATALOG_SEO: AuthorProjectsCatalogSeo = {
  path: "/projects",
  title: `Авторские проекты домов — каталог с ценами и планировками | ${SITE_NAME}`,
  description:
    "Каталог авторских проектов частных домов: планировки, площади и стоимость строительства. Проекты домов из газобетона, керамоблока и кирпича для Санкт-Петербурга и Ленинградской области.",
  h1: "Авторские проекты домов",
  intro:
    "Выберите авторский проект дома под ваш участок, состав семьи и бюджет. В каталоге представлены одно- и двухэтажные дома из газобетона, кирпича и керамоблока с планировками и расчётом стоимости строительства в Санкт-Петербурге и Ленинградской области.",
  keywords: [
    "авторские проекты домов",
    "каталог проектов домов",
    "проекты домов с ценами",
    "планировки домов",
    "проекты домов из газобетона",
    "проекты домов из кирпича",
    "проекты домов из керамоблока",
    SITE_NAME,
  ],
};

export function getAuthorProjectsCatalogSeo(): AuthorProjectsCatalogSeo {
  return AUTHOR_PROJECTS_CATALOG_SEO;
}

export type UnifiedProjectsCatalogSeo = {
  path: "/projects";
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: string[];
};

export const UNIFIED_PROJECTS_CATALOG_SEO: UnifiedProjectsCatalogSeo = {
  path: "/projects",
  title: `Каталог проектов домов — авторские и типовые | ${SITE_NAME}`,
  description:
    "Все проекты частных домов: авторские и типовые планировки, площади и ориентир стоимости строительства в Санкт-Петербурге и Ленинградской области.",
  h1: "Каталог проектов домов",
  intro:
    "Авторские и типовые проекты в одном каталоге: фильтры по площади, этажности, материалу стен и бюджету. Откройте карточку — планировки, калькулятор и ориентир сметы.",
  keywords: [
    "каталог проектов домов",
    "проекты домов с ценами",
    "авторские проекты домов",
    "типовые проекты домов",
    SITE_NAME,
  ],
};

export function getUnifiedProjectsCatalogSeo(): UnifiedProjectsCatalogSeo {
  return UNIFIED_PROJECTS_CATALOG_SEO;
}

export function getPartnerProjectsCatalogSeo(): {
  path: "/projects";
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: string[];
} {
  return {
    path: "/projects",
    title: `Каталог типовых проектов — цены и планировки | ${SITE_NAME}`,
    description: PARTNER_HOUSE_PROJECT_CATALOG.listDescription,
    h1: PARTNER_HOUSE_PROJECT_CATALOG.listTitle,
    intro: PARTNER_HOUSE_PROJECT_CATALOG.listDescription,
    keywords: ["типовые проекты домов", "каталог домов", "дом под ключ", SITE_NAME],
  };
}

/** ТЗ SEO §8: информационно-коммерческий блок после сетки, не перед. */
export const AUTHOR_PROJECTS_AFTER_CATALOG_H2 =
  "Проекты домов для строительства в СПб и Ленинградской области";

/**
 * Абзацы после каталога (~1500–2500 знаков суммарно).
 * По делу: площадь, этажность, материалы, адаптация, путь к стройке.
 */
export const AUTHOR_PROJECTS_AFTER_CATALOG_PARAGRAPHS = [
  "В каталоге собраны авторские проекты частных домов для строительства в Санкт-Петербурге и Ленинградской области. Обычно начинают с площади: компактные планировки удобны на небольшом участке и при ограниченном бюджете, а более просторные дома подходят большой семье. Фильтры по метражу помогают сразу отсеять варианты, которые не вписываются в участок или смету.",
  "Этажность задаёт сценарий жизни в доме. Одноэтажные проекты выбирают, когда важны отсутствие лестниц и размещение всех помещений на одном уровне. Дома в полтора и два этажа дают больше жилой площади на том же пятне застройки и позволяют разделить дневную зону и спальни. Подборку сужают фильтрами каталога, затем открывают карточку с планировками и составом помещений.",
  "Материал стен согласуют вместе с проектом. Газобетон часто берут за теплотехнические свойства и относительно быстрый монтаж коробки. Керамоблок подходит, когда нужна каменная стена с ровной геометрией и привычной кладкой. Кирпич выбирают за долговечность и классический характер фасада. В карточке видно, как меняется ориентир стоимости при смене материала стен.",
  "Любой проект можно адаптировать под участок: учесть рельеф, отступы, сторону света, въезд и точки подключения коммуникаций. По желанию заказчика меняют состав комнат, размеры террасы, положение окон и входной группы. Такие правки фиксируют до старта работ, чтобы чертежи и смета совпадали с тем, что будет строиться.",
  "От проекта к строительству путь прямой: выбираете планировку, уточняете комплектацию, считаете ориентировочную стоимость и переходите к договору и этапам работ. По готовым и строящимся объектам можно заранее посмотреть, как похожие решения выглядят вживую. Так каталог остаётся рабочей витриной с понятным следующим шагом — от выбора дома к реализации на участке.",
] as const;

/** Ссылки под текстом: материалы + калькулятор + объекты + проектирование (§25). */
export const AUTHOR_PROJECTS_AFTER_CATALOG_LINKS = [
  { href: "/projects/gazobeton", label: "Проекты из газобетона" },
  { href: "/projects/keramoblok", label: "Проекты из керамоблока" },
  { href: "/projects/kirpich", label: "Проекты из кирпича" },
  { href: "/calculator", label: "Рассчитать стоимость" },
  { href: "/portfolio", label: "Построенные дома" },
  { href: "/services/proektirovanie", label: "Проектирование" },
] as const;

export function authorProjectsAfterCatalogPlainText(): string {
  return AUTHOR_PROJECTS_AFTER_CATALOG_PARAGRAPHS.join("\n\n");
}

export function authorProjectsAfterCatalogCharCount(): number {
  return authorProjectsAfterCatalogPlainText().length;
}
