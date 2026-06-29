import { describe, expect, it } from "vitest";
import type { BuiltObjectItem } from "./construction-shared";
import {
  filterPortfolioObjects,
  floorMatchesFilterOption,
  formatFloorFilterLabel,
  mergeFloorFilterOptions,
  mergeMaterialFilterOptions,
} from "./portfolio-filter-options";

function sampleObject(overrides: Partial<BuiltObjectItem> = {}): BuiltObjectItem {
  return {
    id: "1",
    slug: "test",
    title: "Test",
    material: "BRICK",
    area: 120,
    floors: 1,
    description: "",
    published: true,
    order: 0,
    media: [],
    ...overrides,
  };
}

describe("portfolio-filter-options", () => {
  it("mergeMaterialFilterOptions includes default presets", () => {
    const opts = mergeMaterialFilterOptions();
    expect(opts.map((o) => o.label)).toEqual(["Кирпич", "Газобетон", "Керамический блок"]);
  });

  it("mergeFloorFilterOptions includes default floor presets", () => {
    const opts = mergeFloorFilterOptions();
    expect(opts.map((o) => o.label)).toEqual(["1 этаж", "1,5 этажа", "2 этажа"]);
  });

  it("floorMatchesFilterOption matches 1, 1.5 and 2 floors", () => {
    const opts = mergeFloorFilterOptions();
    const one = opts.find((o) => o.id === "1")!;
    const mid = opts.find((o) => o.id === "1.5")!;
    const two = opts.find((o) => o.id === "2")!;

    expect(floorMatchesFilterOption(1, one)).toBe(true);
    expect(floorMatchesFilterOption(1.5, mid)).toBe(true);
    expect(floorMatchesFilterOption(2, two)).toBe(true);
    expect(floorMatchesFilterOption(1.5, one)).toBe(false);
    expect(floorMatchesFilterOption(1, two)).toBe(false);
  });

  it("filterPortfolioObjects matches legacy Russian material labels", () => {
    const objects = [
      sampleObject({ id: "a", material: "Газобетон", floors: 1, area: 100 }),
      sampleObject({ id: "b", material: "GAS_BLOCK", floors: 2, area: 200 }),
    ];
    const floorOptions = mergeFloorFilterOptions();

    const filtered = filterPortfolioObjects(
      objects,
      { material: "GAS_BLOCK", floorId: "all", areaId: "all" },
      floorOptions
    );
    expect(filtered.map((o) => o.id)).toEqual(["a", "b"]);
  });

  it("filterPortfolioObjects filters by material, floor and area", () => {
    const objects = [
      sampleObject({ id: "a", material: "BRICK", floors: 1, area: 100 }),
      sampleObject({ id: "b", material: "GAS_BLOCK", floors: 2, area: 200 }),
      sampleObject({ id: "c", material: "BRICK", floors: 2, area: 300 }),
    ];
    const floorOptions = mergeFloorFilterOptions();

    const byMaterial = filterPortfolioObjects(objects, { material: "BRICK", floorId: "all", areaId: "all" }, floorOptions);
    expect(byMaterial.map((o) => o.id)).toEqual(["a", "c"]);

    const byFloor = filterPortfolioObjects(objects, { material: "all", floorId: "2", areaId: "all" }, floorOptions);
    expect(byFloor.map((o) => o.id)).toEqual(["b", "c"]);

    const byArea = filterPortfolioObjects(objects, { material: "all", floorId: "all", areaId: "lte150" }, floorOptions);
    expect(byArea.map((o) => o.id)).toEqual(["a"]);

    const midArea = filterPortfolioObjects(objects, { material: "all", floorId: "all", areaId: "mid" }, floorOptions);
    expect(midArea.map((o) => o.id)).toEqual(["b"]);

    const gtArea = filterPortfolioObjects(objects, { material: "all", floorId: "all", areaId: "gt250" }, floorOptions);
    expect(gtArea.map((o) => o.id)).toEqual(["c"]);
  });

  it("filterPortfolioObjects has no region filter", () => {
    const objects = [
      sampleObject({ id: "nw", regionSlug: "north-west" }),
      sampleObject({ id: "mo", regionSlug: "moscow" }),
    ];
    const floorOptions = mergeFloorFilterOptions();
    const filtered = filterPortfolioObjects(objects, { material: "all", floorId: "all", areaId: "all" }, floorOptions);
    expect(filtered).toHaveLength(2);
  });

  it("formatFloorFilterLabel formats common values", () => {
    expect(formatFloorFilterLabel(1)).toBe("1 этаж");
    expect(formatFloorFilterLabel(1.5)).toBe("1,5 этажа");
    expect(formatFloorFilterLabel(2)).toBe("2 этажа");
  });
});
