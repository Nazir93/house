/** Услуги в скролл-секции «Наши услуги» на главной — синхронны с видео-роликом. */
export const CLIENTS_CHOOSE_SERVICES = [
  {
    title: "Проект",
    href: "/services/proektirovanie",
    imageUrl: "/images/banner/banner-hero-01.png",
    description:
      "Архитектурное и планировочное решение, адаптированное под участок и задачи семьи.",
  },
  {
    title: "Фундамент",
    href: "/services/fundament",
    imageUrl: "/images/banner/banner-hero-02.png",
    description: "Надежное основание под тип грунта и проект вашего дома.",
  },
  {
    title: "Кровля",
    href: "/services/krovlya",
    imageUrl: "/images/banner/banner-hero-03.png",
    description: "Теплая и герметичная кровельная система с правильными узлами.",
  },
  {
    title: "Коммуникации",
    href: "/services/inzheneriya",
    imageUrl: "/images/banner/banner-hero-04.png",
    description: "Вода, канализация, электричество и инженерия, готовые к эксплуатации.",
  },
  {
    title: "Отделка",
    href: "/services/otdelka",
    imageUrl: "/images/banner/banner-hero-05.png",
    description: "Чистовая отделка под ключ с аккуратной реализацией каждого этапа.",
  },
] as const;

export type ClientsChooseService = (typeof CLIENTS_CHOOSE_SERVICES)[number];
