import { describe, expect, it } from "vitest";

import {
  getAdvertisingLandingConfig,
  pickAdvertisingLandingProjects,
} from "@/lib/advertising-landing";
import type { HouseProjectItem } from "@/lib/construction-data";

function project(partial: Partial<HouseProjectItem>): HouseProjectItem {
  return {
    id: partial.slug ?? "id",
    slug: partial.slug ?? "p",
    title: partial.title ?? "Проект",
    shortDescription: "",
    description: "",
    floors: 1,
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

describe("advertising landing config", () => {
  it("returns no config for unknown advertising slug", () => {
    expect(getAdvertisingLandingConfig("gazobeton")).toBeNull();
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
});

