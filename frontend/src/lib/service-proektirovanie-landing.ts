import type { ServiceLandingDocument, StoryTimelineItem } from "@/lib/service-landing-schema";

/** Заглушки блоков timeline — тексты замените в админке или пришлите нам. */
export const PROEKTROVANIE_TIMELINE_PLACEHOLDERS: StoryTimelineItem[] = [
  {
    id: "typical",
    side: "left",
    eyebrow: "Раздел 01",
    title: "Типовые проекты",
    body: "Здесь будет описание каталога типовых домов, сроков и комплектации. Текст добавите позже.",
    imageUrl: "/images/banner/banner-hero-02.png",
    href: "/projects",
  },
  {
    id: "individual",
    side: "right",
    eyebrow: "Раздел 02",
    title: "Индивидуальное проектирование",
    body: "Здесь будет блок про адаптацию проекта под участок и задачи семьи.",
    imageUrl: "/images/banner/banner-hero-03.png",
    href: "/individual-design",
  },
  {
    id: "docs",
    side: "left",
    eyebrow: "Раздел 03",
    title: "Документация и смета",
    body: "Здесь будет описание рабочей документации, согласований и прозрачной сметной логики.",
    imageUrl: "/images/banner/banner-hero-04.png",
  },
  {
    id: "team",
    side: "right",
    eyebrow: "Раздел 04",
    title: "Команда проектировщиков",
    body: "Здесь будет блок про инженерный подход, геологию и контроль решений на всех этапах.",
    imageUrl: "/images/banner/banner-hero-05.png",
  },
];

/** Подключает cinematic hero + scroll timeline для /services/proektirovanie. */
export function enrichProektirovanieLandingDocument(
  slug: string,
  document: ServiceLandingDocument
): ServiceLandingDocument {
  if (slug !== "proektirovanie") return document;

  const hasTimeline = document.sections.some((s) => s.type === "storyTimeline");
  const heroSection = document.sections.find((s) => s.type === "hero" || s.type === "heroCinematic");
  const rest = document.sections.filter(
    (s) => s.type !== "hero" && s.type !== "heroCinematic" && s.type !== "storyTimeline"
  );

  const cinematic =
    heroSection?.type === "heroCinematic"
      ? heroSection
      : heroSection?.type === "hero"
        ? {
            type: "heroCinematic" as const,
            title: heroSection.title,
            subtitle: heroSection.subtitle,
            serviceKey: heroSection.serviceKey,
            tag: heroSection.tag,
            features: heroSection.features,
            goals: heroSection.goals,
            bannerImageDesktop: heroSection.bannerImageDesktop,
            bannerImageMobile: heroSection.bannerImageMobile,
          }
        : null;

  const timelineSection = document.sections.find((s) => s.type === "storyTimeline");

  return {
    sections: [
      ...(cinematic ? [cinematic] : []),
      timelineSection ?? { type: "storyTimeline" as const, items: PROEKTROVANIE_TIMELINE_PLACEHOLDERS },
      ...rest,
    ],
  };
}
