/**
 * Перелинковка коммерческих страниц (ТЗ SEO §25).
 * Только каноны сайта — без `/stroitelstvo-*` и без `/lp/`.
 */

export type SeoInterlink = {
  id: string;
  label: string;
  href: string;
};

/** Главная: материалы + проекты + объекты + проектирование. */
export const HOME_SEO_INTERLINKS: SeoInterlink[] = [
  { id: "gazobeton", label: "Газобетон", href: "/projects/gazobeton" },
  { id: "kirpich", label: "Кирпич", href: "/projects/kirpich" },
  { id: "keramoblok", label: "Керамоблок", href: "/projects/keramoblok" },
  { id: "projects", label: "Проекты", href: "/projects" },
  { id: "portfolio", label: "Построенные дома", href: "/portfolio" },
  { id: "proektirovanie", label: "Проектирование", href: "/services/proektirovanie" },
];

/** Хаб `/projects`: материалы, объекты, проектирование, калькулятор. */
export const PROJECTS_HUB_SEO_INTERLINKS: SeoInterlink[] = [
  { id: "gazobeton", label: "Газобетон", href: "/projects/gazobeton" },
  { id: "kirpich", label: "Кирпич", href: "/projects/kirpich" },
  { id: "keramoblok", label: "Керамоблок", href: "/projects/keramoblok" },
  { id: "portfolio", label: "Построенные дома", href: "/portfolio" },
  { id: "proektirovanie", label: "Проектирование", href: "/services/proektirovanie" },
  { id: "calculator", label: "Калькулятор", href: "/calculator" },
];

export type MaterialInterlinkSlug = "gazobeton" | "kirpich" | "keramoblok";

/** Посадочная материала: проекты/объекты материала, калькулятор, проектирование. */
export function materialLandingSeoInterlinks(slug: MaterialInterlinkSlug): SeoInterlink[] {
  const labels: Record<MaterialInterlinkSlug, { projects: string; objects: string }> = {
    gazobeton: {
      projects: "Проекты из газобетона",
      objects: "Дома из газобетона",
    },
    kirpich: {
      projects: "Кирпичные проекты",
      objects: "Кирпичные дома",
    },
    keramoblok: {
      projects: "Проекты из керамоблока",
      objects: "Дома из керамоблока",
    },
  };
  const copy = labels[slug];
  return [
    { id: "projects", label: copy.projects, href: `#material-projects` },
    { id: "objects", label: copy.objects, href: `#material-objects` },
    { id: "calculator", label: "Калькулятор", href: "/calculator" },
    { id: "proektirovanie", label: "Проектирование", href: "/services/proektirovanie" },
  ];
}

/** Объект портфолио: похожие проекты, материал, расчёт (§6 / §25). */
export function builtObjectPageSeoInterlinkHrefs(materialHref: string | null): string[] {
  const hrefs = ["/projects", "/calculator"];
  if (materialHref) hrefs.push(materialHref);
  return hrefs;
}

export function listSeoInterlinkHrefs(links: ReadonlyArray<SeoInterlink>): string[] {
  return links.map((l) => l.href);
}
