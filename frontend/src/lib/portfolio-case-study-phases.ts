/** Разделы таймлайна кейса (кроме «Рендеры» и «Планировки» — у них отдельные типы медиа в админке). */
export const CASE_STUDY_CONSTRUCTION_PHASES = [
  { id: "foundation", title: "Фундамент" },
  { id: "walls", title: "Стены" },
  { id: "roof", title: "Кровля" },
  { id: "windows", title: "Окна" },
  { id: "partitions", title: "Перегородки" },
  {
    id: "prep-base",
    title: "Подготовка основания под монтаж инженерных коммуникаций",
  },
  {
    id: "mep",
    title: "Отопление, водоснабжение, вентиляция, канализация",
  },
  { id: "ext-vent", title: "Внешняя вентиляция" },
  { id: "conditioning", title: "Кондиционирование" },
  { id: "power", title: "Электроснабжение" },
  { id: "floors", title: "Полы" },
  { id: "facade", title: "Фасад" },
  { id: "blind-area", title: "Отмостка и дренаж" },
  { id: "landscaping", title: "Благоустройство" },
  { id: "external-networks", title: "Наружные сети" },
] as const;

export type CaseStudyConstructionPhaseId = (typeof CASE_STUDY_CONSTRUCTION_PHASES)[number]["id"];
