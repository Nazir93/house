import { describe, expect, it } from "vitest";
import { buildPublicCatalog } from "@/lib/calculator-catalog";
import { DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG } from "@/lib/house-project-calculator-config";
import {
  CALCULATOR_OPTION_CATALOG_META,
  isCalculatorOptionDiagramUrl,
  isLegacyOptionPlaceholderImage,
  resolveOptionDisplayDescription,
  resolveOptionDisplayImageUrl,
} from "@/lib/project-calculator-option-images";

describe("project-calculator-option-images", () => {
  it("подставляет схему вместо заглушки banner-hero", () => {
    expect(
      resolveOptionDisplayImageUrl({
        slug: "electric",
        groupSlug: "engineering",
        imageUrl: "/images/banner/banner-hero-03.png",
      }),
    ).toBe(CALCULATOR_OPTION_CATALOG_META.electric.imageUrl);
  });

  it("сохраняет кастомный imageUrl из админки", () => {
    expect(
      resolveOptionDisplayImageUrl({
        slug: "electric",
        groupSlug: "engineering",
        imageUrl: "/uploads/custom-electric.png",
      }),
    ).toBe("/uploads/custom-electric.png");
  });

  it("возвращает описание по slug", () => {
    expect(
      resolveOptionDisplayDescription({
        slug: "heatedFloor",
        groupSlug: "engineering",
      }),
    ).toContain("тёплый пол");
  });

  it("кастомное описание имеет приоритет над дефолтом", () => {
    expect(
      resolveOptionDisplayDescription({
        slug: "heatedFloor",
        groupSlug: "engineering",
        description: "Своё описание",
      }),
    ).toBe("Своё описание");
  });

  it("определяет схемы из /images/calculator/", () => {
    expect(isCalculatorOptionDiagramUrl("/images/calculator/options/electric.png")).toBe(true);
    expect(isCalculatorOptionDiagramUrl("/uploads/electric.png")).toBe(false);
  });

  it("распознаёт legacy-заглушки", () => {
    expect(isLegacyOptionPlaceholderImage("/images/banner/banner-hero-02.png")).toBe(true);
    expect(isLegacyOptionPlaceholderImage(null)).toBe(true);
    expect(isLegacyOptionPlaceholderImage("/images/calculator/options/bio.png")).toBe(false);
  });

  it("все 18 опций калькулятора имеют схему и описание", () => {
    const engineeringSlugs = Object.keys(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.engineering);
    const constructionSlugs = Object.keys(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction);

    for (const slug of [...engineeringSlugs, ...constructionSlugs]) {
      const meta = CALCULATOR_OPTION_CATALOG_META[slug];
      expect(meta?.imageUrl, slug).toMatch(/^\/images\/calculator\/options\/.+\.png$/);
      expect(meta?.description?.trim(), slug).toBeTruthy();
    }
  });

  it("buildPublicCatalog отдаёт схемы опций без цен", () => {
    const cat = buildPublicCatalog(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG, "a");
    const electric = cat.engineering.find((o) => o.slug === "electric");
    const plaster = cat.construction.find((o) => o.slug === "interior_plaster");

    expect(electric).toMatchObject({
      description: CALCULATOR_OPTION_CATALOG_META.electric.description,
      imageUrl: CALCULATOR_OPTION_CATALOG_META.electric.imageUrl,
    });
    expect(plaster).toMatchObject({
      description: CALCULATOR_OPTION_CATALOG_META.interior_plaster.description,
      imageUrl: CALCULATOR_OPTION_CATALOG_META.interior_plaster.imageUrl,
    });
  });
});
