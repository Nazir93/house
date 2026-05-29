import { describe, expect, it } from "vitest";
import {
  buildProjectsSearchParams,
  getPublishedProjectBounds,
  hasCustomProjectsCatalogFilters,
  parseProjectsCatalogSearchParams,
  projectMatchesCatalogFiltersExceptRange,
} from "@/lib/project-filters";
import type { HouseProjectItem } from "@/lib/construction-data";

function stubProject(over: Partial<HouseProjectItem> = {}): HouseProjectItem {
  return {
    id: "1",
    slug: "test",
    title: "Тест",
    shortDescription: "Описание",
    description: "",
    floors: 1,
    area: 120,
    price: 8_000_000,
    rooms: 3,
    bathrooms: 1,
    materials: ["Газобетон"],
    isNew: false,
    mortgageEnabled: false,
    mortgageMode: "LEAD",
    published: true,
    order: 0,
    viewCount: 100,
    likeCount: 10,
    media: [],
    completion: [],
    constructionSchedule: [],
    anchors: [],
    ...over,
  };
}

describe("project-filters catalog URL", () => {
  const projects = [
    stubProject({ area: 100, price: 6_000_000 }),
    stubProject({ id: "2", slug: "big", area: 220, price: 15_000_000 }),
  ];
  const bounds = getPublishedProjectBounds(projects);

  it("buildProjectsSearchParams не фиксирует полный диапазон в URL", () => {
    const qs = buildProjectsSearchParams({
      areaMin: bounds.minArea,
      areaMax: bounds.maxArea,
      priceMinRub: bounds.minPriceRub,
      priceMaxRub: bounds.maxPriceRub,
      material: "all",
      floors: "all",
      q: "",
      sort: "price",
      bounds,
    });
    expect(qs).toBe("");
  });

  it("parseNumParam: null не превращается в 0", () => {
    const filters = parseProjectsCatalogSearchParams({}, bounds);
    expect(filters.areaMin).toBe(100);
    expect(filters.areaMax).toBe(220);
  });

  it("устаревший areaMax в URL не нужен для полного диапазона", () => {
    const filters = parseProjectsCatalogSearchParams({ areaMax: "200" }, bounds);
    expect(filters.areaMax).toBe(200);
    expect(
      projectMatchesCatalogFiltersExceptRange(stubProject({ area: 220 }), filters),
    ).toBe(true);
  });

  it("hasCustomProjectsCatalogFilters", () => {
    expect(hasCustomProjectsCatalogFilters({})).toBe(false);
    expect(hasCustomProjectsCatalogFilters({ material: "kirpich" })).toBe(true);
  });
});
