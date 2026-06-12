import { describe, expect, it } from "vitest";
import type { HouseProjectItem } from "@/lib/construction-data";
import {
  resolveDefaultGasShellPriceRub,
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
    materials: ["Газобетон"],
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
  it("resolveProjectListingPriceRub: ручная цена приоритетнее расчёта", () => {
    expect(resolveProjectListingPriceRub(stubProject({ price: 9_500_000 }))).toBe(9_500_000);
  });

  it("resolveDefaultGasShellPriceRub: газобетон 1 эт., 128 м² (Аврора)", () => {
    expect(resolveDefaultGasShellPriceRub(stubProject({ area: 128, floors: 1 }))).toBe(8_425_600);
  });

  it("resolveProjectListingPriceRub: при price=0 — расчёт по площади", () => {
    expect(resolveProjectListingPriceRub(stubProject({ area: 128, floors: 1, price: 0 }))).toBe(
      8_425_600,
    );
  });
});
