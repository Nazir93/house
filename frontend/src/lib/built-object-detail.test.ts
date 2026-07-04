import { describe, expect, it } from "vitest";

import {
  BUILT_OBJECT_HISTORY_SECTIONS,
  builtObjectCharacteristics,
  formatImplementationDays,
  formatFloorsLabel,
  getBuiltObjectConstructionPhotos,
  getBuiltObjectHistoryCards,
  getBuiltObjectNavItems,
  builtObjectMapHref,
  houseTypeSubtitle,
  parseConstructionHistoryJson,
  serializeConstructionHistory,
} from "@/lib/built-object-detail";
import type { BuiltObjectItem } from "@/lib/construction-shared";

describe("built-object-detail", () => {
  it("formatImplementationDays — склонение", () => {
    expect(formatImplementationDays("211")).toBe("211 дней");
    expect(formatImplementationDays("1")).toBe("1 день");
    expect(formatImplementationDays("22")).toBe("22 дня");
    expect(formatImplementationDays("7 месяцев")).toBeNull();
  });

  it("formatFloorsLabel", () => {
    expect(formatFloorsLabel(1.5)).toBe("1,5");
    expect(formatFloorsLabel(2)).toBe("2");
    expect(formatFloorsLabel(0)).toBeNull();
  });

  it("houseTypeSubtitle", () => {
    expect(houseTypeSubtitle("Кирпич")).toBe("Кирпичный дом");
  });

  it("builtObjectMapHref — строящийся объект с фильтром на карте", () => {
    expect(
      builtObjectMapHref({
        slug: "dom-vartemyagi",
        siteStatus: "UNDER_CONSTRUCTION",
      } as BuiltObjectItem)
    ).toBe("/portfolio/map?object=dom-vartemyagi&status=building");
    expect(
      builtObjectMapHref({
        slug: "dom-gotov",
        siteStatus: "COMPLETED",
      } as BuiltObjectItem)
    ).toBe("/portfolio/map?object=dom-gotov");
  });

  it("serializeConstructionHistory и parse", () => {
    const stages = serializeConstructionHistory([
      { id: "a", title: "Фундамент", description: "Текст" },
      { id: "", title: "", description: "x" },
    ]);
    expect(stages).toHaveLength(1);
    expect(parseConstructionHistoryJson(stages)?.[0]?.title).toBe("Фундамент");
  });

  it("builtObjectCharacteristics — порядок и без «под ключ»", () => {
    const rows = builtObjectCharacteristics({
      id: "1",
      slug: "m",
      title: "Марьино",
      material: "Кирпич",
      area: 142,
      rooms: 3,
      bathrooms: 2,
      floors: 2,
      buildTerm: "211",
      description: "",
      published: true,
      order: 0,
      media: [],
    } as BuiltObjectItem);
    expect(rows.map((r) => r.label)).toEqual([
      "Площадь дома",
      "Материал стен",
      "Этажность",
      "Спальни",
      "Санузлы",
      "Реализация проекта",
    ]);
    expect(rows[2]?.value).toBe("2");
    expect(rows[3]?.value).toBe("3");
    expect(rows[4]?.value).toBe("2");
    expect(rows[5]?.value).toBe("211 дней");
    expect(rows.some((r) => /под ключ/i.test(r.label + r.value))).toBe(false);
  });

  it("builtObjectCharacteristics — всегда 6 полей, пустые как «—»", () => {
    const rows = builtObjectCharacteristics({
      id: "1",
      slug: "m",
      title: "Марьино",
      material: "Кирпич",
      buildTerm: "232",
      description: "",
      published: true,
      order: 0,
      media: [],
    } as BuiltObjectItem);
    expect(rows).toHaveLength(6);
    expect(rows[0]?.value).toBe("—");
    expect(rows[5]?.value).toBe("232 дня");
  });

  it("builtObjectCharacteristics — подтягивает площадь и комнаты из проекта", () => {
    const rows = builtObjectCharacteristics({
      id: "1",
      slug: "m",
      title: "Марьино",
      material: "Кирпич",
      description: "",
      published: true,
      order: 0,
      media: [],
      linkedProjectArea: 142,
      linkedProjectRooms: 3,
      linkedProjectBathrooms: 2,
    } as BuiltObjectItem);
    expect(rows.find((r) => r.label === "Площадь дома")?.value).toBe("142 м²");
    expect(rows.find((r) => r.label === "Спальни")?.value).toBe("3");
  });

  it("getBuiltObjectConstructionPhotos sorts by phase order, not colliding order field", () => {
    const object = {
      id: "1",
      slug: "test",
      title: "Тест",
      material: "Газобетон",
      description: "",
      published: true,
      order: 0,
      caseStudyPhasesJson: [
        { id: "foundation", title: "Фундамент", order: 0 },
        { id: "walls", title: "Стены", order: 1 },
        { id: "roof", title: "Кровля", order: 2 },
      ],
      media: [
        { id: "w1", type: "BUILD_STAGE", url: "/w1.webp", alt: "", order: 0, phaseKey: "walls" },
        { id: "f1", type: "BUILD_STAGE", url: "/f1.webp", alt: "", order: 0, phaseKey: "foundation" },
        { id: "r1", type: "BUILD_STAGE", url: "/r1.webp", alt: "", order: 0, phaseKey: "roof" },
        { id: "f2", type: "BUILD_STAGE", url: "/f2.webp", alt: "", order: 1, phaseKey: "foundation" },
      ],
    } as BuiltObjectItem;

    expect(getBuiltObjectConstructionPhotos(object).map((p) => p.url)).toEqual([
      "/f1.webp",
      "/f2.webp",
      "/w1.webp",
      "/r1.webp",
    ]);
  });

  it("getBuiltObjectConstructionPhotos maps legacy phaseKey (partitions → walls)", () => {
    const object = {
      id: "1",
      slug: "test",
      title: "Тест",
      material: "Газобетон",
      description: "",
      published: true,
      order: 0,
      media: [
        { id: "p1", type: "BUILD_STAGE", url: "/part.webp", alt: "", order: 0, phaseKey: "partitions" },
        { id: "f1", type: "BUILD_STAGE", url: "/f1.webp", alt: "", order: 0, phaseKey: "foundation" },
        { id: "w1", type: "BUILD_STAGE", url: "/w1.webp", alt: "", order: 0, phaseKey: "walls" },
      ],
    } as BuiltObjectItem;

    expect(getBuiltObjectConstructionPhotos(object).map((p) => p.url)).toEqual([
      "/f1.webp",
      "/part.webp",
      "/w1.webp",
    ]);
  });

  it("по умолчанию 8 этапов истории", () => {
    const object = {
      id: "1",
      slug: "t",
      title: "Тест",
      material: "Кирпич",
      description: "",
      published: true,
      order: 0,
      media: [],
    } as BuiltObjectItem;
    expect(getBuiltObjectHistoryCards(object)).toHaveLength(BUILT_OBJECT_HISTORY_SECTIONS.length);
    expect(BUILT_OBJECT_HISTORY_SECTIONS.length).toBe(8);
  });

  it("getBuiltObjectHistoryCards — кастомные этапы из JSON", () => {
    const object = {
      id: "1",
      slug: "test",
      title: "Тест",
      material: "Кирпич",
      description: "",
      published: true,
      order: 0,
      media: [],
      constructionHistoryJson: [{ id: "x", title: "Кровля", description: "Смонтировали стропила" }],
    } as BuiltObjectItem;
    const cards = getBuiltObjectHistoryCards(object);
    expect(cards[0]?.title).toBe("Кровля");
    expect(cards[0]?.description).toContain("стропила");
  });

  it("getBuiltObjectNavItems adds client-review when review present", () => {
    const object = {
      id: "1",
      slug: "test",
      title: "Test",
      material: "GAS_BLOCK",
      description: "",
      published: true,
      order: 0,
      media: [],
      clientReviewText: "Спасибо!",
    } as BuiltObjectItem;
    expect(getBuiltObjectNavItems(object).map((i) => i.id)).toContain("client-review");
  });

  it("getBuiltObjectNavItems adds client-review for video only", () => {
    const object = {
      id: "1",
      slug: "test",
      title: "Test",
      material: "GAS_BLOCK",
      description: "",
      published: true,
      order: 0,
      media: [],
      clientReviewVideoUrl: "/uploads/review.mp4",
    } as BuiltObjectItem;
    expect(getBuiltObjectNavItems(object).some((i) => i.id === "client-review")).toBe(true);
  });
});
