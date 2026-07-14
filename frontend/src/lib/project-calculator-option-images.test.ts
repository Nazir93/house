import { describe, expect, it } from "vitest";
import { buildPublicCatalog } from "@/lib/calculator-catalog";
import { DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG } from "@/lib/house-project-calculator-config";
import {
  CALCULATOR_OPTION_CATALOG_META,
  isCalculatorOptionDiagramUrl,
  isLegacyOptionPlaceholderImage,
  preferOptimizedOptionDiagramUrl,
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
    ).toContain("тёплого пола");
  });

  it("электроснабжение: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.electric.description;
    expect(description).toContain("ВВГнг(А)-LS");
    expect(description).toContain("подрозетников");
    expect(description).toContain("УЗО");
    expect(description.split("\n")).toHaveLength(8);
  });

  it("разводка воды: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.water.description;
    expect(description).toContain("полипропиленовые трубы");
    expect(description).toContain("Коллекторная система");
    expect(description).toContain("Опрессовка");
    expect(description.split("\n")).toHaveLength(11);
  });

  it("канализация: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.sewer.description;
    expect(description).toContain("110 мм и 50 мм");
    expect(description).toContain("нормативных уклонов");
    expect(description).toContain("гильзы вывода");
    expect(description.split("\n")).toHaveLength(8);
  });

  it("станция биоочистки: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.bio.description;
    expect(description).toContain("до 98%");
    expect(description).toContain("около 1 м²");
    expect(description).toContain("полей фильтрации");
    expect(description.split("\n")).toHaveLength(8);
  });

  it("радиаторы: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.radiators.description;
    expect(description).toContain("Биметаллические радиаторы");
    expect(description).toContain("антифризом");
    expect(description).toContain("опрессовка");
    expect(description.split("\n")).toHaveLength(9);
  });

  it("тёплый пол: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.heatedFloor.description;
    expect(description).toContain("PEX-a Ø16");
    expect(description).toContain("XPS");
    expect(description).toContain("Насосно-смесительный узел");
    expect(description.split("\n")).toHaveLength(11);
  });

  it("котельная: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.boiler.description;
    expect(description).toContain("Бойлер нагрева");
    expect(description).toContain("Группа безопасности котла");
    expect(description).toContain("погодозависимого регулирования");
    expect(description.split("\n")).toHaveLength(14);
  });

  it("облицовка фасада кирпичом: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.brick.description;
    expect(description).toContain("½ кирпича");
    expect(description).toContain("вентиляционного зазора");
    expect(description).toContain("Гибкие связи");
    expect(description.split("\n")).toHaveLength(9);
  });

  it("мокрый фасад с утеплением: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.plaster.description;
    expect(description).toContain("XPS");
    expect(description).toContain("Короед");
    expect(description).toContain("стеклосеткой");
    expect(description.split("\n")).toHaveLength(9);
  });

  it("фасадные термопанели: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.thermo.description;
    expect(description).toContain("ППС");
    expect(description).toContain("клинкерная плитка");
    expect(description).toContain("ЭППС");
    expect(description.split("\n")).toHaveLength(7);
  });

  it("облицовка кирпичом с утеплением: состав работ по пунктам", () => {
    const description = CALCULATOR_OPTION_CATALOG_META.brick_insulated.description;
    expect(description).toContain("каменной ваты");
    expect(description).toContain("½ кирпича");
    expect(description).toContain("перемычек");
    expect(description.split("\n")).toHaveLength(10);
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
    expect(isCalculatorOptionDiagramUrl("/images/calculator/options/electric.webp")).toBe(true);
    expect(isCalculatorOptionDiagramUrl("/uploads/electric.png")).toBe(false);
  });

  it("заменяет тяжёлый PNG схем опций на WebP", () => {
    expect(preferOptimizedOptionDiagramUrl("/images/calculator/options/heated-floor.png")).toBe(
      "/images/calculator/options/heated-floor.webp",
    );
    expect(
      resolveOptionDisplayImageUrl({
        slug: "electric",
        groupSlug: "engineering",
        imageUrl: "/images/calculator/options/electric.png",
      }),
    ).toBe("/images/calculator/options/electric.webp");
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
      expect(meta?.imageUrl, slug).toMatch(/^\/images\/calculator\/options\/.+\.webp$/);
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
