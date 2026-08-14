import { describe, expect, it } from "vitest";
import { SITE_NAME } from "@/lib/constants";
import { getCommercialPageSeo, getCommercialPageSeoSeeds } from "@/lib/seo/commercial-page-seo";

describe("commercial page SEO core", () => {
  it("home Title: один коммерческий интент, бренд в конце, без перечня материалов (SEO §1.1)", () => {
    const home = getCommercialPageSeo("home");

    expect(home.path).toBe("/");
    expect(home.title).toBe(
      `Строительство домов под ключ в СПб и Ленинградской области | ${SITE_NAME}`,
    );
    expect(home.title.toLowerCase()).toContain("строительство домов под ключ");
    expect(home.title).not.toMatch(/газобетон|кирпич|керамоблок|фундамент|проекты/i);
    expect(home.keywords).toEqual(expect.arrayContaining(["дом под ключ", "построить дом под ключ"]));
    expect(home.intro).not.toContain("рекламной статистике");
    expect(home.intro).toContain("под ключ");
  });

  it("home Description: частные дома, материалы, смета и расчёт (SEO §1.2)", () => {
    const home = getCommercialPageSeo("home");

    expect(home.description).toBe(
      "Строительство частных домов под ключ в Санкт-Петербурге и Ленинградской области. Газобетон, керамоблок и кирпич. Проектирование, фиксированная смета, строительство и инженерия. Рассчитайте стоимость дома.",
    );
    expect(home.description).toContain("Санкт-Петербурге и Ленинградской области");
    expect(home.description).toMatch(/газобетон/i);
    expect(home.description).toMatch(/керамоблок/i);
    expect(home.description).toMatch(/кирпич/i);
    expect(home.description).toContain("фиксированная смета");
    expect(home.description).toContain("Рассчитайте стоимость дома");
    // Title остаётся без перечня материалов — материалы только в description
    expect(home.title).not.toMatch(/газобетон|кирпич|керамоблок/i);
  });

  it("home H1: один коммерческий заголовок текстом (SEO §1.3)", () => {
    const home = getCommercialPageSeo("home");

    expect(home.h1).toBe(
      "Строительство домов под ключ в Санкт-Петербурге и Ленинградской области",
    );
    expect(home.h1).toContain("Санкт-Петербурге и Ленинградской области");
    expect(home.h1).not.toMatch(/газобетон|кирпич|керамоблок/i);
  });

  it("keeps calculator focused on cost and estimate intent", () => {
    const calculator = getCommercialPageSeo("calculator");

    expect(calculator.path).toBe("/calculator");
    expect(calculator.title).toContain("Калькулятор стоимости");
    expect(calculator.keywords).toEqual(
      expect.arrayContaining(["стоимость строительства дома", "сколько стоит построить дом", "смета строительства дома"]),
    );
  });

  it("creates unique PageMeta seeds for commercial pages", () => {
    const seeds = getCommercialPageSeoSeeds();
    const paths = seeds.map((seed) => seed.path);
    const home = getCommercialPageSeo("home");

    expect(paths).toEqual(expect.arrayContaining(["/", "/calculator"]));
    expect(new Set(paths).size).toBe(paths.length);
    expect(seeds.find((s) => s.path === "/")?.title).toBe(home.title);
    expect(seeds.find((s) => s.path === "/")?.description).toBe(home.description);
  });
});
