/** Услуги в скролл-секции «Наши услуги» на главной — синхронны с видео-роликом. */
export const CLIENTS_CHOOSE_SERVICES = [
  {
    title: "Проект",
    href: "/services/proektirovanie",
    description:
      "Архитектурное и планировочное решение, адаптированное под участок и задачи семьи.",
  },
  {
    title: "Фундамент",
    href: "/services/fundament",
    description: "Надежное основание под тип грунта и проект вашего дома.",
  },
  {
    title: "Кровля",
    href: "/services/krovlya",
    description: "Теплая и герметичная кровельная система с правильными узлами.",
  },
  {
    title: "Коммуникации",
    href: "/services/inzheneriya",
    description: "Вода, канализация, электричество и инженерия, готовые к эксплуатации.",
  },
  {
    title: "Отделка",
    href: "/services/otdelka",
    description: "Чистовая отделка под ключ с аккуратной реализацией каждого этапа.",
  },
] as const;

export type ClientsChooseService = (typeof CLIENTS_CHOOSE_SERVICES)[number];
