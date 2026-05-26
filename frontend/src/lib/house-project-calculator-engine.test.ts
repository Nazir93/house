import { describe, expect, it } from "vitest";
import {
  computeFacadeTotalRub,
  computeHouseProjectQuote,
  computeShellTotalRub,
  deriveMetrics,
  resolveHouseCalculatorCategory,
} from "./house-project-calculator-engine";
import { DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG } from "./house-project-calculator-config";
import { finalizeProjectQuote } from "./house-project-calculator-quote";

const C = DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG;

/** ТЗ §8–12: категория a, дом 120 м², газобетон */
describe("house-project-calculator-engine (TZ)", () => {
  it("§5 roof_area = building_area × roof_coef (кат. a, 120 м²)", () => {
    const m = deriveMetrics(120, C.categories.a.coefficients, C.settings.blindAreaWidthM);
    expect(m.roofArea).toBeCloseTo(120 * 1.3, 5);
  });

  it("§6 facade_area = building_area × facade_coef (кат. d, 130 м²)", () => {
    const m = deriveMetrics(130, C.categories.d.coefficients, C.settings.blindAreaWidthM);
    expect(m.facadeArea).toBeCloseTo(130 * 1.85, 5);
  });

  it("§7 perimeter = building_area × perimeter_coef (кат. a, 120 м²)", () => {
    const m = deriveMetrics(120, C.categories.a.coefficients, C.settings.blindAreaWidthM);
    expect(m.perimeter).toBeCloseTo(120 * 0.42, 5);
  });

  it("§8 коробка: area × price; <100 м² ×1.15", () => {
    const cat = C.categories.a;
    const normal = computeShellTotalRub({
      buildingArea: 120,
      category: cat,
      wallMaterial: "gas",
      smallAreaThresholdM2: 100,
      smallAreaSurcharge: 0.15,
    });
    expect(normal).toBe(Math.round(120 * 65_825));

    const small = computeShellTotalRub({
      buildingArea: 90,
      category: cat,
      wallMaterial: "gas",
      smallAreaThresholdM2: 100,
      smallAreaSurcharge: 0.15,
    });
    expect(small).toBe(Math.round(90 * 65_825 * 1.15));
  });

  it("§9 фасад: facade_area × price (кат. a, 130 м², штукатурка)", () => {
    const total = computeFacadeTotalRub({
      buildingArea: 130,
      category: C.categories.a,
      facadeVariant: "plaster",
      facadePricePerM2: C.facades.plaster.pricePerM2,
    });
    expect(total).toBe(Math.round(130 * 1.4 * 7_643));
  });

  it("§12 отмостка: perimeter × 0.8 × price", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: [],
        constructionCodes: ["blind_area"],
      },
      C
    );
    const m = deriveMetrics(120, C.categories.a.coefficients, 0.8);
    const expected = Math.round(m.blindArea * C.construction.blind_area.price);
    expect(quote?.constructionLines[0]?.amountRub).toBe(expected);
  });

  it("§13 лестница недоступна для кат. a", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: [],
        constructionCodes: ["monolithic_stairs"],
      },
      C
    );
    expect(quote?.constructionLines).toHaveLength(0);
  });

  it("§13 лестница доступна для кат. d", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "d",
        wallMaterial: "gas",
        engineeringCodes: [],
        constructionCodes: ["monolithic_stairs"],
      },
      C
    );
    expect(quote?.constructionLines[0]?.amountRub).toBe(228_000);
  });

  it("project_adjustment_percent применяется к итогу", () => {
    const formula = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: [],
        constructionCodes: [],
      },
      C
    );
    expect(formula).not.toBeNull();
    const final = finalizeProjectQuote({
      formulaQuote: formula!,
      fixedExtrasRub: 0,
      transportSurchargeRub: 0,
      adjustmentPercent: 10,
    });
    expect(final.grandTotalRub).toBe(Math.round(formula!.shellTotalRub * 1.1));
  });

  it("resolveHouseCalculatorCategory из этажности и кровли", () => {
    expect(resolveHouseCalculatorCategory({ floors: 1, roof: "dual" })).toBe("a");
    expect(resolveHouseCalculatorCategory({ floors: 2, roof: "quad" })).toBe("f");
  });

  it("§8 матрица цен коробки (6 категорий × газобетон)", () => {
    const expected: Record<string, number> = {
      a: 65_825,
      b: 66_123,
      c: 65_126,
      d: 50_890,
      e: 51_894,
      f: 55_446,
    };
    for (const [id, price] of Object.entries(expected)) {
      const cat = C.categories[id as keyof typeof C.categories];
      const total = computeShellTotalRub({
        buildingArea: 120,
        category: cat,
        wallMaterial: "gas",
        smallAreaThresholdM2: 100,
        smallAreaSurcharge: 0.15,
      });
      expect(total).toBe(Math.round(120 * price));
    }
  });

  it("§10 инженерия per_area: electric = area × price", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 100,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: ["electric"],
        constructionCodes: [],
      },
      C
    );
    expect(quote?.engineeringTotalRub).toBe(Math.round(100 * 3_839));
  });

  it("§10 инженерия fixed: boiler", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 100,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: ["boiler"],
        constructionCodes: [],
      },
      C
    );
    expect(quote?.engineeringTotalRub).toBe(295_495);
  });
});
