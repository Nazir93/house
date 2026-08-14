import { describe, expect, it } from "vitest";

import { SITE_NAME } from "@/lib/constants";
import {
  AUTHOR_PROJECTS_AFTER_CATALOG_H2,
  AUTHOR_PROJECTS_AFTER_CATALOG_LINKS,
  authorProjectsAfterCatalogCharCount,
  authorProjectsAfterCatalogPlainText,
  getAuthorProjectsCatalogSeo,
} from "@/lib/seo/project-catalog-hub-seo";

describe("project-catalog-hub-seo (SEO §7 /projects)", () => {
  it("Title / Description / H1 / intro под запрос «авторские проекты домов»", () => {
    const seo = getAuthorProjectsCatalogSeo();
    expect(seo.path).toBe("/projects");
    expect(seo.title).toBe(
      `Авторские проекты домов — каталог с ценами и планировками | ${SITE_NAME}`,
    );
    expect(seo.description).toContain("авторских проектов частных домов");
    expect(seo.description).toContain("газобетона, керамоблока и кирпича");
    expect(seo.description).toContain("Санкт-Петербурга и Ленинградской области");
    expect(seo.h1).toBe("Авторские проекты домов");
    expect(seo.intro).toContain("планировками, площадями и расчетом стоимости");
    expect(seo.intro).toContain("адаптировать под участок");
    expect(seo.keywords).toContain("авторские проекты домов");
  });
});

describe("project-catalog-hub-seo after catalog (SEO §8)", () => {
  it("H2 и объём 1500–2500 знаков без простыни ключей", () => {
    expect(AUTHOR_PROJECTS_AFTER_CATALOG_H2).toBe(
      "Проекты домов для строительства в СПб и Ленинградской области",
    );
    const chars = authorProjectsAfterCatalogCharCount();
    expect(chars).toBeGreaterThanOrEqual(1500);
    expect(chars).toBeLessThanOrEqual(2500);

    const text = authorProjectsAfterCatalogPlainText();
    expect(text).toMatch(/площад/i);
    expect(text).toMatch(/этаж/i);
    expect(text).toMatch(/газобетон/i);
    expect(text).toMatch(/керамоблок/i);
    expect(text).toMatch(/кирпич/i);
    expect(text).toMatch(/адаптир/i);
    expect(text).toMatch(/участк/i);
    expect(text).toMatch(/строительств/i);
  });

  it("перелинковка на материалы, калькулятор, портфолио и проектирование", () => {
    expect(AUTHOR_PROJECTS_AFTER_CATALOG_LINKS.map((l) => l.href)).toEqual([
      "/projects/gazobeton",
      "/projects/keramoblok",
      "/projects/kirpich",
      "/calculator",
      "/portfolio",
      "/services/proektirovanie",
    ]);
  });
});
