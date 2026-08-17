import { describe, expect, it } from "vitest";

import {
  HOME_MATERIALS_SECTION_SUBTITLE,
  HOME_MATERIALS_SECTION_TITLE,
  HOME_MATERIAL_CARDS,
  homeMaterialSeoPath,
} from "@/lib/home-materials-section";

describe("home-materials-section", () => {
  it("заголовок и подзаголовок секции материалов на главной", () => {
    expect(HOME_MATERIALS_SECTION_TITLE).toBe("Из чего может быть построен ваш дом");
    expect(HOME_MATERIALS_SECTION_SUBTITLE).toContain("газобетона, керамблока и кирпича 2.1 НФ");
    expect(HOME_MATERIALS_SECTION_SUBTITLE).toContain("стартовой стоимости за м²");
  });

  it("три карточки: SEO-пути на /projects/{материал}; проекты и комплектация — якоря посадочной", () => {
    expect(HOME_MATERIAL_CARDS).toHaveLength(3);
    expect(HOME_MATERIAL_CARDS.map((c) => c.id)).toEqual(["gazobeton", "keramoblok", "kirpich"]);
    expect(HOME_MATERIAL_CARDS.map((c) => c.seoPath)).toEqual([
      "/projects/gazobeton",
      "/projects/keramoblok",
      "/projects/kirpich",
    ]);
    expect(HOME_MATERIAL_CARDS.map((c) => c.projectsHref)).toEqual([
      "/projects/gazobeton#material-projects",
      "/projects/keramoblok#material-projects",
      "/projects/kirpich#material-projects",
    ]);
    expect(HOME_MATERIAL_CARDS.map((c) => c.completionHref)).toEqual([
      "/projects/gazobeton#material-included",
      "/projects/keramoblok#material-included",
      "/projects/kirpich#material-included",
    ]);
    for (const card of HOME_MATERIAL_CARDS) {
      expect(card.seoPath).not.toContain("?");
      expect(card.seoPath).not.toContain("stroitelstvo-domov-iz");
      expect(homeMaterialSeoPath(card.id)).toBe(card.seoPath);
    }
  });

  it("карточки с уникальными описаниями и названиями из ТЗ", () => {
    expect(HOME_MATERIAL_CARDS[0]?.title).toBe("Дом из газобетона");
    expect(HOME_MATERIAL_CARDS[1]?.title).toBe("Дом из керамического блока");
    expect(HOME_MATERIAL_CARDS[2]?.title).toBe("Кирпичный дом");
    const descriptions = HOME_MATERIAL_CARDS.map((c) => c.description);
    expect(new Set(descriptions).size).toBe(3);
    expect(HOME_MATERIAL_CARDS[2]?.description).toContain("2.1 НФ");
  });
});
