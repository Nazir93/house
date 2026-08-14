import { SITE_NAME } from "@/lib/constants";

/**
 * Коммерческий блок главной после материалов (ТЗ SEO §4).
 * Плитки → уже живые `/services/*`, без новых URL.
 */

export const HOME_TURNKEY_SERVICES_H2 = "Строительство частных домов под ключ";

export const HOME_TURNKEY_SERVICES_LEAD = [
  `«${SITE_NAME}» проектирует и строит частные дома в Санкт-Петербурге и Ленинградской области.`,
  "Мы выполняем полный комплекс работ: проектирование, устройство фундамента, строительство коробки дома, кровлю, монтаж окон и инженерных систем. Заказчик получает понятную комплектацию, смету и контроль этапов строительства.",
] as const;

export type HomeTurnkeyServiceTile = {
  id: string;
  label: string;
  href: string;
};

/** Порядок и подписи — как в ТЗ; URL — каноны сайта. */
export const HOME_TURNKEY_SERVICE_TILES: HomeTurnkeyServiceTile[] = [
  { id: "proektirovanie", label: "Проектирование", href: "/services/proektirovanie" },
  { id: "fundament", label: "Фундамент", href: "/services/fundament" },
  { id: "karkas", label: "Стены дома", href: "/services/karkas" },
  { id: "krovlya", label: "Кровля", href: "/services/krovlya" },
  { id: "inzheneriya", label: "Инженерные системы", href: "/services/inzheneriya" },
];
