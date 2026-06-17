import { describe, expect, it } from "vitest";
import { houseConstructionCalcDisplayRows } from "./house-construction-calc-display";

describe("houseConstructionCalcDisplayRows", () => {
  it("renders house-project-quote payload for leads admin", () => {
    const rows = houseConstructionCalcDisplayRows({
      kind: "house-project-quote",
      projectTitle: "Дом 120",
      area: 120,
      categoryId: "a",
      tierLabel: "Газоблок",
      facadeSlug: "plaster",
      shellTotalRub: 7_899_000,
      grandTotalRub: 8_500_000,
    });
    expect(rows).not.toBeNull();
    expect(rows!.some((r) => r.label === "Проект" && r.value === "Дом 120")).toBe(true);
    expect(rows!.some((r) => r.label === "Итого ориентир")).toBe(true);
  });

  it("renders itemized engineering and construction lines in admin rows", () => {
    const rows = houseConstructionCalcDisplayRows({
      kind: "house-project-quote",
      projectTitle: "Пейнит",
      engineeringLines: [{ label: "Разводка воды по дому", amountRub: 50_000 }],
      constructionLines: [{ label: "Дренаж", amountRub: 80_000 }],
      transportSurchargeRub: 125_000,
      grandTotalRub: 1_000_000,
    });
    expect(rows!.find((r) => r.label === "Инженерия")?.items).toEqual([
      { label: "Разводка воды по дому", amountRub: 50_000 },
    ]);
    expect(rows!.find((r) => r.label === "Доп. опции")?.items).toEqual([{ label: "Дренаж", amountRub: 80_000 }]);
    expect(rows!.find((r) => r.label === "Транспорт")?.value).toMatch(/125[\s\u00a0]000/);
  });
});
