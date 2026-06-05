import { describe, expect, it } from "vitest";
import {
  calculateDesignProjectQuote,
  clampDesignArea,
  DESIGN_MAIN_DOCUMENTATION_ITEMS,
  type DesignProjectPricingSettings,
} from "@/lib/design-project-pricing";

const settings: DesignProjectPricingSettings = {
  areaMin: 50,
  areaMax: 600,
  mainDocumentationPerM2: 1000,
  model3dFixed: 20_000,
  constructivePerM2: 500,
  auditFixed: 30_000,
  engineeringPerM2: 300,
};

describe("design project pricing", () => {
  it("ТЗ: ограничивает площадь диапазоном 50-600", () => {
    expect(clampDesignArea(10, settings)).toBe(50);
    expect(clampDesignArea(601, settings)).toBe(600);
    expect(clampDesignArea(150.4, settings)).toBe(150);
  });

  it("ТЗ: основная документация содержит только базовые информационные пункты", () => {
    expect(DESIGN_MAIN_DOCUMENTATION_ITEMS).toEqual([
      "Привязка проекта к участку",
      "Архитектурный раздел проекта",
    ]);
  });

  it("ТЗ: считает основную документацию от площади", () => {
    const quote = calculateDesignProjectQuote(
      120,
      { model3d: false, constructive: false, audit: false, engineering: false },
      settings
    );
    expect(quote.mainDocumentation).toBe(120_000);
    expect(quote.additionalDocumentation).toBe(0);
    expect(quote.total).toBe(120_000);
  });

  it("ТЗ: считает допуслуги по фиксированной цене и от площади", () => {
    const quote = calculateDesignProjectQuote(
      100,
      { model3d: true, constructive: true, audit: true, engineering: true },
      settings
    );
    expect(quote.breakdown).toEqual({
      model3d: 20_000,
      constructive: 50_000,
      audit: 30_000,
      engineering: 30_000,
    });
    expect(quote.additionalDocumentation).toBe(130_000);
    expect(quote.total).toBe(230_000);
  });
});
