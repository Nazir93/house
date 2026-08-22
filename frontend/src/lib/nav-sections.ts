/** Пункт меню: ссылка или открытие модалки */
export type NavLeaf =
  | { label: string; href: string }
  | { label: string; action: "openModal" | "openTourModal" };

/** Группа с подпунктами (напр. «Услуги» → прайс, документы…) */
export type NavGroup = { label: string; children: NavLeaf[] };

export type NavItem = NavLeaf | NavGroup;

export type NavSection = { label: string; items: NavItem[] };

export function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item && Array.isArray((item as NavGroup).children);
}

import { BUILT_HOMES_SECTION_LABEL, UNDER_CONSTRUCTION_SECTION_LABEL } from "@/lib/constants";
import { houseProjectsCatalogHubHref } from "@/lib/project-catalog-type-filter";

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Проекты",
    items: [
      { href: houseProjectsCatalogHubHref("author"), label: "Каталог авторских проектов" },
      { href: "/typical-projects", label: "Каталог типовых проектов" },
    ],
  },
  {
    label: BUILT_HOMES_SECTION_LABEL,
    items: [
      { href: "/portfolio", label: "Реализованные объекты" },
      { href: "/portfolio/under-construction", label: UNDER_CONSTRUCTION_SECTION_LABEL },
      { href: "/portfolio/map", label: "Карта объектов" },
      { action: "openTourModal", label: "Экскурсия на объекты" },
    ],
  },
  {
    label: "Услуги",
    items: [
      {
        label: "Строительство",
        children: [
          { href: "/services/proektirovanie", label: "Проектирование" },
          { href: "/services/fundament", label: "Фундамент под ключ" },
          { href: "/services/karkas", label: "Коробка дома" },
          { href: "/services/krovlya", label: "Монтаж кровли" },
          { href: "/services/inzheneriya", label: "Инженерные сети" },
          { href: "/services/otdelka", label: "Отделка под ключ" },
        ],
      },
      { href: "/individual-design", label: "Создать свой проект" },
      { action: "openModal", label: "Оставить заявку" },
    ],
  },
  {
    label: "О компании",
    items: [
      { href: "/about", label: "О нас" },
      { href: "/contacts", label: "Контакты" },
      { href: "/partners/vacancies", label: "Вакансии" },
      { href: "/reviews", label: "Отзывы" },
    ],
  },
  {
    label: "Ипотека",
    items: [
      { href: "/mortgage", label: "Ипотека на дом" },
      { action: "openModal", label: "Получить консультацию" },
    ],
  },
];
