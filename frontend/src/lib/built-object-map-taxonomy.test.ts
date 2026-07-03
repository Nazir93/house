import { describe, expect, it } from "vitest";

import type { BuiltObjectItem } from "@/lib/construction-shared";
import { filterBuiltObjectsForMap } from "@/lib/built-object-map-taxonomy";

function obj(overrides: Partial<BuiltObjectItem> = {}): BuiltObjectItem {
  return {
    id: "1",
    slug: "test",
    title: "Test",
    material: "BRICK",
    description: "",
    published: true,
    order: 0,
    media: [],
    ...overrides,
  };
}

describe("built-object-map-taxonomy siteStatus", () => {
  it("filterBuiltObjectsForMap — фильтр готовые / строящиеся", () => {
    const list = [
      obj({ id: "a", siteStatus: "COMPLETED", regionSlug: "lo" }),
      obj({ id: "b", siteStatus: "UNDER_CONSTRUCTION", regionSlug: "lo" }),
    ];
    const base = {
      material: "all",
      region: "all" as const,
      district: "all",
      area: "all" as const,
      floors: "all" as const,
    };

    expect(filterBuiltObjectsForMap(list, { ...base, siteStatus: "all" }).map((o) => o.id)).toEqual(["a", "b"]);
    expect(filterBuiltObjectsForMap(list, { ...base, siteStatus: "COMPLETED" }).map((o) => o.id)).toEqual(["a"]);
    expect(filterBuiltObjectsForMap(list, { ...base, siteStatus: "UNDER_CONSTRUCTION" }).map((o) => o.id)).toEqual(["b"]);
  });
});
