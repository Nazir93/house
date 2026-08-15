import { describe, expect, it } from "vitest";
import {
  buildCalculatorCatalogSnapshot,
  calculatorBackupMetaFromSnapshot,
  formatCalculatorBackupSavedAt,
  parseCalculatorCatalogSnapshot,
} from "./admin-calculator-backup";

const sample = buildCalculatorCatalogSnapshot({
  savedAt: "2026-08-15T12:00:00.000Z",
  settings: {
    smallAreaThresholdM2: 100,
    smallAreaSurcharge: 0.15,
    addonsSurchargeUnderThreshold: 0.1,
    blindAreaWidthM: 0.8,
  },
  categories: [
    {
      id: "d",
      labelRu: "Мансарда",
      floors: 1.5,
      roofType: "gable",
      facadeCoef: 1.1,
      perimeterCoef: 1,
      roofCoef: 1.2,
      insulationCoef: 1,
      gutterCoef: 1,
      soffitCoef: 1,
      overlapCoef: 0.5,
      crossCoef: 1,
      sortOrder: 3,
      isActive: true,
      shellPrices: [
        { wallMaterial: "gas", pricePerM2: 50890 },
        { wallMaterial: "ceramic", pricePerM2: 53078 },
      ],
    },
  ],
  facades: [
    {
      id: "brick",
      slug: "brick",
      name: "Кирпич",
      pricePerM2: 19478,
      sortOrder: 0,
      isActive: true,
    },
  ],
  options: [
    {
      id: "electric",
      slug: "electric",
      name: "Электрика",
      groupSlug: "engineering",
      pricingType: "per_area",
      pricePerUnit: 3839,
      description: null,
      imageUrl: null,
      allowedCategories: [],
      sortOrder: 10,
      isActive: true,
    },
  ],
});

describe("admin-calculator-backup", () => {
  it("H: round-trip snapshot JSON", () => {
    const parsed = parseCalculatorCatalogSnapshot(JSON.parse(JSON.stringify(sample)));
    expect(parsed).toEqual(sample);
    expect(calculatorBackupMetaFromSnapshot(parsed)).toEqual({
      exists: true,
      savedAt: "2026-08-15T12:00:00.000Z",
    });
  });

  it("B: rejects empty / wrong version", () => {
    expect(parseCalculatorCatalogSnapshot(null)).toBeNull();
    expect(parseCalculatorCatalogSnapshot({ version: 2, categories: sample.categories })).toBeNull();
    expect(
      parseCalculatorCatalogSnapshot({
        version: 1,
        categories: [],
        facades: [],
        options: [],
      }),
    ).toBeNull();
  });

  it("F: skips broken category rows but keeps valid ones", () => {
    const parsed = parseCalculatorCatalogSnapshot({
      version: 1,
      savedAt: "x",
      categories: [
        { id: "bad" },
        sample.categories[0],
      ],
      facades: sample.facades,
      options: sample.options,
      settings: sample.settings,
    });
    expect(parsed?.categories).toHaveLength(1);
    expect(parsed?.categories[0].id).toBe("d");
  });

  it("X: meta without snapshot", () => {
    expect(calculatorBackupMetaFromSnapshot(null)).toEqual({ exists: false, savedAt: null });
    expect(formatCalculatorBackupSavedAt(null)).toBe("нет");
  });

  it("R: format savedAt for RU locale is non-empty", () => {
    expect(formatCalculatorBackupSavedAt("2026-08-15T12:00:00.000Z").length).toBeGreaterThan(4);
  });
});
