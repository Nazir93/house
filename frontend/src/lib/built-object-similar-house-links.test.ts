import { describe, expect, it } from "vitest";

import {
  BUILT_OBJECT_SIMILAR_HOUSE_H2,
  builtObjectMaterialProjectsPath,
  builtObjectSimilarHouseLinks,
} from "@/lib/built-object-similar-house-links";

describe("built-object-similar-house-links (SEO §6)", () => {
  it("H2 как в ТЗ", () => {
    expect(BUILT_OBJECT_SIMILAR_HOUSE_H2).toBe("Хотите построить похожий дом?");
  });

  it("всегда: проекты + калькулятор; материал → /projects/{slug}, не stroitelstvo", () => {
    const gas = builtObjectSimilarHouseLinks("GAS_BLOCK");
    expect(gas.map((l) => l.href)).toEqual([
      "/projects",
      "/calculator",
      "/projects/gazobeton",
    ]);
    expect(gas.map((l) => l.label)).toEqual([
      "Похожие проекты",
      "Расчет стоимости",
      "Строительство домов из газобетона",
    ]);

    expect(builtObjectMaterialProjectsPath("BRICK")).toBe("/projects/kirpich");
    expect(builtObjectMaterialProjectsPath("CERAMIC_BLOCK")).toBe("/projects/keramoblok");
    expect(builtObjectMaterialProjectsPath("кирпич")).toBe("/projects/kirpich");

    for (const material of ["GAS_BLOCK", "BRICK", "CERAMIC_BLOCK"] as const) {
      for (const link of builtObjectSimilarHouseLinks(material)) {
        expect(link.href).not.toContain("stroitelstvo-domov-iz");
      }
    }
  });

  it("каркас / другое — только проекты и калькулятор", () => {
    expect(builtObjectSimilarHouseLinks("FRAME").map((l) => l.href)).toEqual([
      "/projects",
      "/calculator",
    ]);
    expect(builtObjectMaterialProjectsPath("OTHER")).toBeNull();
  });
});
