import type { MaterialFilterId } from "@/lib/project-filters";

export const HOME_MATERIALS_SECTION_EYEBROW = "Материалы и старт цены";

export const HOME_MATERIALS_SECTION_TITLE = "Из чего может быть построен ваш дом";

export const HOME_MATERIALS_SECTION_SUBTITLE =
  "Мы строим загородные дома из газобетона, керамблока и кирпича 2.1 НФ. Для каждого материала указан ориентир по стартовой стоимости за м² — точная смета формируется после выбора проекта, оценки участка и согласования комплектации.";

export type HomeMaterialId = Exclude<MaterialFilterId, "all">;

export type HomeMaterialCardContent = {
  id: HomeMaterialId;
  title: string;
  description: string;
  image: string;
  labelShort: string;
  /**
   * Органическая SEO-страница материала (не `/stroitelstvo-domov-iz-*`, не `?material=`).
   * ТЗ SEO §3 — адаптировано на уже живые `/projects/{материал}`.
   */
  seoPath: `/projects/${HomeMaterialId}`;
  /** Каталог/сетка проектов этого материала на посадочной. */
  projectsHref: `/projects/${HomeMaterialId}#material-projects`;
  /** Блок «что входит» / комплектация на посадочной материала. */
  completionHref: `/projects/${HomeMaterialId}#material-included`;
};

export const HOME_MATERIAL_CARDS: HomeMaterialCardContent[] = [
  {
    id: "gazobeton",
    title: "Дом из газобетона",
    description:
      "Газобетон — лёгкий стеновой материал с ровной геометрией и хорошими теплоизоляционными свойствами. Подходит для современных домов с гибкими планировками.",
    image: "/images/materials/gazobeton.webp",
    labelShort: "Газобетон",
    seoPath: "/projects/gazobeton",
    projectsHref: "/projects/gazobeton#material-projects",
    completionHref: "/projects/gazobeton#material-included",
  },
  {
    id: "keramoblok",
    title: "Дом из керамического блока",
    description:
      "Керамблок — тёплая поризованная керамика для прочных наружных стен. Материал хорошо держит тепло, помогает формировать комфортный микроклимат.",
    image: "/images/materials/keramoblok.webp",
    labelShort: "Керамоблок",
    seoPath: "/projects/keramoblok",
    projectsHref: "/projects/keramoblok#material-projects",
    completionHref: "/projects/keramoblok#material-included",
  },
  {
    id: "kirpich",
    title: "Кирпичный дом",
    description:
      "Керамический кирпич 2.1 НФ — крупноформатный кирпич для надёжных и долговечных стен. Подходит для основательных домов с высоким уровнем прочности, теплоёмкости.",
    image: "/images/materials/kirpich.webp",
    labelShort: "Кирпич 2.1 НФ",
    seoPath: "/projects/kirpich",
    projectsHref: "/projects/kirpich#material-projects",
    completionHref: "/projects/kirpich#material-included",
  },
];

/** Канон ссылки с блока материалов главной на SEO-страницу материала. */
export function homeMaterialSeoPath(id: HomeMaterialId): `/projects/${HomeMaterialId}` {
  const card = HOME_MATERIAL_CARDS.find((c) => c.id === id);
  if (!card) throw new Error(`Unknown home material id: ${id}`);
  return card.seoPath;
}
