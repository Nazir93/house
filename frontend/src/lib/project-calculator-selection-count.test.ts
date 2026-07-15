import { describe, expect, it } from "vitest";
import { countSelectedCalculatorOptions } from "@/lib/project-calculator-selection-count";

describe("countSelectedCalculatorOptions", () => {
  it("считает фасад, инженерию и стройопции", () => {
    expect(
      countSelectedCalculatorOptions({
        facadeSlug: "plaster",
        engineeringSlugs: new Set(["electric", "water"]),
        constructionSlugs: ["gutter"],
      }),
    ).toBe(4);
  });

  it("без выбора возвращает 0", () => {
    expect(
      countSelectedCalculatorOptions({
        facadeSlug: null,
        engineeringSlugs: new Set(),
        constructionSlugs: [],
      }),
    ).toBe(0);
  });
});
