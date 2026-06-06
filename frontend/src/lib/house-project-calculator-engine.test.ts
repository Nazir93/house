import { describe, expect, it } from "vitest";
import {
  computeFacadeTotalRub,
  computeHouseProjectQuote,
  computeShellTotalRub,
  deriveMetrics,
  getHouseCalculatorCategoryParams,
  resolveHouseCalculatorCategory,
  toPublicQuoteResult,
} from "./house-project-calculator-engine";
import { DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG } from "./house-project-calculator-config";
import { finalizeProjectQuote } from "./house-project-calculator-quote";

const C = {
  ...structuredClone(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG),
  categories: {
    ...structuredClone(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.categories),
    a: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.categories.a,
      shellPrices: { gas: 65_825, ceramic: 68_054, brick: 71_462 },
    },
    b: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.categories.b,
      shellPrices: { gas: 66_123, ceramic: 70_161, brick: 73_527 },
    },
    c: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.categories.c,
      shellPrices: { gas: 65_126, ceramic: 68_680, brick: 72_480 },
    },
    d: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.categories.d,
      shellPrices: { gas: 50_890, ceramic: 53_078, brick: 55_409 },
    },
    e: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.categories.e,
      shellPrices: { gas: 51_894, ceramic: 54_259, brick: 56_781 },
    },
    f: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.categories.f,
      shellPrices: { gas: 55_446, ceramic: 56_725, brick: 60_299 },
    },
    g: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.categories.g,
      shellPrices: { gas: 55_446, ceramic: 56_725, brick: 60_299 },
    },
    h: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.categories.h,
      shellPrices: { gas: 55_446, ceramic: 56_725, brick: 60_299 },
    },
  },
  facades: {
    ...structuredClone(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.facades),
    plaster: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.facades.plaster,
      pricePerM2: 7_643,
    },
    brick: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.facades.brick,
      pricePerM2: 19_478,
    },
    thermo: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.facades.thermo,
      pricePerM2: 12_309,
    },
    brick_insulated: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.facades.brick_insulated,
      pricePerM2: 22_400,
    },
  },
  engineering: {
    ...structuredClone(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.engineering),
    electric: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.engineering.electric,
      price: 3_839,
    },
    boiler: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.engineering.boiler,
      price: 295_495,
    },
    radiators: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.engineering.radiators,
      price: 4_698,
    },
    water: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.engineering.water,
      price: 667,
    },
    heatedFloor: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.engineering.heatedFloor,
      price: 7_418,
    },
    sewer: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.engineering.sewer,
      price: 556,
    },
    bio: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.engineering.bio,
      price: 351_458,
    },
  },
  construction: {
    ...structuredClone(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction),
    blind_area: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction.blind_area,
      price: 7_428,
    },
    roof_insulation_200: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction.roof_insulation_200,
      price: 3_823,
    },
    roof_insulation_250: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction.roof_insulation_250,
      price: 5_622,
    },
    monolithic_stairs: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction.monolithic_stairs,
      price: 228_000,
    },
    drainage: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction.drainage,
      price: 6_063,
    },
    soffits: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction.soffits,
      price: 3_750,
    },
    gutter: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction.gutter,
      price: 4_143,
    },
    roof_folding: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction.roof_folding,
      price: 12_976,
    },
    roof_soft: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction.roof_soft,
      price: 12_242,
    },
    interior_plaster: {
      ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction.interior_plaster,
      price: 1_000,
    },
  },
};

/** ТЗ §8–12: категория a, дом 120 м², газобетон */
describe("house-project-calculator-engine (TZ)", () => {
  it("§4 таблица коэффициентов категорий a–f соответствует ТЗ", () => {
    expect(
      Object.fromEntries(
        Object.entries(C.categories).map(([id, cat]) => [id, cat.coefficients])
      )
    ).toEqual({
      a: { facade: 1.4, perimeter: 0.42, roof: 1.3, soffit: 0.6, gutter: 0.6, overlap: 0, insulation: 1, cross: 1 },
      b: { facade: 1.45, perimeter: 0.43, roof: 1.38, soffit: 0.65, gutter: 0.75, overlap: 0, insulation: 1, cross: 1 },
      c: { facade: 1.4, perimeter: 0.42, roof: 1.45, soffit: 0.7, gutter: 1, overlap: 0, insulation: 1, cross: 1 },
      d: { facade: 1.85, perimeter: 0.33, roof: 1.2, soffit: 0.55, gutter: 0.6, overlap: 0.55, insulation: 1.2, cross: 1.2 },
      e: { facade: 1.95, perimeter: 0.34, roof: 1.3, soffit: 0.6, gutter: 0.75, overlap: 0.55, insulation: 1.3, cross: 1.3 },
      f: { facade: 2.05, perimeter: 0.3, roof: 0.9, soffit: 0.7, gutter: 1, overlap: 0.5, insulation: 0.85, cross: 0.85 },
      g: { facade: 2.05, perimeter: 0.3, roof: 0.9, soffit: 0.7, gutter: 1, overlap: 0.5, insulation: 0.85, cross: 0.85 },
      h: { facade: 2.05, perimeter: 0.3, roof: 0.9, soffit: 0.7, gutter: 1, overlap: 0.5, insulation: 0.85, cross: 0.85 },
    });
  });

  it("§5 roof_area = building_area × roof_coef (кат. a, 120 м²)", () => {
    const m = deriveMetrics(120, C.categories.a.coefficients, C.settings.blindAreaWidthM);
    expect(m.roofArea).toBeCloseTo(120 * 1.3, 5);
  });

  it("§5 у двухэтажных домов кровля считается от общей площади с пониженным roof_coef", () => {
    const m = deriveMetrics(120, C.categories.f.coefficients, C.settings.blindAreaWidthM);
    expect(C.categories.f.coefficients.roof).toBe(0.9);
    expect(m.roofArea).toBeCloseTo(120 * 0.9, 5);
    expect(m.roofArea).toBeLessThan(m.buildingArea);
  });

  it("§6 facade_area = building_area × facade_coef (кат. d, 130 м²)", () => {
    const m = deriveMetrics(130, C.categories.d.coefficients, C.settings.blindAreaWidthM);
    expect(m.facadeArea).toBeCloseTo(130 * 1.85, 5);
  });

  it("§6 facade_price = facade_area × facade_price_per_m2", () => {
    const total = computeFacadeTotalRub({
      buildingArea: 130,
      category: C.categories.d,
      facadeVariant: "plaster",
      facadePricePerM2: C.facades.plaster.pricePerM2,
    });
    expect(total).toBe(Math.round(130 * 1.85 * 7_643));
  });

  it("§7 perimeter = building_area × perimeter_coef (кат. a, 120 м²)", () => {
    const m = deriveMetrics(120, C.categories.a.coefficients, C.settings.blindAreaWidthM);
    expect(m.perimeter).toBeCloseTo(120 * 0.42, 5);
  });

  it("§3 категория определяет коэффициенты водосточки, софитов и перекрытия", () => {
    const m = deriveMetrics(120, C.categories.e.coefficients, C.settings.blindAreaWidthM);
    const perimeter = 120 * C.categories.e.coefficients.perimeter;
    expect(m.gutterLength).toBeCloseTo(perimeter * C.categories.e.coefficients.gutter, 5);
    expect(m.soffitLength).toBeCloseTo(perimeter * C.categories.e.coefficients.soffit, 5);
    expect(m.overlapArea).toBeCloseTo(120 * C.categories.e.coefficients.overlap, 5);
  });

  it("§12 утепление кровли считается по roof_area без отдельного коэффициента утепления", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 100,
        categoryId: "e",
        wallMaterial: "gas",
        engineeringCodes: [],
        constructionCodes: ["roof_insulation_200"],
      },
      C
    );
    const cat = C.categories.e;
    const expected = Math.round(
      100 * cat.coefficients.roof * C.construction.roof_insulation_200.price
    );
    expect(quote?.constructionLines[0]?.amountRub).toBe(expected);
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

    const threshold = computeShellTotalRub({
      buildingArea: 100,
      category: cat,
      wallMaterial: "gas",
      smallAreaThresholdM2: 100,
      smallAreaSurcharge: 0.15,
    });
    expect(threshold).toBe(Math.round(100 * 65_825));
  });

  it("§8 базовые цены коробки соответствуют таблице ТЗ", () => {
    const expected = {
      a: { gas: 65_825, ceramic: 68_054, brick: 71_462 },
      b: { gas: 66_123, ceramic: 70_161, brick: 73_527 },
      c: { gas: 65_126, ceramic: 68_680, brick: 72_480 },
      d: { gas: 50_890, ceramic: 53_078, brick: 55_409 },
      e: { gas: 51_894, ceramic: 54_259, brick: 56_781 },
      f: { gas: 55_446, ceramic: 56_725, brick: 60_299 },
      g: { gas: 55_446, ceramic: 56_725, brick: 60_299 },
      h: { gas: 55_446, ceramic: 56_725, brick: 60_299 },
    };
    for (const [id, prices] of Object.entries(expected)) {
      expect(C.categories[id as keyof typeof C.categories].shellPrices).toEqual(prices);
    }
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

  it("§9 цены фасадов соответствуют таблице ТЗ", () => {
    expect(C.facades).toMatchObject({
      brick: { pricePerM2: 19_478 },
      plaster: { pricePerM2: 7_643 },
      thermo: { pricePerM2: 12_309 },
      brick_insulated: { pricePerM2: 22_400 },
    });
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

  it("§12 дренаж: perimeter × 6063", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: [],
        constructionCodes: ["drainage"],
      },
      C
    );
    const m = deriveMetrics(120, C.categories.a.coefficients, C.settings.blindAreaWidthM);
    expect(quote?.constructionLines[0]?.amountRub).toBe(Math.round(m.perimeter * 6_063));
  });

  it("§12 софиты: perimeter × soffit_coef × 3750", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: [],
        constructionCodes: ["soffits"],
      },
      C
    );
    const m = deriveMetrics(120, C.categories.a.coefficients, C.settings.blindAreaWidthM);
    expect(quote?.constructionLines[0]?.amountRub).toBe(Math.round(m.soffitLength * 3_750));
  });

  it("§12 водосточка: perimeter × gutter_coef × 4143", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "c",
        wallMaterial: "gas",
        engineeringCodes: [],
        constructionCodes: ["gutter"],
      },
      C
    );
    const m = deriveMetrics(120, C.categories.c.coefficients, C.settings.blindAreaWidthM);
    expect(C.categories.c.coefficients.gutter).toBe(1);
    expect(quote?.constructionLines[0]?.amountRub).toBe(Math.round(m.gutterLength * 4_143));
  });

  it("§12 кровельные материалы: roof_area × price_per_m2", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: [],
        constructionCodes: ["roof_soft", "roof_folding"],
      },
      C
    );
    const m = deriveMetrics(120, C.categories.a.coefficients, C.settings.blindAreaWidthM);
    expect(quote?.constructionLines.find((line) => line.id === "roof_soft")?.amountRub).toBe(
      Math.round(m.roofArea * 12_242)
    );
    expect(quote?.constructionLines.find((line) => line.id === "roof_folding")?.amountRub).toBe(
      Math.round(m.roofArea * 12_976)
    );
  });

  it("внутренняя штукатурка считается как площадь дома × цена из админки", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: [],
        constructionCodes: ["interior_plaster"],
      },
      C
    );
    expect(quote?.constructionLines[0]).toMatchObject({
      id: "interior_plaster",
      label: "Внутренняя штукатурка",
      amountRub: 120_000,
    });
  });

  it("новые опции из админки считаются без доработки кода", () => {
    const config = structuredClone(C);
    config.engineering.custom_engineering_signal = {
      label: "Слаботочка",
      pricingType: "per_area",
      price: 1_000,
      enabled: true,
    };
    config.construction.custom_construction_finish = {
      label: "Черновая отделка",
      pricingType: "fixed",
      price: 50_000,
      enabled: true,
    };

    const quote = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: ["custom_engineering_signal"],
        constructionCodes: ["custom_construction_finish"],
      },
      config
    );

    expect(quote?.engineeringLines[0]).toMatchObject({
      id: "custom_engineering_signal",
      label: "Слаботочка",
      amountRub: 120_000,
    });
    expect(quote?.constructionLines[0]).toMatchObject({
      id: "custom_construction_finish",
      label: "Черновая отделка",
      amountRub: 50_000,
    });
  });

  it("§11 дополнительные строительные опции соответствуют таблице ТЗ", () => {
    expect(C.construction).toMatchObject({
      interior_plaster: { pricingType: "per_area", price: 1_000 },
      blind_area: { pricingType: "per_blind_area", price: 7_428 },
      drainage: { pricingType: "per_perimeter", price: 6_063 },
      soffits: { pricingType: "per_soffit_length", price: 3_750 },
      gutter: { pricingType: "per_gutter_length", price: 4_143 },
      roof_folding: { pricingType: "per_roof", price: 12_976 },
      roof_soft: { pricingType: "per_roof", price: 12_242 },
      roof_insulation_200: { pricingType: "per_roof", price: 3_823 },
      roof_insulation_250: { pricingType: "per_roof", price: 5_622 },
      monolithic_stairs: { pricingType: "fixed", price: 228_000 },
    });
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

  it("§17 публичный ответ не показывает коэффициенты, формулы и project_adjustment_percent", () => {
    const quote = computeHouseProjectQuote(
      {
        buildingArea: 120,
        categoryId: "a",
        wallMaterial: "gas",
        engineeringCodes: ["electric"],
        constructionCodes: ["blind_area"],
        projectAdjustmentPercent: 10,
      },
      C
    );
    expect(quote).not.toBeNull();
    const publicQuote = toPublicQuoteResult(quote!);
    expect(publicQuote).toEqual({
      categoryId: "a",
      shellTotalRub: quote!.shellTotalRub,
      facadeTotalRub: quote!.facadeTotalRub,
      engineeringLines: quote!.engineeringLines.map(({ id, label, amountRub }) => ({ id, label, amountRub })),
      engineeringTotalRub: quote!.engineeringTotalRub,
      constructionLines: quote!.constructionLines.map(({ id, label, amountRub }) => ({ id, label, amountRub })),
      constructionTotalRub: quote!.constructionTotalRub,
      transportSurchargeRub: quote!.transportSurchargeRub,
      grandTotalRub: quote!.grandTotalRub,
    });
    expect(publicQuote).not.toHaveProperty("subtotalBeforeAdjustmentRub");
    expect(publicQuote).not.toHaveProperty("adjustmentPercentApplied");
    expect(publicQuote).not.toHaveProperty("adjustmentAmountRub");
    expect(publicQuote).not.toHaveProperty("coefficients");
  });

  it("resolveHouseCalculatorCategory из этажности и кровли", () => {
    expect(resolveHouseCalculatorCategory({ floors: 1, roof: "dual" })).toBe("a");
    expect(resolveHouseCalculatorCategory({ floors: 2, roof: "quad" })).toBe("f");
    expect(resolveHouseCalculatorCategory({ floors: 2, roof: "dual" })).toBe("g");
    expect(resolveHouseCalculatorCategory({ floors: 2, roof: "triple" })).toBe("h");
  });

  it("явная категория b задаёт трёхскатную кровлю для отображения и расчёта", () => {
    expect(getHouseCalculatorCategoryParams("b")).toEqual({ floors: 1, roof: "triple" });
  });

  it("двухэтажные двух-/трёхскатные категории используют цены и коэффициенты категории f", () => {
    expect(getHouseCalculatorCategoryParams("g")).toEqual({ floors: 2, roof: "dual" });
    expect(getHouseCalculatorCategoryParams("h")).toEqual({ floors: 2, roof: "triple" });
    expect(C.categories.g.coefficients).toEqual(C.categories.f.coefficients);
    expect(C.categories.h.coefficients).toEqual(C.categories.f.coefficients);
    expect(C.categories.g.shellPrices).toEqual(C.categories.f.shellPrices);
    expect(C.categories.h.shellPrices).toEqual(C.categories.f.shellPrices);
  });

  it("§8 матрица цен коробки (6 категорий × газобетон)", () => {
    const expected: Record<string, number> = {
      a: 65_825,
      b: 66_123,
      c: 65_126,
      d: 50_890,
      e: 51_894,
      f: 55_446,
      g: 55_446,
      h: 55_446,
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

  it("§10 таблица инженерных систем соответствует ТЗ", () => {
    expect(C.engineering).toMatchObject({
      electric: { pricingType: "per_area", price: 3_839 },
      radiators: { pricingType: "per_area", price: 4_698 },
      water: { pricingType: "per_area", price: 667 },
      heatedFloor: { pricingType: "per_area", price: 7_418 },
      sewer: { pricingType: "per_area", price: 556 },
      boiler: { pricingType: "fixed", price: 295_495 },
      bio: { pricingType: "fixed", price: 351_458 },
    });
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
