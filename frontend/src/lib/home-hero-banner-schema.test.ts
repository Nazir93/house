import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOME_HERO_BANNER,
  homeHeroBannerSchema,
  parseHomeHeroBanner,
} from "@/lib/home-hero-banner-schema";

describe("home-hero-banner-schema", () => {
  it("дефолт: заголовок, фоны день/ночь и промо-слайды", () => {
    expect(DEFAULT_HOME_HERO_BANNER.headlineLines).toEqual([
      "Строим дома,",
      "в которые хочется",
      "возвращаться",
    ]);
    expect(DEFAULT_HOME_HERO_BANNER.backgrounds.light).toContain("hero-theme-day");
    expect(DEFAULT_HOME_HERO_BANNER.backgrounds.dark).toContain("hero-theme-night");
    expect(DEFAULT_HOME_HERO_BANNER.promos.length).toBeGreaterThanOrEqual(1);
  });

  it("parseHomeHeroBanner: валидный JSON", () => {
    const custom = {
      backgrounds: { light: "/uploads/day.webp", dark: "/uploads/night.webp" },
      promos: [
        {
          id: "a",
          label: "Акция",
          title: "Тест",
          caption: "",
          image: "/uploads/promo.webp",
          href: "/promo",
        },
      ],
    };
    expect(parseHomeHeroBanner(custom).backgrounds.light).toBe("/uploads/day.webp");
    expect(parseHomeHeroBanner(custom).promos).toHaveLength(1);
  });

  it("parseHomeHeroBanner: битый JSON → дефолт", () => {
    expect(parseHomeHeroBanner(null)).toEqual(DEFAULT_HOME_HERO_BANNER);
    expect(parseHomeHeroBanner({ promos: [] })).toEqual(DEFAULT_HOME_HERO_BANNER);
  });

  it("parseHomeHeroBanner: старые данные без headlineLines → дефолтный заголовок", () => {
    const legacy = {
      backgrounds: { light: "/uploads/day.webp", dark: "/uploads/night.webp" },
      promos: DEFAULT_HOME_HERO_BANNER.promos.slice(0, 1),
    };
    const parsed = parseHomeHeroBanner(legacy);
    expect(parsed.backgrounds.light).toBe("/uploads/day.webp");
    expect(parsed.headlineLines).toEqual(DEFAULT_HOME_HERO_BANNER.headlineLines);
  });

  it("homeHeroBannerSchema: не меньше одного промо", () => {
    const r = homeHeroBannerSchema.safeParse({
      backgrounds: DEFAULT_HOME_HERO_BANNER.backgrounds,
      promos: [],
    });
    expect(r.success).toBe(false);
  });
});
