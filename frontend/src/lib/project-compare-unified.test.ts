import { describe, expect, it } from "vitest";
import {
  COMPARE_ENGINEERING_PRESET,
  DEFAULT_COMPARE_UNIFIED_SETTINGS,
  buildCompareQuoteRequest,
  compareQuoteFallbackBodies,
  findCheapestCompareQuoteKey,
  formatComparePriceDeltaRub,
  normalizeCompareUnifiedSettings,
} from "@/lib/project-compare-unified";

describe("project-compare-unified", () => {
  it("buildCompareQuoteRequest — полный набор опций", () => {
    const body = buildCompareQuoteRequest({
      ...DEFAULT_COMPARE_UNIFIED_SETTINGS,
      facadeSlug: "plaster",
      engineeringSlugs: ["electric"],
      constructionSlugs: ["rough"],
    });
    expect(body.facadeSlug).toBe("plaster");
    expect(body.engineeringSlugs).toEqual(["electric"]);
    expect(body.constructionSlugs).toEqual(["rough"]);
  });

  it("compareQuoteFallbackBodies — четыре уровня упрощения", () => {
    const bodies = compareQuoteFallbackBodies({
      ...DEFAULT_COMPARE_UNIFIED_SETTINGS,
      facadeSlug: "plaster",
      engineeringSlugs: ["electric"],
      constructionSlugs: ["rough"],
    });
    expect(bodies).toHaveLength(4);
    expect(bodies[0].constructionSlugs).toEqual(["rough"]);
    expect(bodies[1].constructionSlugs).toEqual([]);
    expect(bodies[2].engineeringSlugs).toEqual([]);
    expect(bodies[3].facadeSlug).toBeNull();
  });

  it("findCheapestCompareQuoteKey — минимальная цена без ошибок", () => {
    const quotes = new Map([
      ["author:a", { grandTotalRub: 12_000_000, shellTotalRub: 10_000_000, facadeTotalRub: 0, engineeringTotalRub: 0, constructionTotalRub: 0, transportSurchargeRub: 0, engineeringLines: [], constructionLines: [], fallbackUsed: false, error: null }],
      ["author:b", { grandTotalRub: 9_500_000, shellTotalRub: 8_000_000, facadeTotalRub: 0, engineeringTotalRub: 0, constructionTotalRub: 0, transportSurchargeRub: 0, engineeringLines: [], constructionLines: [], fallbackUsed: false, error: null }],
      ["author:c", { grandTotalRub: 0, shellTotalRub: 0, facadeTotalRub: 0, engineeringTotalRub: 0, constructionTotalRub: 0, transportSurchargeRub: 0, engineeringLines: [], constructionLines: [], fallbackUsed: false, error: "not_found" }],
    ]);
    expect(findCheapestCompareQuoteKey(quotes)).toBe("author:b");
  });

  it("formatComparePriceDeltaRub — тыс. и млн", () => {
    expect(formatComparePriceDeltaRub(0)).toBe("");
    expect(formatComparePriceDeltaRub(450_000)).toBe("+450 тыс. ₽");
    expect(formatComparePriceDeltaRub(1_250_000)).toBe("+1,25 млн ₽");
  });

  it("normalizeCompareUnifiedSettings — миграция v1 engineeringEnabled", () => {
    expect(
      normalizeCompareUnifiedSettings({
        tierId: "gas",
        tierLabel: "Газоблок",
        engineeringEnabled: true,
        transportBandId: "50",
      }),
    ).toEqual({
      tierId: "gas",
      tierLabel: "Газоблок",
      facadeSlug: null,
      engineeringSlugs: [...COMPARE_ENGINEERING_PRESET],
      constructionSlugs: [],
      transportBandId: "50",
    });
  });
});
