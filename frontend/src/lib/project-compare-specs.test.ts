import { describe, expect, it } from "vitest";
import type { HouseProjectItem } from "@/lib/construction-data";
import {
  buildCompareCompletionRows,
  buildCompareHeroTierRows,
  buildCompareScheduleRows,
  projectHasCompletionItem,
  resolveCompareHeroTierPriceRub,
  resolveCompareScheduleTerm,
} from "@/lib/project-compare-specs";

function stubProject(partial: Partial<HouseProjectItem>): HouseProjectItem {
  return {
    id: "1",
    slug: "test",
    title: "Test",
    shortDescription: "",
    description: "",
    floors: 1,
    area: 100,
    price: 5_000_000,
    rooms: 3,
    bathrooms: 1,
    materials: ["Газоблок"],
    isNew: false,
    mortgageEnabled: true,
    mortgageMode: "LEAD",
    published: true,
    order: 0,
    viewCount: 0,
    likeCount: 0,
    media: [],
    completion: [],
    constructionSchedule: [],
    anchors: [],
    ...partial,
  };
}

describe("project-compare-specs", () => {
  it("buildCompareCompletionRows — объединяет пункты из всех проектов", () => {
    const rows = buildCompareCompletionRows([
      stubProject({
        completion: [{ title: "Коробка", items: ["Фундамент", "Стены"] }],
      }),
      stubProject({
        completion: [{ title: "Коробка", items: ["Стены", "Кровля"] }],
      }),
    ]);
    expect(rows.map((r) => r.item)).toEqual(["Фундамент", "Стены", "Кровля"]);
  });

  it("projectHasCompletionItem", () => {
    const project = stubProject({
      completion: [{ title: "Коробка", items: ["Фундамент"] }],
    });
    expect(projectHasCompletionItem(project, "Коробка", "Фундамент")).toBe(true);
    expect(projectHasCompletionItem(project, "Коробка", "Кровля")).toBe(false);
  });

  it("buildCompareScheduleRows и resolveCompareScheduleTerm", () => {
    const project = stubProject({
      constructionSchedule: [
        { title: "Фундамент", term: "4 нед.", description: "" },
        { title: "Коробка", term: "8 нед.", description: "" },
      ],
    });
    expect(buildCompareScheduleRows([project]).map((r) => r.title)).toEqual(["Фундамент", "Коробка"]);
    expect(resolveCompareScheduleTerm(project, "Фундамент")).toBe("4 нед.");
  });

  it("buildCompareHeroTierRows — union tier ids", () => {
    const rows = buildCompareHeroTierRows([
      stubProject({ heroPricing: { tiers: [{ id: "gas", label: "Газоблок", price: 1 }] } }),
      stubProject({
        heroPricing: {
          tiers: [
            { id: "gas", label: "Газоблок", price: 1 },
            { id: "brick", label: "Кирпич", price: 2 },
          ],
        },
      }),
    ]);
    expect(rows.map((r) => r.id)).toEqual(["gas", "brick"]);
    expect(resolveCompareHeroTierPriceRub(
      stubProject({ heroPricing: { tiers: [{ id: "brick", label: "Кирпич", price: 9_000_000 }] } }),
      "brick",
    )).toBe(9_000_000);
  });
});
