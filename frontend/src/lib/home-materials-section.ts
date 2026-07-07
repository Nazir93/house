import type { MaterialFilterId } from "@/lib/project-filters";

export const HOME_MATERIALS_SECTION_EYEBROW = "Материалы и старт цены";

export const HOME_MATERIALS_SECTION_TITLE = "Из чего может быть построен ваш дом";

export const HOME_MATERIALS_SECTION_SUBTITLE =
  "Мы строим загородные дома из газобетона, керамблока и кирпича 2.1 НФ. Для каждого материала указан ориентир по стартовой стоимости за м² — точная смета формируется после выбора проекта, оценки участка и согласования комплектации.";

export type HomeMaterialCardContent = {
  id: Exclude<MaterialFilterId, "all">;
  title: string;
  description: string;
  image: string;
  labelShort: string;
};

export const HOME_MATERIAL_CARDS: HomeMaterialCardContent[] = [
  {
    id: "gazobeton",
    title: "Дома из газобетона",
    description:
      "Газобетон — лёгкий стеновой материал с ровной геометрией и хорошими теплоизоляционными свойствами. Подходит для современных домов с гибкими планировками.",
    image: "/images/materials/gazobeton.webp",
    labelShort: "Газобетон",
  },
  {
    id: "keramoblok",
    title: "Дома из керамоблока",
    description:
      "Керамблок — тёплая поризованная керамика для прочных наружных стен. Материал хорошо держит тепло, помогает формировать комфортный микроклимат.",
    image: "/images/materials/keramoblok.webp",
    labelShort: "Керамоблок",
  },
  {
    id: "kirpich",
    title: "Дома из кирпича 2.1 НФ",
    description:
      "Керамический кирпич 2.1 НФ — крупноформатный кирпич для надёжных и долговечных стен. Подходит для основательных домов с высоким уровнем прочности, теплоёмкости.",
    image: "/images/materials/kirpich.webp",
    labelShort: "Кирпич 2.1 НФ",
  },
];
