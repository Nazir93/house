import { describe, expect, it } from "vitest";
import { getEffectiveCalculatorUi, type HouseProjectItem } from "@/lib/construction-data";
import { AURORA_PROJECT_CALCULATOR_UI } from "@/lib/project-calculator-aurora-defaults";

function stubProject(over: Partial<HouseProjectItem> = {}): HouseProjectItem {
  return {
    id: "p1",
    slug: "test-dom",
    title: "Тест",
    shortDescription: "",
    description: "",
    floors: 1,
    area: 120,
    price: 10_000_000,
    rooms: 3,
    bathrooms: 2,
    materials: ["Газобетон"],
    isNew: false,
    pricePromo: null,
    mortgageEnabled: true,
    mortgageMode: "CALCULATOR",
    published: true,
    order: 0,
    media: [],
    completion: [],
    constructionSchedule: [],
    anchors: [],
    builtObjectSlug: null,
    heroPricing: null,
    calculatorUi: null,
    ...over,
  };
}

describe("getEffectiveCalculatorUi", () => {
  it("без calculatorJson в БД — полный пресет Аврора (partOfSoul, addons, stages)", () => {
    const ui = getEffectiveCalculatorUi(stubProject({ calculatorUi: null }));
    expect(ui.partOfSoul?.enabled).toBe(true);
    expect(ui.addons?.length).toBe(AURORA_PROJECT_CALCULATOR_UI.addons?.length);
    expect(ui.stages?.foundation?.rows?.length).toBeGreaterThan(0);
  });

  it("для любого slug, не только aurora — тот же пресет", () => {
    const ui = getEffectiveCalculatorUi(stubProject({ slug: "my-new-house", calculatorUi: null }));
    expect(ui.partOfSoul?.enabled).toBe(true);
    expect(ui.stagesByTier?.gas?.walls?.rows?.length).toBeGreaterThan(0);
  });

  it("переопределение из БД: можно отключить формульный расчёт", () => {
    const ui = getEffectiveCalculatorUi(
      stubProject({
        calculatorUi: { partOfSoul: { enabled: false, smallHouseThresholdSqm: 100, shellSurchargeUnderThreshold: 0.15, addonsSurchargeUnderThreshold: 0.1 } },
      })
    );
    expect(ui.partOfSoul?.enabled).toBe(false);
    expect(ui.addons?.length).toBeGreaterThan(0);
  });
});
