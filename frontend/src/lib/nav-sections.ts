/** Пункт меню: ссылка или открытие модалки */
export type NavLeaf =
  | { label: string; href: string }
  | { label: string; action: "openModal" };

/** Группа с подпунктами (напр. «Услуги» → прайс, документы…) */
export type NavGroup = { label: string; children: NavLeaf[] };

export type NavItem = NavLeaf | NavGroup;

export type NavSection = { label: string; items: NavItem[] };

export function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item && Array.isArray((item as NavGroup).children);
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Проекты",
    items: [
      { href: "/projects", label: "Каталог авторских проектов" },
      { href: "/typical-projects", label: "Каталог типовых проектов" },
    ],
  },
  {
    label: "Портфолио",
    items: [
      { href: "/portfolio", label: "Реализованные объекты" },
      { href: "/portfolio/map", label: "Карта объектов" },
      { href: "/contacts", label: "Экскурсия на объекты" },
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
