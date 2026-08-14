/**
 * Первый экран главной (ТЗ SEO §2): короткий lead под H1 + CTA.
 * Без длинного SEO-текста в hero.
 */

export const HOME_HERO_SEO_LEAD =
  "Проектируем и строим каменные частные дома для постоянного проживания. Газобетон, керамический блок и кирпич. Работаем в Санкт-Петербурге и Ленинградской области.";

export type HomeHeroCta =
  | {
      id: "estimate";
      label: string;
      action: "estimate";
      /** Основная кнопка */
      primary: true;
    }
  | {
      id: "projects";
      label: string;
      href: "/projects";
      primary: true;
    }
  | {
      id: "visit";
      label: string;
      href: "/portfolio/under-construction";
      primary: false;
    };

/** Порядок: две основные → дополнительная (экскурсия на строящийся объект). */
export const HOME_HERO_CTAS: HomeHeroCta[] = [
  {
    id: "estimate",
    label: "Рассчитать стоимость дома",
    action: "estimate",
    primary: true,
  },
  {
    id: "projects",
    label: "Выбрать проект",
    href: "/projects",
    primary: true,
  },
  {
    id: "visit",
    label: "Посетить строящийся объект",
    href: "/portfolio/under-construction",
    primary: false,
  },
];

/** Lead под H1: SEO-текст имеет приоритет над subheadline баннера. */
export function resolveHomeHeroLead(
  seoLead: string | null | undefined,
  bannerSubheadline: string,
): string {
  const fromSeo = (seoLead ?? "").replace(/\s+/g, " ").trim();
  if (fromSeo) return fromSeo;
  return bannerSubheadline.replace(/\s+/g, " ").trim();
}
