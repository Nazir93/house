import { describe, expect, it } from "vitest";

import {
  FLOORS_STAGE_IMAGE_MULTI_STORY_BRICK,
  FLOORS_STAGE_IMAGE_MULTI_STORY_CERAMIC,
  FLOORS_STAGE_IMAGE_MULTI_STORY_GAS,
  FLOORS_STAGE_IMAGE_SINGLE_STORY_BRICK,
  FLOORS_STAGE_IMAGE_SINGLE_STORY_CERAMIC,
  FLOORS_STAGE_IMAGE_SINGLE_STORY_GAS,
  FOUNDATION_STAGE_IMAGE_MULTI_STORY,
  FOUNDATION_STAGE_IMAGE_SINGLE_STORY,
  ROOF_STAGE_IMAGE_MANSARD_BRICK_1_5,
  ROOF_STAGE_IMAGE_MANSARD_CERAMIC_1_5,
  ROOF_STAGE_IMAGE_MANSARD_GAS_1_5,
  WALLS_STAGE_IMAGE_BRICK,
  WALLS_STAGE_IMAGE_CERAMIC,
  WALLS_STAGE_IMAGE_GAS,
  DOORS_STAGE_IMAGE_ALL,
  WINDOWS_STAGE_IMAGE_ALL,
  resolveDoorsStageImageUrl,
  resolveFloorsStageImageUrl,
  resolveFoundationStageImageUrl,
  resolveRoofStageImageUrl,
  resolveStageDisplayImageUrl,
  resolveWallsStageImageUrl,
  resolveWindowsStageImageUrl,
} from "@/lib/project-calculator-stage-images";

describe("project-calculator-stage-images", () => {
  it("1,5- и 2-этажные — схема плиты 300 мм", () => {
    expect(resolveFoundationStageImageUrl(1.5)).toBe(FOUNDATION_STAGE_IMAGE_MULTI_STORY);
    expect(resolveFoundationStageImageUrl(2)).toBe(FOUNDATION_STAGE_IMAGE_MULTI_STORY);
  });

  it("одноэтажные — схема плиты 250 мм (зарезервировано)", () => {
    expect(resolveFoundationStageImageUrl(1)).toBe(FOUNDATION_STAGE_IMAGE_SINGLE_STORY);
  });

  it("на фундаменте подставляет привязку вместо заглушки баннера", () => {
    const url = resolveStageDisplayImageUrl({
      stageId: "foundation",
      floors: 2,
      tableImageUrl: "/images/banner/banner-hero-01.png",
      coverImageUrl: null,
    });
    expect(url).toBe(FOUNDATION_STAGE_IMAGE_MULTI_STORY);
  });

  it("кастомный imageUrl в calculatorJson сохраняется", () => {
    const custom = "/uploads/custom-foundation.png";
    const url = resolveStageDisplayImageUrl({
      stageId: "foundation",
      floors: 1.5,
      tableImageUrl: custom,
    });
    expect(url).toBe(custom);
  });

  it("1,5 этаж + газоблок — схема кровли мансарды", () => {
    expect(resolveRoofStageImageUrl({ floors: 1.5, tierKey: "gas" })).toBe(
      ROOF_STAGE_IMAGE_MANSARD_GAS_1_5,
    );
    expect(resolveRoofStageImageUrl({ floors: 2, tierKey: "gas" })).toBeNull();
  });

  it("1,5 этаж + керамоблок — схема кровли мансарды", () => {
    expect(resolveRoofStageImageUrl({ floors: 1.5, tierKey: "ceramic" })).toBe(
      ROOF_STAGE_IMAGE_MANSARD_CERAMIC_1_5,
    );
  });

  it("1,5 этаж + керамический кирпич — схема кровли мансарды", () => {
    expect(resolveRoofStageImageUrl({ floors: 1.5, tierKey: "brick" })).toBe(
      ROOF_STAGE_IMAGE_MANSARD_BRICK_1_5,
    );
    expect(resolveRoofStageImageUrl({ floors: 1.5, tierKey: "keramzit" })).toBeNull();
  });

  it("1 этаж + газоблок — схема перекрытий", () => {
    expect(resolveFloorsStageImageUrl({ floors: 1, tierKey: "gas" })).toBe(
      FLOORS_STAGE_IMAGE_SINGLE_STORY_GAS,
    );
  });

  it("1,5 и 2 этажа + газоблок — схема перекрытий", () => {
    expect(resolveFloorsStageImageUrl({ floors: 1.5, tierKey: "gas" })).toBe(
      FLOORS_STAGE_IMAGE_MULTI_STORY_GAS,
    );
    expect(resolveFloorsStageImageUrl({ floors: 2, tierKey: "gas" })).toBe(
      FLOORS_STAGE_IMAGE_MULTI_STORY_GAS,
    );
  });

  it("1 этаж + керамический блок — схема перекрытий", () => {
    expect(resolveFloorsStageImageUrl({ floors: 1, tierKey: "ceramic" })).toBe(
      FLOORS_STAGE_IMAGE_SINGLE_STORY_CERAMIC,
    );
  });

  it("1,5 и 2 этажа + керамический блок — схема перекрытий", () => {
    expect(resolveFloorsStageImageUrl({ floors: 1.5, tierKey: "ceramic" })).toBe(
      FLOORS_STAGE_IMAGE_MULTI_STORY_CERAMIC,
    );
    expect(resolveFloorsStageImageUrl({ floors: 2, tierKey: "ceramic" })).toBe(
      FLOORS_STAGE_IMAGE_MULTI_STORY_CERAMIC,
    );
  });

  it("1 этаж + керамический кирпич — схема перекрытий", () => {
    expect(resolveFloorsStageImageUrl({ floors: 1, tierKey: "brick" })).toBe(
      FLOORS_STAGE_IMAGE_SINGLE_STORY_BRICK,
    );
    expect(resolveFloorsStageImageUrl({ floors: 1, tierKey: "keramzit" })).toBeNull();
  });

  it("1,5 и 2 этажа + керамический кирпич — схема перекрытий", () => {
    expect(resolveFloorsStageImageUrl({ floors: 1.5, tierKey: "brick" })).toBe(
      FLOORS_STAGE_IMAGE_MULTI_STORY_BRICK,
    );
    expect(resolveFloorsStageImageUrl({ floors: 2, tierKey: "brick" })).toBe(
      FLOORS_STAGE_IMAGE_MULTI_STORY_BRICK,
    );
  });

  it("на перекрытиях подставляет привязку вместо заглушки баннера", () => {
    const gasUrl = resolveStageDisplayImageUrl({
      stageId: "floors",
      floors: 1,
      tierKey: "gas",
      tableImageUrl: "/images/banner/banner-hero-01.png",
      coverImageUrl: "/images/project-cover.jpg",
    });
    expect(gasUrl).toBe(FLOORS_STAGE_IMAGE_SINGLE_STORY_GAS);

    const multiGasUrl = resolveStageDisplayImageUrl({
      stageId: "floors",
      floors: 2,
      tierKey: "gas",
      tableImageUrl: "/images/banner/banner-hero-01.png",
    });
    expect(multiGasUrl).toBe(FLOORS_STAGE_IMAGE_MULTI_STORY_GAS);

    const ceramicUrl = resolveStageDisplayImageUrl({
      stageId: "floors",
      floors: 1,
      tierKey: "ceramic",
      tableImageUrl: "/images/banner/banner-hero-01.png",
    });
    expect(ceramicUrl).toBe(FLOORS_STAGE_IMAGE_SINGLE_STORY_CERAMIC);

    const multiCeramicUrl = resolveStageDisplayImageUrl({
      stageId: "floors",
      floors: 1.5,
      tierKey: "ceramic",
      tableImageUrl: "/images/banner/banner-hero-01.png",
    });
    expect(multiCeramicUrl).toBe(FLOORS_STAGE_IMAGE_MULTI_STORY_CERAMIC);

    const brickUrl = resolveStageDisplayImageUrl({
      stageId: "floors",
      floors: 1,
      tierKey: "brick",
      tableImageUrl: "/images/banner/banner-hero-01.png",
    });
    expect(brickUrl).toBe(FLOORS_STAGE_IMAGE_SINGLE_STORY_BRICK);

    const multiBrickUrl = resolveStageDisplayImageUrl({
      stageId: "floors",
      floors: 2,
      tierKey: "brick",
      tableImageUrl: "/images/banner/banner-hero-01.png",
    });
    expect(multiBrickUrl).toBe(FLOORS_STAGE_IMAGE_MULTI_STORY_BRICK);
  });

  it("на кровле подставляет привязку вместо заглушки баннера", () => {
    const gasUrl = resolveStageDisplayImageUrl({
      stageId: "roof",
      floors: 1.5,
      tierKey: "gas",
      tableImageUrl: "/images/banner/banner-hero-01.png",
      coverImageUrl: "/images/project-cover.jpg",
    });
    expect(gasUrl).toBe(ROOF_STAGE_IMAGE_MANSARD_GAS_1_5);

    const ceramicUrl = resolveStageDisplayImageUrl({
      stageId: "roof",
      floors: 1.5,
      tierKey: "ceramic",
      tableImageUrl: "/images/banner/banner-hero-01.png",
    });
    expect(ceramicUrl).toBe(ROOF_STAGE_IMAGE_MANSARD_CERAMIC_1_5);

    const brickUrl = resolveStageDisplayImageUrl({
      stageId: "roof",
      floors: 1.5,
      tierKey: "brick",
      tableImageUrl: "/images/banner/banner-hero-01.png",
    });
    expect(brickUrl).toBe(ROOF_STAGE_IMAGE_MANSARD_BRICK_1_5);
  });

  it("газобетон — схема стен на любой этажности", () => {
    expect(resolveWallsStageImageUrl("gas")).toBe(WALLS_STAGE_IMAGE_GAS);
  });

  it("керамический блок — схема стен на любой этажности", () => {
    expect(resolveWallsStageImageUrl("ceramic")).toBe(WALLS_STAGE_IMAGE_CERAMIC);
  });

  it("керамический кирпич — схема стен на любой этажности", () => {
    expect(resolveWallsStageImageUrl("brick")).toBe(WALLS_STAGE_IMAGE_BRICK);
    expect(resolveWallsStageImageUrl("keramzit")).toBeNull();
  });

  it("на стенах подставляет привязку вместо заглушки баннера", () => {
    for (const floors of [1, 1.5, 2] as const) {
      const gasUrl = resolveStageDisplayImageUrl({
        stageId: "walls",
        floors,
        tierKey: "gas",
        tableImageUrl: "/images/banner/banner-hero-01.png",
        coverImageUrl: "/images/project-cover.jpg",
      });
      expect(gasUrl).toBe(WALLS_STAGE_IMAGE_GAS);

      const ceramicUrl = resolveStageDisplayImageUrl({
        stageId: "walls",
        floors,
        tierKey: "ceramic",
        tableImageUrl: "/images/banner/banner-hero-01.png",
      });
      expect(ceramicUrl).toBe(WALLS_STAGE_IMAGE_CERAMIC);

      const brickUrl = resolveStageDisplayImageUrl({
        stageId: "walls",
        floors,
        tierKey: "brick",
        tableImageUrl: "/images/banner/banner-hero-01.png",
      });
      expect(brickUrl).toBe(WALLS_STAGE_IMAGE_BRICK);
    }
  });

  it("окна — единая схема для всех проектов", () => {
    expect(resolveWindowsStageImageUrl()).toBe(WINDOWS_STAGE_IMAGE_ALL);
  });

  it("на окнах подставляет привязку вместо заглушки баннера", () => {
    for (const floors of [1, 1.5, 2] as const) {
      for (const tierKey of ["gas", "ceramic", "brick"] as const) {
        const url = resolveStageDisplayImageUrl({
          stageId: "windows",
          floors,
          tierKey,
          tableImageUrl: "/images/banner/banner-hero-01.png",
          coverImageUrl: "/images/project-cover.jpg",
        });
        expect(url).toBe(WINDOWS_STAGE_IMAGE_ALL);
      }
    }
  });

  it("двери — единая схема для всех проектов", () => {
    expect(resolveDoorsStageImageUrl()).toBe(DOORS_STAGE_IMAGE_ALL);
  });

  it("на дверях подставляет привязку вместо заглушки баннера", () => {
    for (const floors of [1, 1.5, 2] as const) {
      for (const tierKey of ["gas", "ceramic", "brick"] as const) {
        const url = resolveStageDisplayImageUrl({
          stageId: "doors",
          floors,
          tierKey,
          tableImageUrl: "/images/banner/banner-hero-01.png",
          coverImageUrl: "/images/project-cover.jpg",
        });
        expect(url).toBe(DOORS_STAGE_IMAGE_ALL);
      }
    }
  });
});
