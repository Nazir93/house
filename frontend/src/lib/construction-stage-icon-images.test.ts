import { describe, expect, it } from "vitest";

import {
  CONSTRUCTION_STAGE_ICON_IMAGES,
  hasConstructionStageImageIcon,
  resolveConstructionStageIconSrc,
} from "@/lib/construction-stage-icon-images";

describe("construction-stage-icon-images", () => {
  it("фундамент — две темы в public/images/stage-icons", () => {
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.foundation.light).toBe(
      "/images/stage-icons/foundation-light.png",
    );
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.foundation.dark).toBe(
      "/images/stage-icons/foundation-dark.png",
    );
  });

  it("hasConstructionStageImageIcon", () => {
    expect(hasConstructionStageImageIcon("foundation")).toBe(true);
    expect(hasConstructionStageImageIcon("walls")).toBe(true);
    expect(hasConstructionStageImageIcon("windows")).toBe(true);
    expect(hasConstructionStageImageIcon("roof")).toBe(true);
    expect(hasConstructionStageImageIcon("interior")).toBe(true);
    expect(hasConstructionStageImageIcon("landscaping")).toBe(true);
    expect(hasConstructionStageImageIcon("engineering")).toBe(true);
    expect(hasConstructionStageImageIcon("facade")).toBe(true);
    expect(hasConstructionStageImageIcon("doors")).toBe(false);
  });

  it("стены — две темы в public/images/stage-icons", () => {
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.walls.light).toBe("/images/stage-icons/walls-light.png");
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.walls.dark).toBe("/images/stage-icons/walls-dark.png");
    expect(hasConstructionStageImageIcon("walls")).toBe(true);
  });

  it("окна — две темы в public/images/stage-icons", () => {
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.windows.light).toBe("/images/stage-icons/windows-light.png");
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.windows.dark).toBe("/images/stage-icons/windows-dark.png");
    expect(hasConstructionStageImageIcon("windows")).toBe(true);
  });

  it("кровля — две темы в public/images/stage-icons", () => {
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.roof.light).toBe("/images/stage-icons/roof-light.png");
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.roof.dark).toBe("/images/stage-icons/roof-dark.png");
    expect(hasConstructionStageImageIcon("roof")).toBe(true);
  });

  it("внутренняя отделка — две темы в public/images/stage-icons", () => {
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.interior.light).toBe("/images/stage-icons/interior-light.png");
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.interior.dark).toBe("/images/stage-icons/interior-dark.png");
    expect(hasConstructionStageImageIcon("interior")).toBe(true);
  });

  it("благоустройство — две темы в public/images/stage-icons", () => {
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.landscaping.light).toBe(
      "/images/stage-icons/landscaping-light.png",
    );
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.landscaping.dark).toBe(
      "/images/stage-icons/landscaping-dark.png",
    );
    expect(hasConstructionStageImageIcon("landscaping")).toBe(true);
  });

  it("инженерные сети — две темы в public/images/stage-icons", () => {
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.engineering.light).toBe(
      "/images/stage-icons/engineering-light.png",
    );
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.engineering.dark).toBe(
      "/images/stage-icons/engineering-dark.png",
    );
    expect(hasConstructionStageImageIcon("engineering")).toBe(true);
  });

  it("отделка фасада — две темы в public/images/stage-icons", () => {
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.facade.light).toBe("/images/stage-icons/facade-light.png");
    expect(CONSTRUCTION_STAGE_ICON_IMAGES.facade.dark).toBe("/images/stage-icons/facade-dark.png");
    expect(hasConstructionStageImageIcon("facade")).toBe(true);
  });

  it("resolveConstructionStageIconSrc — светлая/тёмная тема и акцент", () => {
    expect(resolveConstructionStageIconSrc("foundation", "light")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.foundation.light,
    );
    expect(resolveConstructionStageIconSrc("foundation", "dark")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.foundation.dark,
    );
    expect(resolveConstructionStageIconSrc("foundation", "light", "accent")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.foundation.dark,
    );
    expect(resolveConstructionStageIconSrc("walls", "light")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.walls.light,
    );
    expect(resolveConstructionStageIconSrc("roof", "dark")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.roof.dark,
    );
    expect(resolveConstructionStageIconSrc("interior", "light")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.interior.light,
    );
    expect(resolveConstructionStageIconSrc("landscaping", "dark")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.landscaping.dark,
    );
    expect(resolveConstructionStageIconSrc("engineering", "light")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.engineering.light,
    );
    expect(resolveConstructionStageIconSrc("facade", "dark")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.facade.dark,
    );
    expect(resolveConstructionStageIconSrc("doors", "light")).toBeNull();
  });
});
