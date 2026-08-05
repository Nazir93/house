export type ConstructionServiceStage = {
  id: string;
  title: string;
  description: string;
  image: string;
};

/** Блок «Строительные услуги по этапам» на главной — фото по каждому пункту. */
export const CONSTRUCTION_SERVICE_STAGES: ConstructionServiceStage[] = [
  {
    id: "site-check",
    title: "Комплексная проверка участка",
    description: "Геодезия, геология и юридическая проверка",
    image: "/images/services/stages/site-check.png",
  },
  {
    id: "utilities",
    title: "Наружные сети и участок",
    description:
      "Дренаж, отмостка, ливневая канализация, скважины, очистные сооружения, газгольдеры, проведение воды и электричества, теплотрасса, сбросной колодец",
    image: "/images/services/stages/utilities.png",
  },
  {
    id: "facade",
    title: "Отделка фасадов",
    description: "Покраска деревянных домов, отделка фасадов каменных домов",
    image: "/images/services/stages/facade.png",
  },
  {
    id: "interior",
    title: "Внутренняя отделка и внутренние инженерные коммуникации",
    description:
      "Перегородки, скрытые работы, монтаж отопления, вентиляции, водоснабжения и канализации, электрика, кондиционирование, отопительные приборы, отделка полов по лагам, тёплые полы, стяжка, котельная, отделка стен и потолка, внутренняя покраска.",
    image: "/images/services/stages/interior.png",
  },
];

export function getConstructionServiceStage(
  stages: ConstructionServiceStage[],
  id: string,
): ConstructionServiceStage {
  return stages.find((s) => s.id === id) ?? stages[0]!;
}
