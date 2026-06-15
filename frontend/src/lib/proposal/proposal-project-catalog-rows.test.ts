import { describe, expect, it } from "vitest";
import { DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG } from "@/lib/house-project-calculator-config";
import {
  buildProjectProposalCatalogRows,
  PROPOSAL_ENGINEERING_BUNDLE_SLUGS,
  sumProjectProposalTotals,
} from "@/lib/proposal/proposal-project-catalog-rows";

describe("proposal-project-catalog-rows", () => {
  const config = structuredClone(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG);
  config.categories.a.shellPrices = { gas: 50000, ceramic: 55000, brick: 60000 };
  config.engineering.electric.price = 3730;
  config.engineering.radiators.price = 4564;
  config.engineering.water.price = 648;
  config.engineering.sewer.price = 540;
  config.engineering.bio.price = 351458;
  config.facades.plaster.pricePerM2 = 7410;
  config.construction.interior_plaster.price = 8448;

  it("renders full catalog sections like Braun PDF", () => {
    const rows = buildProjectProposalCatalogRows({
      config,
      categoryId: "a",
      buildingArea: 114,
      wallMaterial: "gas",
      engineeringSlugs: ["electric", "water", "sewer", "bio", "heatedFloor", "boiler"],
      constructionSlugs: ["drainage", "roof_insulation_250"],
      facadeSlug: null,
    });

    const labels = rows.map((r) => r.label);
    expect(labels).toContain("Коробка");
    expect(labels).toContain("Инженерные коммуникации");
    expect(labels).toContain("Отделка фасада");
    expect(labels).toContain("Внутренняя отделка стен");
    expect(labels).toContain("Дополнительные услуги");
    expect(labels).toContain("Штукатурка стен");
    expect(labels).toContain("Электроснабжение");
    expect(labels.filter((l) => l === "Электроснабжение")).toHaveLength(1);
  });

  it("marks engineering bundle in ENGINEERING column and user picks in CLIENT_CHOICE", () => {
    const rows = buildProjectProposalCatalogRows({
      config,
      categoryId: "a",
      buildingArea: 114,
      wallMaterial: "gas",
      engineeringSlugs: ["electric"],
      constructionSlugs: [],
      facadeSlug: null,
    });

    const electric = rows.find((r) => r.key === "eng:electric");
    const radiators = rows.find((r) => r.key === "eng:radiators");
    expect(electric?.included.ENGINEERING).toBe(PROPOSAL_ENGINEERING_BUNDLE_SLUGS.has("electric"));
    expect(electric?.included.CLIENT_CHOICE).toBe(true);
    expect(radiators?.included.ENGINEERING).toBe(false);
    expect(radiators?.included.CLIENT_CHOICE).toBe(false);
  });

  it("sums package totals from inclusion matrix", () => {
    const rows = buildProjectProposalCatalogRows({
      config,
      categoryId: "a",
      buildingArea: 114,
      wallMaterial: "gas",
      engineeringSlugs: ["electric"],
      constructionSlugs: [],
      facadeSlug: null,
    });
    const totals = sumProjectProposalTotals(rows);
    expect(totals.STANDARD).toBeGreaterThan(0);
    expect(totals.ENGINEERING).toBeGreaterThan(totals.STANDARD);
    expect(totals.CLIENT_CHOICE).toBeGreaterThan(0);
  });
});
