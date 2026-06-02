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

  it("exposes option footnote metadata without exposing prices", () => {
    const config = structuredClone(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG);
    config.engineering.electric = {
      ...config.engineering.electric,
      description: "Описание узла электроснабжения",
      imageUrl: "/uploads/electric.jpg",
    };

    const cat = buildPublicCatalog(config, "a");
    const electric = cat.engineering.find((o) => o.slug === "electric");

    expect(electric).toMatchObject({
      description: "Описание узла электроснабжения",
      imageUrl: "/uploads/electric.jpg",
    });
    expect(electric).not.toHaveProperty("price");
  });

  it("shows interior plaster as the first construction option", () => {
    const cat = buildPublicCatalog(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG, "a");
    expect(cat.construction[0]).toMatchObject({
      slug: "interior_plaster",
      name: "Внутренняя штукатурка",
      allowed: true,
    });
  });

  it("shows custom options added from admin", () => {
    const config = structuredClone(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG);
    config.engineering.custom_engineering_signal = {
      label: "Слаботочка",
      pricingType: "per_area",
      price: 1000,
      enabled: true,
    };
    config.construction.custom_construction_finish = {
      label: "Черновая отделка",
      pricingType: "fixed",
      price: 50000,
      enabled: true,
    };

    const cat = buildPublicCatalog(config, "a");

    expect(cat.engineering).toContainEqual({
      slug: "custom_engineering_signal",
      name: "Слаботочка",
      groupSlug: "engineering",
      allowed: true,
    });
    expect(cat.construction).toContainEqual({
      slug: "custom_construction_finish",
      name: "Черновая отделка",
      groupSlug: "construction",
      allowed: true,
    });
  });
});
