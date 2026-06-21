import { describe, expect, it } from "vitest";
import { getCommercialPageSeo, getCommercialPageSeoSeeds } from "@/lib/seo/commercial-page-seo";

describe("commercial page SEO core", () => {
  it("keeps home focused on дом под ключ and regional construction", () => {
    const home = getCommercialPageSeo("home");

    expect(home.path).toBe("/");
    expect(home.title).toContain("строительство домов под ключ");
    expect(home.keywords).toEqual(expect.arrayContaining(["дом под ключ", "построить дом под ключ"]));
  });

  it("keeps calculator focused on cost and estimate intent", () => {
    const calculator = getCommercialPageSeo("calculator");

    expect(calculator.path).toBe("/calculator");
    expect(calculator.title).toContain("Калькулятор стоимости");
    expect(calculator.keywords).toEqual(
      expect.arrayContaining(["стоимость строительства дома", "сколько стоит построить дом", "смета строительства дома"])
    );
  });

  it("creates unique PageMeta seeds for commercial pages", () => {
    const seeds = getCommercialPageSeoSeeds();
    const paths = seeds.map((seed) => seed.path);

    expect(paths).toEqual(expect.arrayContaining(["/", "/calculator"]));
    expect(new Set(paths).size).toBe(paths.length);
  });
});
