/**
 * Услуги по акции QR (ТЗ заказчика от 12.05.2026).
 * Slug уходит в calcData.promoFreeServiceSlug для CRM / разбора заявки.
 */
export const PROMO_QR_OFFER_SLUGS = [
  "promo-gift-projecting",
  "promo-gift-water-sewer",
  "promo-gift-biostation",
  "promo-gift-warm-floor",
  "promo-gift-radiators",
  "promo-gift-electrical",
] as const;

export type PromoQrOfferSlug = (typeof PROMO_QR_OFFER_SLUGS)[number];

export interface PromoQrOffer {
  slug: PromoQrOfferSlug;
  /** Короткое название для заявки и CRM */
  title: string;
  /** Текст с баннера (после двоеточия в ТЗ) */
  description: string;
}

export const PROMO_QR_OFFERS: readonly PromoQrOffer[] = [
  {
    slug: "promo-gift-projecting",
    title: "Проектирование в подарок",
    description:
      "Дом должен быть продолжением вашей жизни, а не копией чужого проекта. Мы создаём продуманные пространства, где каждая деталь работает на комфорт, эстетику и удобство вашей семьи на долгие годы.",
  },
  {
    slug: "promo-gift-water-sewer",
    title: "Разводка воды и канализации в доме",
    description:
      "Вы получаете готовое инженерное решение, рассчитанное для комфортной и бесперебойной эксплуатации на долгие годы.",
  },
  {
    slug: "promo-gift-biostation",
    title: "Монтаж биостанции",
    description: "Выполним установку, подключение и подготовку системы к полноценной эксплуатации.",
  },
  {
    slug: "promo-gift-warm-floor",
    title: "Тёплый пол",
    description: "Создаём эффективную и комфортную систему отопления для ежедневного удобства всей семьи.",
  },
  {
    slug: "promo-gift-radiators",
    title: "Радиаторная система отопления",
    description: "Произведём монтаж с учётом площади, планировки и особенностей вашего дома.",
  },
  {
    slug: "promo-gift-electrical",
    title: "Электромонтаж",
    description:
      "Выполним разводку кабелей и подготовим надёжную основу для безопасной и стабильной работы всей электросистемы дома.",
  },
];
