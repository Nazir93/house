import { describe, expect, it } from "vitest";

import {
  ADVERTISING_LANDING_SLUGS,
  ADVERTISING_LP_FACT_STATS,
  advertisingLandingCatalogIntro,
  advertisingLandingFactsIntro,
  advertisingLandingMinProjectPrice,
  budgetLabelById,
  getAdvertisingLandingConfig,
  mortgageLabelById,
  pickAdvertisingLandingHeroImage,
  pickAdvertisingLandingPortfolio,
  pickAdvertisingLandingProjects,
} from "@/lib/advertising-landing";
import type { BuiltObjectItem, HouseProjectItem } from "@/lib/construction-data";

function project(partial: Partial<HouseProjectItem>): HouseProjectItem {
  return {
    id: partial.slug ?? "id",
    slug: partial.slug ?? "p",
    title: partial.title ?? "Проект",
    shortDescription: "",
    description: "",
    floors: partial.floors ?? 1,
    area: partial.area ?? 100,
    price: partial.price ?? 10_000_000,
    rooms: 3,
    bathrooms: 1,
    materials: partial.materials ?? ["Газобетон"],
    isNew: false,
    mortgageEnabled: true,
    mortgageMode: "LEAD",
    published: partial.published ?? true,
    order: 0,
    viewCount: 0,
    likeCount: 0,
    media: [],
    completion: [],
    constructionSchedule: [],
    anchors: [],
    catalogKind: "author",
  };
}

function builtObject(partial: Partial<BuiltObjectItem>): BuiltObjectItem {
  return {
    id: partial.slug ?? "id",
    slug: partial.slug ?? "o",
    title: partial.title ?? "Объект",
    material: partial.material ?? "GAS_BLOCK",
    description: "",
    published: partial.published ?? true,
    order: 0,
    media: [],
    ...partial,
  };
}

describe("advertising landing config", () => {
  it("returns no config for unknown advertising slug", () => {
    expect(getAdvertisingLandingConfig("unknown-slug")).toBeNull();
  });

  it("exposes all six phase-1 and phase-2 slugs", () => {
    expect(ADVERTISING_LANDING_SLUGS).toEqual([
      "dom-pod-klyuch",
      "kirpich",
      "stoimost",
      "gazobeton",
      "odnoetazhnye",
      "keramoblok",
    ]);
    expect(getAdvertisingLandingConfig("gazobeton")?.source).toBe("lp-gazobeton");
  });

  it("picks only brick projects for /lp/kirpich and sorts by price", () => {
    const config = getAdvertisingLandingConfig("kirpich");
    expect(config).not.toBeNull();

    const picked = pickAdvertisingLandingProjects(
      [
        project({ slug: "gas", price: 7_000_000, materials: ["Газобетон"] }),
        project({ slug: "brick-expensive", price: 12_000_000, materials: ["Кирпич"] }),
        project({ slug: "brick-cheap", price: 9_000_000, materials: ["Газобетон", "Кирпич"] }),
      ],
      config!,
    );

    expect(picked.map((item) => item.slug)).toEqual(["brick-cheap", "brick-expensive"]);
  });

  it("filters one-storey projects for /lp/odnoetazhnye", () => {
    const config = getAdvertisingLandingConfig("odnoetazhnye");
    const picked = pickAdvertisingLandingProjects(
      [
        project({ slug: "one", floors: 1 }),
        project({ slug: "two", floors: 2 }),
      ],
      config!,
    );
    expect(picked.map((item) => item.slug)).toEqual(["one"]);
  });

  it("prefers portfolio objects by material with fallback when too few matches", () => {
    const config = getAdvertisingLandingConfig("kirpich");
    const picked = pickAdvertisingLandingPortfolio(
      [
        builtObject({ slug: "gas-1", material: "GAS_BLOCK" }),
        builtObject({ slug: "gas-2", material: "GAS_BLOCK" }),
        builtObject({ slug: "brick-1", material: "BRICK" }),
      ],
      config!,
      2,
    );
    expect(picked.map((item) => item.slug)).toEqual(["gas-1", "gas-2"]);
  });

  it("returns filtered portfolio when enough material matches exist", () => {
    const config = getAdvertisingLandingConfig("kirpich");
    const picked = pickAdvertisingLandingPortfolio(
      [
        builtObject({ slug: "gas", material: "GAS_BLOCK" }),
        builtObject({ slug: "brick-1", material: "BRICK" }),
        builtObject({ slug: "brick-2", material: "BRICK" }),
      ],
      config!,
      2,
    );
    expect(picked.map((item) => item.slug)).toEqual(["brick-1", "brick-2"]);
  });

  it("maps budget and mortgage ids to labels", () => {
    expect(budgetLabelById("8-12")).toBe("8–12 млн ₽");
    expect(mortgageLabelById("yes")).toBe("Да, нужна консультация по ипотеке");
  });

  it("builds default facts and catalog copy for LP", () => {
    const config = getAdvertisingLandingConfig("kirpich")!;
    expect(advertisingLandingFactsIntro(config).toLowerCase()).toContain("\u043a\u0438\u0440\u043f\u0438\u0447");
    expect(advertisingLandingCatalogIntro(config).toLowerCase()).toContain("\u043a\u0430\u0442\u0430\u043b\u043e\u0433");
  });

  it("fact stats: короткие цифры, без длинной фразы «Под ключ»", () => {
    expect(ADVERTISING_LP_FACT_STATS).toHaveLength(6);
    expect(ADVERTISING_LP_FACT_STATS.some((s) => /под ключ/i.test(s.value))).toBe(false);
    expect(ADVERTISING_LP_FACT_STATS[5]).toEqual({
      value: "от 5 лет",
      label: "гарантии на конструктив",
    });
  });

  it("dom-pod-klyuch: комплектация по этапам", () => {
    const config = getAdvertisingLandingConfig("dom-pod-klyuch")!;
    expect(config.includes.length).toBeGreaterThanOrEqual(6);
    expect(config.includes.some((i) => /фундамент/i.test(i))).toBe(true);
    expect(config.includes.some((i) => /кровл/i.test(i))).toBe(true);
    expect(config.includes.some((i) => /инженер/i.test(i))).toBe(true);
  });

  it("advertisingLandingMinProjectPrice берёт минимум из опубликованных с ценой", () => {
    expect(
      advertisingLandingMinProjectPrice([
        project({ slug: "a", price: 12_000_000 }),
        project({ slug: "b", price: 9_500_000 }),
        project({ slug: "c", price: 8_000_000, published: false }),
      ]),
    ).toBe(9_500_000);
    expect(advertisingLandingMinProjectPrice([])).toBeNull();
  });

  it("kirpich: явный heroImage приоритетнее медиа проектов", () => {
    const config = getAdvertisingLandingConfig("kirpich")!;
    expect(config.heroImage).toBe("/images/lp/kirpich-hero.png");
    expect(config.heroImageObjectPosition).toBeTruthy();
    const picked = pickAdvertisingLandingHeroImage(
      config,
      [
        project({
          slug: "other",
          materials: ["Кирпич"],
          media: [{ id: "1", type: "RENDER", url: "/images/other.png", order: 0 }],
        }),
      ],
      [],
    );
    expect(picked).toBe("/images/lp/kirpich-hero.png");
  });
});
