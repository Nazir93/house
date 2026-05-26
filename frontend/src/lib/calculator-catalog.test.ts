import { describe, expect, it } from "vitest";
import { buildPublicCatalog } from "./calculator-catalog";
import { DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG } from "./house-project-calculator-config";

describe("buildPublicCatalog", () => {
  it("hides monolithic_stairs for category a", () => {
    const cat = buildPublicCatalog(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG, "a");
    const stairs = cat.construction.find((o) => o.slug === "monolithic_stairs");
    expect(stairs?.allowed).toBe(false);
  });

  it("allows monolithic_stairs for category d", () => {
    const cat = buildPublicCatalog(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG, "d");
    const stairs = cat.construction.find((o) => o.slug === "monolithic_stairs");
    expect(stairs?.allowed).toBe(true);
  });

  it("respects disabledOptionIds from project overrides", () => {
    const cat = buildPublicCatalog(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG, "d", ["electric"]);
    const electric = cat.engineering.find((o) => o.slug === "electric");
    expect(electric?.allowed).toBe(false);
  });

  it("does not expose prices in public catalog", () => {
    const cat = buildPublicCatalog(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG, "a");
    for (const o of [...cat.engineering, ...cat.construction]) {
      expect(o).not.toHaveProperty("pricePerUnit");
      expect(o).not.toHaveProperty("price");
    }
  });
});
