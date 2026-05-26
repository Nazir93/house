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
});
