import { describe, expect, it } from "vitest";

import {
  HOME_MATERIALS_SECTION_SUBTITLE,
  HOME_MATERIALS_SECTION_TITLE,
  HOME_MATERIAL_CARDS,
} from "@/lib/home-materials-section";

describe("home-materials-section", () => {
  it("заголовок и подзаголовок секции материалов на главной", () => {
    expect(HOME_MATERIALS_SECTION_TITLE).toBe("Из чего может быть построен ваш дом");
    expect(HOME_MATERIALS_SECTION_SUBTITLE).toContain("газобетона, керамблока и кирпича 2.1 НФ");
    expect(HOME_MATERIALS_SECTION_SUBTITLE).toContain("стартовой стоимости за м²");
  });

  it("три карточки материалов с уникальными описаниями", () => {
    expect(HOME_MATERIAL_CARDS).toHaveLength(3);
    expect(HOME_MATERIAL_CARDS.map((c) => c.id)).toEqual(["gazobeton", "keramoblok", "kirpich"]);
    expect(HOME_MATERIAL_CARDS[0]?.title).toBe("Дома из газобетона");
    expect(HOME_MATERIAL_CARDS[1]?.title).toBe("Дома из керамоблока");
    expect(HOME_MATERIAL_CARDS[2]?.title).toBe("Дома из кирпича 2.1 НФ");
    const descriptions = HOME_MATERIAL_CARDS.map((c) => c.description);
    expect(new Set(descriptions).size).toBe(3);
    expect(HOME_MATERIAL_CARDS[2]?.description).toContain("2.1 НФ");
  });
});
