import { describe, expect, it } from "vitest";

import type { BuiltObjectItem } from "@/lib/construction-shared";
import {
  HOME_BUILT_HOMES_H2,
  HOME_BUILT_HOMES_MIN,
  HOME_BUILT_HOMES_PREVIEW_COUNT,
  HOME_BUILT_HOMES_VIEW_ALL_HREF,
  homeBuiltObjectFactsLine,
  homeBuiltObjectPlaceLabel,
  mapBuiltObjectToHomeCard,
  pickHomeBuiltPortfolioPreview,
} from "@/lib/home-built-homes-block";

function object(partial: Partial<BuiltObjectItem> & Pick<BuiltObjectItem, "id" | "slug">): BuiltObjectItem {
  return {
    title: partial.title ?? partial.slug,
    material: partial.material ?? "GAS_BLOCK",
    description: partial.description ?? "",
    published: true,
    order: partial.order ?? 0,
    media: partial.media ?? [],
    ...partial,
  };
}

describe("home-built-homes-block (SEO §5)", () => {
  it("H2 и минимум 6 объектов из каталога /portfolio", () => {
    expect(HOME_BUILT_HOMES_H2).toBe(
      "Построенные дома в Санкт-Петербурге и Ленинградской области",
    );
    expect(HOME_BUILT_HOMES_MIN).toBe(6);
    expect(HOME_BUILT_HOMES_PREVIEW_COUNT).toBeGreaterThanOrEqual(HOME_BUILT_HOMES_MIN);
    expect(HOME_BUILT_HOMES_VIEW_ALL_HREF).toBe("/portfolio");
  });

  it("place = населённый пункт / КП из location", () => {
    expect(homeBuiltObjectPlaceLabel("Ленинградская область, КП Всеволожский", "Дом")).toBe(
      "КП Всеволожский",
    );
    expect(homeBuiltObjectPlaceLabel("д. Вырица", "Дом")).toBe("д. Вырица");
    expect(homeBuiltObjectPlaceLabel(null, "Дом в Токсово")).toBe("Дом в Токсово");
  });

  it("facts как в ТЗ: материал • площадь • этажность", () => {
    expect(
      homeBuiltObjectFactsLine(
        object({
          id: "1",
          slug: "a",
          material: "GAS_BLOCK",
          area: 186,
          floors: 2,
        }),
      ),
    ).toBe("Газобетон • 186 м² • 2 этажа");
  });

  it("карточка ведёт на /portfolio/{slug} и показывает статус", () => {
    const card = mapBuiltObjectToHomeCard(
      object({
        id: "1",
        slug: "dom-v-vsevolozhskom",
        title: "Дом",
        location: "ЛО, КП Всеволожский",
        material: "GAS_BLOCK",
        area: 186,
        floors: 2,
        siteStatus: "COMPLETED",
      }),
    );
    expect(card.href).toBe("/portfolio/dom-v-vsevolozhskom");
    expect(card.place).toBe("КП Всеволожский");
    expect(card.facts).toBe("Газобетон • 186 м² • 2 этажа");
    expect(card.status).toBe("Сдан");
  });

  it("превью: сначала сданные, добирает строящимися до лимита без дублей", () => {
    const list = [
      object({ id: "c1", slug: "c1", siteStatus: "COMPLETED", order: 1 }),
      object({ id: "c2", slug: "c2", siteStatus: "COMPLETED", order: 2 }),
      object({ id: "c3", slug: "c3", siteStatus: "COMPLETED", order: 3 }),
      object({ id: "c4", slug: "c4", siteStatus: "COMPLETED", order: 4 }),
      object({ id: "c5", slug: "c5", siteStatus: "COMPLETED", order: 5 }),
      object({ id: "b1", slug: "b1", siteStatus: "UNDER_CONSTRUCTION", order: 6 }),
      object({ id: "b2", slug: "b2", siteStatus: "UNDER_CONSTRUCTION", order: 7 }),
    ];
    const preview = pickHomeBuiltPortfolioPreview(list, 6);
    expect(preview).toHaveLength(6);
    expect(preview.map((o) => o.id)).toEqual(["c1", "c2", "c3", "c4", "c5", "b1"]);
    expect(pickHomeBuiltPortfolioPreview(list, 6).every((o) => o.slug)).toBe(true);
  });
});
