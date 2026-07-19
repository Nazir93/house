import { describe, expect, it } from "vitest";

import {
  CONSTRUCTION_STAGE_ICON_IMAGES,
  hasConstructionStageImageIcon,
  resolveConstructionStageIconSrc,
} from "@/lib/construction-stage-icon-images";

const CALCULATOR_STAGE_KEYS = [
  "prep",
  "foundation",
  "walls",
  "belt",
  "floors",
  "roof",
  "windows",
  "doors",
] as const;

describe("construction-stage-icon-images", () => {
  it("калькуляторные этапы — SVG light/dark в public/images/stage-icons", () => {
    for (const key of CALCULATOR_STAGE_KEYS) {
      expect(CONSTRUCTION_STAGE_ICON_IMAGES[key].light).toBe(`/images/stage-icons/${key}-light.svg`);
      expect(CONSTRUCTION_STAGE_ICON_IMAGES[key].dark).toBe(`/images/stage-icons/${key}-dark.svg`);
      expect(hasConstructionStageImageIcon(key)).toBe(true);
    }
  });

  it("hasConstructionStageImageIcon — ЛК-этапы на PNG остаются", () => {
    expect(hasConstructionStageImageIcon("interior")).toBe(true);
    expect(hasConstructionStageImageIcon("landscaping")).toBe(true);
    expect(hasConstructionStageImageIcon("engineering")).toBe(true);
    expect(hasConstructionStageImageIcon("facade")).toBe(true);
    expect(hasConstructionStageImageIcon("unknown")).toBe(false);
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
    expect(resolveConstructionStageIconSrc("prep", "light")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.prep.light,
    );
    expect(resolveConstructionStageIconSrc("doors", "dark")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.doors.dark,
    );
    expect(resolveConstructionStageIconSrc("belt", "light", "accent")).toBe(
      CONSTRUCTION_STAGE_ICON_IMAGES.belt.dark,
    );
    expect(resolveConstructionStageIconSrc("unknown", "light")).toBeNull();
  });
});
