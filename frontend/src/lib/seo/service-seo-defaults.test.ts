import { describe, expect, it } from "vitest";
import {
  getKnownServiceSeoSlugs,
  getServicePageMetaSeeds,
  getServiceSeoBySlug,
  getServicesIndexSeo,
  resolveServicesIndexH1,
  resolveServicesIndexIntro,
} from "@/lib/seo/service-seo-defaults";

describe("service SEO semantic defaults", () => {
  it("keeps every core service landing in the semantic core", () => {
    expect(getKnownServiceSeoSlugs().sort()).toEqual(
      ["fundament", "inzheneriya", "karkas", "krovlya", "otdelka", "proektirovanie"].sort()
    );
  });

  it("returns commercially focused metadata for known service slugs", () => {
    const seo = getServiceSeoBySlug("fundament");

    expect(seo?.title).toContain("Фундамент под ключ");
    expect(seo?.description).toContain("Фундамент для загородного дома");
    expect(seo?.keywords).toEqual(
      expect.arrayContaining(["фундамент для дома", "строительство фундамента"]),
    );
  });

  it("seeds the services index and each known service page without overwriting admin edits later", () => {
    const seeds = getServicePageMetaSeeds();
    const paths = seeds.map((row) => row.path);

    expect(paths).toContain("/services");
    expect(paths).toContain("/services/proektirovanie");
    expect(paths).toContain("/services/fundament");
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("H1 /services — загородные дома; старый шаблон с городом заменяется", () => {
    const expected = "УСЛУГИ — ПРОЕКТИРОВАНИЕ И СТРОИТЕЛЬСТВО ЗАГОРОДНЫХ ДОМОВ";
    expect(getServicesIndexSeo().h1).toBe(expected);
    expect(resolveServicesIndexH1(null)).toBe(expected);
    expect(resolveServicesIndexH1("Услуги — проектирование и строительство в Санкт-Петербург")).toBe(
      expected,
    );
    expect(resolveServicesIndexH1("Свой заголовок из админки")).toBe("Свой заголовок из админки");
  });

  it("intro /services — единая система; старое geo-описание заменяется", () => {
    expect(resolveServicesIndexIntro(null)).toContain("единая система");
    expect(
      resolveServicesIndexIntro(
        "Проектирование, фундамент, кровля, инженерные сети и отделка под ключ для загородных домов. Офис в Санкт-Петербург, проекты в Ленинградская область, Санкт-Петербург.",
      ),
    ).toContain("комплексное строительство загородных домов");
    expect(resolveServicesIndexIntro("Свой текст из админки")).toBe("Свой текст из админки");
  });
});
