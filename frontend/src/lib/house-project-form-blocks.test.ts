import { describe, expect, it } from "vitest";
import {
  buildHeroPricingJson,
  parseCompletionFromDb,
  parseHeroPricingFormFromDb,
  serializeAnchors,
  serializeCompletion,
  serializeSchedule,
} from "./house-project-form-blocks";

describe("house-project-form-blocks", () => {
  it("serializeCompletion убирает пустые пункты", () => {
    const out = serializeCompletion([
      { title: "  Теплый контур ", items: ["Фундамент", "", "  Кровля  "] },
      { title: "", items: [] },
    ]);
    expect(out).toEqual([{ title: "Теплый контур", items: ["Фундамент", "Кровля"] }]);
  });

  it("parseCompletionFromDb подставляет шаблон при пустом массиве", () => {
    const out = parseCompletionFromDb([]);
    expect(out.length).toBeGreaterThan(0);
    expect(out[0]?.title).toBeTruthy();
  });

  it("buildHeroPricingJson без своих цен — только гарантия", () => {
    const json = buildHeroPricingJson({
      useCustomTiers: false,
      tiers: [],
      warrantyYears: "5",
      productionMonthsMin: "",
    });
    expect(json).toEqual({ warrantyYears: 5 });
  });

  it("buildHeroPricingJson с tiers при useCustomTiers", () => {
    const json = buildHeroPricingJson({
      useCustomTiers: true,
      tiers: [{ id: "gas", label: "Газоблок", price: "5 000 000" }],
      warrantyYears: "",
      productionMonthsMin: "",
    });
    expect(json?.tiers).toEqual([{ id: "gas", label: "Газоблок", price: 5_000_000 }]);
  });

  it("parseHeroPricingFormFromDb читает tiers из БД", () => {
    const state = parseHeroPricingFormFromDb(
      { tiers: [{ id: "gas", label: "Газ", price: 100 }] },
      0
    );
    expect(state.useCustomTiers).toBe(true);
    expect(state.tiers[0]?.price).toBe("100");
  });

  it("serializeSchedule сохраняет порядок этапов", () => {
    const out = serializeSchedule([
      { title: "Фундамент", term: "3 нед", description: "" },
    ]);
    expect(out[0]?.title).toBe("Фундамент");
  });

  it("serializeAnchors требует подпись кнопки", () => {
    expect(serializeAnchors([{ id: "plans", label: "" }])).toHaveLength(0);
    expect(serializeAnchors([{ id: "plans", label: "Планы" }])).toHaveLength(1);
  });
});
