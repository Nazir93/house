import { describe, expect, it } from "vitest";

import {
  ADVERTISING_LANDING_SLUGS,
  advertisingLandingSectionOrder,
  advertisingLandingTheme,
  getAdvertisingLandingConfig,
} from "@/lib/advertising-landing";
import {
  DEFAULT_SECTION_ORDER_BY_THEME,
  LP_THEME_BY_SLUG,
  LP_THEME_SPECS,
  resolveLpSectionOrder,
  resolveLpTheme,
} from "@/lib/lp-themes";

describe("lp themes", () => {
  it("assigns expected theme per slug", () => {
    expect(LP_THEME_BY_SLUG.kirpich).toBe("heritage");
    expect(LP_THEME_BY_SLUG["dom-pod-klyuch"]).toBe("flagship");
    expect(LP_THEME_BY_SLUG.stoimost).toBe("calculator");
    expect(LP_THEME_BY_SLUG.gazobeton).toBe("modern");
    expect(LP_THEME_BY_SLUG.odnoetazhnye).toBe("layout");
    expect(LP_THEME_BY_SLUG.keramoblok).toBe("premium");
  });

  it("elevates quiz early for calculator theme", () => {
    const order = DEFAULT_SECTION_ORDER_BY_THEME.calculator;
    expect(order.indexOf("quiz")).toBeLessThan(order.indexOf("projects"));
  });

  it("conversion themes: квиз после проектов, есть гарантии", () => {
    for (const theme of ["flagship", "heritage", "modern", "premium"] as const) {
      const order = DEFAULT_SECTION_ORDER_BY_THEME[theme];
      expect(order.indexOf("quiz")).toBeLessThan(order.indexOf("includes"));
      expect(order.indexOf("projects")).toBeLessThan(order.indexOf("quiz"));
      expect(order).toContain("guarantees");
    }
  });

  it("omits comparison for layout theme", () => {
    expect(DEFAULT_SECTION_ORDER_BY_THEME.layout).not.toContain("comparison");
    expect(DEFAULT_SECTION_ORDER_BY_THEME.layout.indexOf("projects")).toBeLessThan(
      DEFAULT_SECTION_ORDER_BY_THEME.layout.indexOf("quiz"),
    );
  });

  it("resolves theme spec with hero variant and layouts", () => {
    expect(LP_THEME_SPECS.heritage.comparisonLayout).toBe("columns");
    expect(LP_THEME_SPECS.layout.projectsLayout).toBe("carousel");
    expect(LP_THEME_SPECS.calculator.heroVariant).toBe("calculator-light");
  });
});

describe("advertising landing theme integration", () => {
  it("exposes theme and valid section order for all slugs", () => {
    for (const slug of ADVERTISING_LANDING_SLUGS) {
      const config = getAdvertisingLandingConfig(slug)!;
      expect(advertisingLandingTheme(config)).toBe(resolveLpTheme(config));
      const order = advertisingLandingSectionOrder(config);
      expect(order.length).toBeGreaterThanOrEqual(8);
      expect(new Set(order).size).toBe(order.length);
      expect(order).toEqual(resolveLpSectionOrder(config));
    }
  });

  it("includes steps and reviews in every LP section order", () => {
    for (const slug of ADVERTISING_LANDING_SLUGS) {
      const order = advertisingLandingSectionOrder(getAdvertisingLandingConfig(slug)!);
      expect(order).toContain("steps");
      expect(order).toContain("reviews");
      expect(order).toContain("quiz");
    }
  });
});
