import { describe, expect, it } from "vitest";
import {
  computeHouseConstructionQuote,
  defaultEngineeringSelection,
  normalizeEngineeringSelection,
  DEFAULT_HOUSE_CONSTRUCTION_CONFIG,
  getBaseRubPerM2,
  isValidHouseConfiguration,
  minCatalogRubPerM2ByMaterial,
} from "./house-construction-calculator";

/**
 * Полный контроль цифр из PDF «Для Сайта Часть души (калькулятор)» (стр. 1–4).
 * Вводные в начале PDF (примеры Санфор/63 945 ₽/м²) — иллюстративные, не входят в сетку прайса.
 */
describe("PDF parity (Для Сайта — калькулятор)", () => {
  const C = DEFAULT_HOUSE_CONSTRUCTION_CONFIG;

  it("база ₽/м² — все строки PDF стр.2", () => {
    expect(C.baseRubPerM2["1"]!.dual).toEqual([65_825, 68_054, 71_462]);
    expect(C.baseRubPerM2["1"]!.triple).toEqual([66_123, 70_161, 73_527]);
    expect(C.baseRubPerM2["1"]!.quad).toEqual([65_126, 68_680, 72_480]);
    expect(C.baseRubPerM2["1.5"]!.dual).toEqual([50_890, 53_078, 55_409]);
    expect(C.baseRubPerM2["1.5"]!.triple).toEqual([51_894, 54_259, 56_781]);
    expect(C.baseRubPerM2["2"]!.quad).toEqual([55_446, 56_725, 60_299]);
  });

  it("надбавки &lt;100 м²: +15% к базе, +10% к инженерии", () => {
    expect(C.smallArea.baseThresholdM2).toBe(100);
    expect(C.smallArea.baseSurcharge).toBe(0.15);
    expect(C.smallArea.engineeringThresholdM2).toBe(100);
    expect(C.smallArea.engineeringSurcharge).toBe(0.1);
  });

  it("инженерия — как PDF стр.2–3", () => {
    expect(C.engineering.one).toMatchObject({
      electricPerM2: 3_839,
      waterPerM2: 667,
      sewagePerM2: 556,
      radiatorsPerM2: 4_698,
      warmFloorFirstPerM2: 7_418,
      boilerFixed: 295_495,
      bioFixed: 351_458,
    });
    expect(C.engineering.one_half_or_two).toMatchObject({
      electricPerM2: 3_730,
      waterPerM2: 648,
      sewagePerM2: 540,
      radiatorsPerM2: 4_564,
      warmFloorFirstPerM2: 7_418,
      boilerFixed: 295_495,
      bioFixed: 351_458,
    });
  });

  it("фасад 1 этаж — PDF стр.4 (только двух- и трёхскатная; четырёхскатная в файле не приведена)", () => {
    expect(C.facadeRubPerM2.dual).toEqual({
      brick: 19_478,
      plaster: 7_643,
      thermo: 12_309,
      brick_insulated: 22_400,
    });
    expect(C.facadeRubPerM2.triple).toEqual({
      brick: 19_554,
      plaster: 7_673,
      thermo: 12_357,
      brick_insulated: 22_487,
    });
  });
});

describe("house-construction-calculator", () => {
  it("matches PDF examples for 1 этаж газобетон", () => {
    expect(getBaseRubPerM2("1", "dual", "gas")).toBe(65_825);
    expect(getBaseRubPerM2("1", "triple", "gas")).toBe(66_123);
    expect(getBaseRubPerM2("1", "quad", "gas")).toBe(65_126);
  });

  it("matches 1.5 этажа кирпич трёхскатная", () => {
    expect(getBaseRubPerM2("1.5", "triple", "brick")).toBe(56_781);
  });

  it("matches 2 этажа четырёхскатная керамоблок", () => {
    expect(getBaseRubPerM2("2", "quad", "ceramic")).toBe(56_725);
  });

  it("rejects invalid combinations from PDF", () => {
    expect(isValidHouseConfiguration("2", "dual")).toBe(false);
    expect(isValidHouseConfiguration("1.5", "quad")).toBe(false);
  });

  it("applies +15% to base when area < 100 m²", () => {
    const q = computeHouseConstructionQuote({
      areaM2: 90,
      catalogFloor: "1",
      roof: "dual",
      wall: "gas",
      engineering: defaultEngineeringSelection(),
      facadeFinish: "none",
    });
    expect(q.baseSubtotalRub).toBe(90 * 65_825);
    expect(q.smallHouseBaseApplied).toBe(true);
    expect(q.smallHouseBaseExtraRub).toBe(Math.round(90 * 65_825 * 0.15));
    expect(q.baseTotalRub).toBe((q.baseSubtotalRub ?? 0) + q.smallHouseBaseExtraRub);
  });

  it("applies +10% to engineering subtotal when area < 100 m²", () => {
    const eng = { ...defaultEngineeringSelection(), electric: true };
    const q = computeHouseConstructionQuote({
      areaM2: 80,
      catalogFloor: "1",
      roof: "dual",
      wall: "gas",
      engineering: eng,
      facadeFinish: "none",
    });
    const rawEng = 80 * 3839;
    expect(q.engineeringSubtotalRub).toBe(rawEng);
    expect(q.smallHouseEngineeringApplied).toBe(true);
    expect(q.engineeringTotalRub).toBe(Math.round(rawEng * 1.1));
  });

  it("min «от» prices use lowest rate per material across catalog", () => {
    const m = minCatalogRubPerM2ByMaterial();
    expect(m.gas).toBe(50_890);
    expect(m.ceramic).toBe(53_078);
    expect(m.brick).toBe(55_409);
  });

  it("суммирует все инженерные опции (100 м², 1,5 этажа — тариф one_half_or_two)", () => {
    const engineering = normalizeEngineeringSelection({
      electric: true,
      water: true,
      sewage: true,
      radiators: true,
      warmFloor: true,
      boiler: true,
      bio: true,
    });
    const q = computeHouseConstructionQuote({
      areaM2: 100,
      catalogFloor: "1.5",
      roof: "dual",
      wall: "gas",
      engineering,
      facadeFinish: "none",
    });
    expect(q.engineeringLines).toHaveLength(7);
    expect(q.engineeringSubtotalRub).toBe(2_336_953);
    expect(q.baseSubtotalRub).toBe(5_089_000);
    expect(q.grandTotalRub).toBe(7_425_953);
  });

  it("normalizeEngineeringSelection: частичный объект не ломает расчёт", () => {
    const partial = normalizeEngineeringSelection({ water: true });
    expect(partial).toEqual({ ...defaultEngineeringSelection(), water: true });
    const q = computeHouseConstructionQuote({
      areaM2: 100,
      catalogFloor: "1.5",
      roof: "dual",
      wall: "gas",
      engineering: partial,
      facadeFinish: "none",
    });
    expect(q.engineeringLines).toHaveLength(1);
    expect(q.engineeringLines[0]?.label).toBe("Разводка воды по дому");
    expect(q.engineeringSubtotalRub).toBe(64_800);
  });

  it("normalizeEngineeringSelection: явный false убирает опцию из расчёта", () => {
    const partial = normalizeEngineeringSelection({ water: false });
    expect(partial.water).toBe(false);
    const q = computeHouseConstructionQuote({
      areaM2: 100,
      catalogFloor: "1.5",
      roof: "dual",
      wall: "gas",
      engineering: partial,
      facadeFinish: "none",
    });
    expect(q.engineeringLines).toHaveLength(0);
    expect(q.engineeringSubtotalRub).toBe(0);
  });
});
