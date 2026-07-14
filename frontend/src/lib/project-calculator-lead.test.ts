import { describe, expect, it } from "vitest";
import { buildProjectCalculatorLeadPayload } from "./project-calculator-lead";
import { houseConstructionCalcDisplayRows } from "./house-construction-calc-display";

describe("buildProjectCalculatorLeadPayload", () => {
  it("сохраняет построчные суммы инженерии, опций и транспорта", () => {
    const payload = buildProjectCalculatorLeadPayload({
      project: {
        slug: "peinit",
        title: "Пейнит",
        area: 64,
      } as never,
      tierId: "gas",
      tierLabel: "Газоблок",
      categoryId: "b",
      quote: {
        categoryId: "b",
        shellTotalRub: 4_866_653,
        facadeTotalRub: 1_142_275,
        engineeringLines: [
          { id: "el", label: "Электроснабжение", amountRub: 264_891 },
          { id: "rad", label: "Радиаторы", amountRub: 324_162 },
        ],
        engineeringTotalRub: 589_053,
        constructionLines: [{ id: "roof-soft", label: "Мягкая кровля", amountRub: 120_000 }],
        constructionTotalRub: 120_000,
        transportSurchargeRub: 125_000,
        grandTotalRub: 8_781_116,
      },
      facadeSlug: "thermo",
      engineeringSlugs: ["electric", "radiators"],
      constructionSlugs: ["roof-soft"],
      pricingFloors: "1.5",
      roofPitch: "triple",
    });

    expect(payload.engineeringLines).toHaveLength(2);
    expect(payload.constructionLines).toHaveLength(1);
    expect(payload.selectionSummaryRu).toContain("Электроснабжение —");
    expect(payload.selectionSummaryRu).toMatch(/264[\s\u00a0]?891/);
    expect(payload.selectionSummaryRu).toContain("Мягкая кровля —");
    expect(payload.selectionSummaryRu).toMatch(/Транспортные расходы: 125[\s\u00a0]?000/);

    const rows = houseConstructionCalcDisplayRows(payload);
    expect(rows).not.toBeNull();
    const engineering = rows!.find((row) => row.label === "Инженерия");
    expect(engineering?.items).toEqual([
      { label: "Электроснабжение", amountRub: 264_891 },
      { label: "Радиаторы", amountRub: 324_162 },
    ]);
    const transport = rows!.find((row) => row.label === "Транспортные расходы");
    expect(transport?.value).toMatch(/125[\s\u00a0]000/);
  });
});
