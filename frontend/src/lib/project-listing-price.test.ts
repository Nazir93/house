import { describe, expect, it } from "vitest";
import type { HouseProjectItem } from "@/lib/construction-data";
import {
  heroTierIndexForMaterialFilter,
  listingWallForMaterialFilter,
  resolveDefaultGasShellPriceRub,
  resolveDefaultShellPriceRub,
  resolveProjectListingPriceRub,
} from "@/lib/project-listing-price";

function stubProject(over: Partial<HouseProjectItem> = {}): HouseProjectItem {
  return {
    id: "1",
    slug: "test",
    title: "Тест",
    shortDescription: "",
    description: "",
    floors: 1,
    area: 128,
    price: 0,
    rooms: 3,
    bathrooms: 1,
    materials: ["Газобетон", "Керамоблок", "Кирпич"],
    isNew: false,
    mortgageEnabled: false,
    mortgageMode: "LEAD",
    published: true,
    order: 0,
    viewCount: 0,
    likeCount: 0,
    media: [],
    completion: [],
    constructionSchedule: [],
    anchors: [],
    ...over,
  };
}

describe("project-listing-price", () => {
  it("listingWallForMaterialFilter", () => {
    expect(listingWallForMaterialFilter("gazobeton")).toBe("gas");
    expect(listingWallForMaterialFilter("keramoblok")).toBe("ceramic");
    expect(listingWallForMaterialFilter("kirpich")).toBe("brick");
    expect(listingWallForMaterialFilter("all")).toBe("gas");
  });

  it("resolveProjectListingPriceRub: ручная цена приоритетнее расчёта для газобетона", () => {
    expect(resolveProjectListingPriceRub(stubProject({ price: 9_500_000 }), "gazobeton")).toBe(9_500_000);
    expect(resolveProjectListingPriceRub(stubProject({ price: 9_500_000 }), "all")).toBe(9_500_000);
  });

  it("resolveProjectListingPriceRub: при ручной цене пересчитывает керамоблок и кирпич", () => {
    const project = stubProject({ price: 9_500_000, area: 128, floors: 1 });
    expect(resolveProjectListingPriceRub(project, "keramoblok")).toBe(
      resolveDefaultShellPriceRub(project, "ceramic"),
    );
    expect(resolveProjectListingPriceRub(project, "kirpich")).toBe(
      resolveDefaultShellPriceRub(project, "brick"),
    );
  });

  it("resolveDefaultGasShellPriceRub: газобетон 1 эт., 128 м² (Аврора)", () => {
    expect(resolveDefaultGasShellPriceRub(stubProject({ area: 128, floors: 1 }))).toBe(8_425_600);
  });

  it("resolveDefaultShellPriceRub: керамоблок дороже газобетона при той же площади", () => {
    const project = stubProject({ area: 128, floors: 1, price: 0 });
    const gas = resolveDefaultShellPriceRub(project, "gas");
    const ceramic = resolveDefaultShellPriceRub(project, "ceramic");
    const brick = resolveDefaultShellPriceRub(project, "brick");
    expect(gas).toBe(8_425_600);
    expect(ceramic).toBe(8_710_912);
    expect(brick).toBe(9_147_136);
    expect(ceramic).toBeGreaterThan(gas);
    expect(brick).toBeGreaterThan(ceramic);
  });

  it("resolveProjectListingPriceRub: при price=0 — расчёт по материалу фильтра", () => {
    const project = stubProject({ area: 128, floors: 1, price: 0 });
    expect(resolveProjectListingPriceRub(project, "gazobeton")).toBe(8_425_600);
    expect(resolveProjectListingPriceRub(project, "keramoblok")).toBe(8_710_912);
  });

  it("heroTierIndexForMaterialFilter выбирает тариф по фильтру каталога", () => {
    const tiers = [
      { id: "gas", label: "Газобетон" },
      { id: "ceramic", label: "Керамоблок" },
      { id: "brick", label: "Кирпич" },
    ];
    expect(heroTierIndexForMaterialFilter(tiers, "all")).toBe(0);
    expect(heroTierIndexForMaterialFilter(tiers, "gazobeton")).toBe(0);
    expect(heroTierIndexForMaterialFilter(tiers, "keramoblok")).toBe(1);
    expect(heroTierIndexForMaterialFilter(tiers, "kirpich")).toBe(2);
    expect(heroTierIndexForMaterialFilter([{ id: "gas", label: "Газобетон" }], "kirpich")).toBe(0);
  });
});
