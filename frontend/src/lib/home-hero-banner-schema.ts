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

export const homeHeroStepSchema = z.object({
  num: z.string().regex(/^\d{2}$/),
  text: z.string().min(1).max(80),
});

export type HomeHeroStep = z.infer<typeof homeHeroStepSchema>;

export const DEFAULT_HOME_HERO_SUBHEADLINE =
  "От идеи до готового дома: продуманная архитектура, понятная смета, последовательный процесс и внимание к качеству на каждом этапе.";

export const DEFAULT_HOME_HERO_STEPS: HomeHeroStep[] = [
  { num: "01", text: "Проектируем дом" },
  { num: "02", text: "Фиксируем смету" },
  { num: "03", text: "Строим по этапам" },
];

export const DEFAULT_HOME_HERO_BADGES = [
  "10+ лет опыта команды",
  "85+ построенных домов",
  "25 лет гарантии",
  "Контроль качества на каждом этапе",
] as const;

export const homeHeroBannerSchema = z.object({
  /** Строки главного заголовка на баннере (каждая — отдельная строка в h1) */
  headlineLines: z
    .array(z.string().min(1).max(120))
    .min(1)
    .max(5)
    .default(["Строим дома,", "в которые хочется", "возвращаться"]),
  /** Текст под заголовком слева на баннере */
  subheadline: z.string().min(1).max(400).default(DEFAULT_HOME_HERO_SUBHEADLINE),
  /** Три шага под кнопками */
  steps: z.array(homeHeroStepSchema).length(3).default(DEFAULT_HOME_HERO_STEPS),
  /** Четыре преимущества в нижней полосе баннера */
  badges: z
    .array(z.string().min(1).max(120))
    .length(4)
    .default([...DEFAULT_HOME_HERO_BADGES]),
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
  subheadline: DEFAULT_HOME_HERO_SUBHEADLINE,
  steps: DEFAULT_HOME_HERO_STEPS,
  badges: [...DEFAULT_HOME_HERO_BADGES],
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
