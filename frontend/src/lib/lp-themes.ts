export type LpThemeId = "heritage" | "flagship" | "calculator" | "modern" | "layout" | "premium";

export type LpHeroVariant =
  | "cinematic-center"
  | "flagship-split"
  | "calculator-light"
  | "modern-wide"
  | "layout-split"
  | "premium-asymmetric";

export type LpComparisonLayout = "table" | "columns";

export type LpProjectsLayout = "grid" | "carousel";

export type LpSectionId =
  | "facts"
  | "projects"
  | "includes"
  | "guarantees"
  | "comparison"
  | "portfolio"
  | "steps"
  | "quiz"
  | "mortgage"
  | "excursion"
  | "reviews"
  | "faq";

export type LpThemeSpec = {
  id: LpThemeId;
  heroVariant: LpHeroVariant;
  comparisonLayout: LpComparisonLayout;
  projectsLayout: LpProjectsLayout;
  heroDark: boolean;
  sectionAltBg: string;
  accentTint: string;
  heroWarmTint?: string;
};

export type LpSlug =
  | "dom-pod-klyuch"
  | "kirpich"
  | "stoimost"
  | "gazobeton"
  | "odnoetazhnye"
  | "keramoblok";

export const LP_THEME_BY_SLUG: Record<LpSlug, LpThemeId> = {
  kirpich: "heritage",
  "dom-pod-klyuch": "flagship",
  stoimost: "calculator",
  gazobeton: "modern",
  odnoetazhnye: "layout",
  keramoblok: "premium",
};

const BASE_SECTION_ORDER: LpSectionId[] = [
  "facts",
  "projects",
  "includes",
  "guarantees",
  "comparison",
  "portfolio",
  "steps",
  "quiz",
  "mortgage",
  "excursion",
  "reviews",
  "faq",
];

export const DEFAULT_SECTION_ORDER_BY_THEME: Record<LpThemeId, LpSectionId[]> = {
  heritage: BASE_SECTION_ORDER,
  /** Flagship: квиз сразу после проектов — раньше до длинной простыни. */
  flagship: [
    "facts",
    "projects",
    "quiz",
    "includes",
    "guarantees",
    "comparison",
    "portfolio",
    "steps",
    "mortgage",
    "excursion",
    "reviews",
    "faq",
  ],
  calculator: [
    "facts",
    "quiz",
    "projects",
    "includes",
    "guarantees",
    "comparison",
    "portfolio",
    "steps",
    "mortgage",
    "excursion",
    "reviews",
    "faq",
  ],
  modern: BASE_SECTION_ORDER,
  layout: BASE_SECTION_ORDER.filter((id) => id !== "comparison"),
  premium: BASE_SECTION_ORDER,
};

export const LP_THEME_SPECS: Record<LpThemeId, LpThemeSpec> = {
  heritage: {
    id: "heritage",
    heroVariant: "cinematic-center",
    comparisonLayout: "columns",
    projectsLayout: "grid",
    heroDark: true,
    sectionAltBg: "var(--bg-secondary)",
    accentTint: "color-mix(in srgb, #8b4513 12%, var(--accent))",
    heroWarmTint: "rgba(139, 69, 19, 0.08)",
  },
  flagship: {
    id: "flagship",
    heroVariant: "flagship-split",
    comparisonLayout: "columns",
    projectsLayout: "grid",
    heroDark: true,
    sectionAltBg: "var(--bg-secondary)",
    accentTint: "var(--accent)",
  },
  calculator: {
    id: "calculator",
    heroVariant: "calculator-light",
    comparisonLayout: "table",
    projectsLayout: "grid",
    heroDark: false,
    sectionAltBg: "var(--bg-secondary)",
    accentTint: "var(--accent)",
  },
  modern: {
    id: "modern",
    heroVariant: "modern-wide",
    comparisonLayout: "columns",
    projectsLayout: "grid",
    heroDark: true,
    sectionAltBg: "color-mix(in srgb, var(--bg-secondary) 90%, white)",
    accentTint: "var(--accent)",
  },
  layout: {
    id: "layout",
    heroVariant: "layout-split",
    comparisonLayout: "table",
    projectsLayout: "carousel",
    heroDark: true,
    sectionAltBg: "var(--bg-secondary)",
    accentTint: "var(--accent)",
  },
  premium: {
    id: "premium",
    heroVariant: "premium-asymmetric",
    comparisonLayout: "columns",
    projectsLayout: "grid",
    heroDark: true,
    sectionAltBg: "color-mix(in srgb, var(--accent) 4%, var(--bg-secondary))",
    accentTint: "var(--accent)",
  },
};

export function resolveLpTheme(config: { slug: LpSlug; theme?: LpThemeId }): LpThemeId {
  return config.theme ?? LP_THEME_BY_SLUG[config.slug];
}

export function resolveLpThemeSpec(config: { slug: LpSlug; theme?: LpThemeId }): LpThemeSpec {
  return LP_THEME_SPECS[resolveLpTheme(config)];
}

export function resolveLpSectionOrder(config: {
  slug: LpSlug;
  theme?: LpThemeId;
  sectionOrder?: LpSectionId[];
}): LpSectionId[] {
  if (config.sectionOrder?.length) return config.sectionOrder;
  return DEFAULT_SECTION_ORDER_BY_THEME[resolveLpTheme(config)];
}

export const LP_WORK_STEPS = [
  {
    step: "01",
    title: "Заявка и параметры",
    text: "Заполняете квиз или звоните — фиксируем площадь, материал, бюджет и интерес к ипотеке.",
  },
  {
    step: "02",
    title: "Проект и смета",
    text: "Подбираем типовой или адаптированный проект, считаем комплектацию и состав работ.",
  },
  {
    step: "03",
    title: "Договор и график",
    text: "Согласуем смету, этапы оплаты и календарный план строительства.",
  },
  {
    step: "04",
    title: "Стройка под ключ",
    text: "Ведём работы на площадке, контролируем качество и показываем ход на экскурсиях.",
  },
] as const;
