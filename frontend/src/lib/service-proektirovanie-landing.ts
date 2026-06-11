import type { ServiceLandingDocument, StoryTimelineItem } from "@/lib/service-landing-schema";

export const PROEKTROVANIE_HERO_BANNER = "/images/banner/proektirovanie-hero-v2.png";
export const PROEKTROVANIE_HERO_FALLBACK_BANNER = "/proektirovanie/hero.png";

export const PROEKTROVANIE_HERO_TITLE = "Индивидуальное проектирование домов";

export const PROEKTROVANIE_HERO_SUBTITLE =
  "Мы создаем авторские проекты домов, которые воплощают ваши мечты в жизнь. Наша команда архитекторов работает над каждым проектом с учетом ваших пожеланий, особенностей участка и современных строительных технологий";

/** Этапы проектирования на /services/proektirovanie. */
export const PROEKTROVANIE_TIMELINE_ITEMS: StoryTimelineItem[] = [
  {
    id: "contract",
    side: "left",
    eyebrow: "Этап 01",
    title: "Подписание договора",
    body: "Фиксирование сроков проектирования и стоимости проекта.",
    imageUrl: "/proektirovanie/step-contract.png",
  },
  {
    id: "tech-spec",
    side: "right",
    eyebrow: "Этап 02",
    title: "Техническое задание",
    body:
      "Мы тщательно изучаем предоставленные материалы: геологические изыскания и топографическую съемку, схемы инженерных коммуникаций, градостроительные ограничения и особенности землепользования, фотофиксацию территории. На основании этих данных мы разработаем детализированное техническое задание, которое станет надежной основой для будущего проекта.",
    imageUrl: "/proektirovanie/step-brief.png",
  },
  {
    id: "design",
    side: "left",
    eyebrow: "Этап 03",
    title: "Разработка проекта",
    body:
      "Мы разрабатываем оптимальную архитектурную концепцию дома с учетом ваших пожеланий и особенностей участка, направленную на создание комфортного и функционального пространства.",
    imageUrl: "/proektirovanie/step-development.png",
  },
  {
    id: "documentation",
    side: "right",
    eyebrow: "Этап 04",
    title: "Подготовка документации",
    body:
      "По окончании проектирования мы предоставляем подробный сметный расчет проекта и рабочую документацию в печатном и электронном виде.",
    imageUrl: "/proektirovanie/step-development.png",
  },
];

/** @deprecated alias */
export const PROEKTROVANIE_TIMELINE_PLACEHOLDERS = PROEKTROVANIE_TIMELINE_ITEMS;

function resolveProektirovanieHeroBanner(url: string | undefined): string {
  if (!url || url === PROEKTROVANIE_HERO_BANNER) return PROEKTROVANIE_HERO_FALLBACK_BANNER;
  return url;
}

/** Подключает cinematic hero + scroll timeline для /services/proektirovanie. */
export function enrichProektirovanieLandingDocument(
  slug: string,
  document: ServiceLandingDocument
): ServiceLandingDocument {
  if (slug !== "proektirovanie") return document;

  const heroSection = document.sections.find((s) => s.type === "hero" || s.type === "heroCinematic");
  const rest = document.sections.filter(
    (s) =>
      s.type !== "hero" &&
      s.type !== "heroCinematic" &&
      s.type !== "storyTimeline" &&
      s.type !== "designCalculator" &&
      s.type !== "projectTemplateViewer" &&
      s.type !== "faq"
  );

  const heroBanner = heroSection
    ? resolveProektirovanieHeroBanner(heroSection.bannerImageDesktop)
    : PROEKTROVANIE_HERO_FALLBACK_BANNER;

  const cinematic =
    heroSection?.type === "heroCinematic"
      ? {
          ...heroSection,
          title: PROEKTROVANIE_HERO_TITLE,
          subtitle: PROEKTROVANIE_HERO_SUBTITLE,
          bannerImageDesktop: heroBanner,
          bannerImageMobile: heroBanner,
        }
      : heroSection?.type === "hero"
        ? {
            type: "heroCinematic" as const,
            title: PROEKTROVANIE_HERO_TITLE,
            subtitle: PROEKTROVANIE_HERO_SUBTITLE,
            serviceKey: heroSection.serviceKey,
            tag: heroSection.tag,
            features: heroSection.features,
            goals: heroSection.goals,
            bannerImageDesktop: heroBanner,
            bannerImageMobile: heroBanner,
          }
        : {
            type: "heroCinematic" as const,
            title: PROEKTROVANIE_HERO_TITLE,
            subtitle: PROEKTROVANIE_HERO_SUBTITLE,
            bannerImageDesktop: heroBanner,
            bannerImageMobile: heroBanner,
          };


  return {
    sections: [
      cinematic,
      { type: "designCalculator" as const },
      { type: "storyTimeline" as const, items: PROEKTROVANIE_TIMELINE_ITEMS },
      { type: "projectTemplateViewer" as const },
      ...rest,
    ],
  };
}
