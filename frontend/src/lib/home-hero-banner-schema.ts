import { z } from "zod";

/** Промо-слайд в карусели главного баннера */
export const homeHeroPromoSlideSchema = z.object({
  id: z.string().min(1).max(48),
  label: z.string().min(1).max(80),
  title: z.string().min(1).max(140),
  caption: z.string().max(600).default(""),
  image: z.string().min(1).max(500),
  href: z.string().min(1).max(500),
});

export type HomeHeroPromoSlide = z.infer<typeof homeHeroPromoSlideSchema>;

export const homeHeroBannerSchema = z.object({
  /** Строки главного заголовка на баннере (каждая — отдельная строка в h1) */
  headlineLines: z
    .array(z.string().min(1).max(120))
    .min(1)
    .max(5)
    .default(["Строим дома,", "в которые хочется", "возвращаться"]),
  backgrounds: z.object({
    /** Светлая тема сайта */
    light: z.string().min(1).max(500),
    /** Тёмная тема сайта */
    dark: z.string().min(1).max(500),
  }),
  promos: z.array(homeHeroPromoSlideSchema).min(1).max(20),
});

export type HomeHeroBanner = z.infer<typeof homeHeroBannerSchema>;

export const DEFAULT_HOME_HERO_BANNER: HomeHeroBanner = {
  headlineLines: ["Строим дома,", "в которые хочется", "возвращаться"],
  backgrounds: {
    light: "/images/banner/hero-theme-day.png",
    dark: "/images/banner/hero-theme-night.png",
  },
  promos: [
    {
      id: "promo-01",
      label: "Сумерки",
      title: "Дом среди деревьев",
      caption: "Подсветка, панорамные окна и уют террасы в сумерках.",
      image: "/images/banner/banner-hero-01.png",
      href: "/projects",
    },
    {
      id: "promo-02",
      label: "Современный фасад",
      title: "Строгие линии и свет",
      caption: "Крупное остекление, дорожки и ландшафт в единой стилистике.",
      image: "/images/banner/banner-hero-02.png",
      href: "/projects",
    },
    {
      id: "promo-03",
      label: "Участок и дом",
      title: "Продуманный облик",
      caption: "",
      image: "/images/banner/banner-hero-03.png",
      href: "/projects",
    },
    {
      id: "promo-04",
      label: "Тёплые материалы",
      title: "Дерево и камень",
      caption: "Контраст фактур и мягкая подсветка фасада в пасмурный день.",
      image: "/images/banner/banner-hero-04.png",
      href: "/projects",
    },
    {
      id: "promo-05",
      label: "Вечер на участке",
      title: "Свет из окон и терраса",
      caption: "Планировка в форме «Г», зона отдыха и природный антураж.",
      image: "/images/banner/banner-hero-05.png",
      href: "/projects",
    },
    {
      id: "promo-06",
      label: "Бассейн и лаунж",
      title: "Загородная жизнь",
      caption: "Вода у дома, зона отдыха и аккуратный ландшафт до лесной кромки.",
      image: "/images/banner/banner-hero-06.png",
      href: "/projects",
    },
  ],
};

export function parseHomeHeroBanner(raw: unknown): HomeHeroBanner {
  const parsed = homeHeroBannerSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  if (raw && typeof raw === "object") {
    const merged = homeHeroBannerSchema.safeParse({
      ...DEFAULT_HOME_HERO_BANNER,
      ...(raw as Record<string, unknown>),
      backgrounds: {
        ...DEFAULT_HOME_HERO_BANNER.backgrounds,
        ...((raw as { backgrounds?: unknown }).backgrounds as object | undefined),
      },
    });
    if (merged.success) return merged.data;
  }
  return DEFAULT_HOME_HERO_BANNER;
}

export function createEmptyHomeHeroPromo(idSuffix: string): HomeHeroPromoSlide {
  return {
    id: `promo_${idSuffix}`,
    label: "Акция",
    title: "Заголовок промо",
    caption: "",
    image: "/images/banner/banner-hero-01.png",
    href: "/projects",
  };
}
