import { describe, expect, it } from "vitest";
import {
  CONSTRUCTION_STAGE_GLYPHS,
  resolveConstructionStageGlyphKey,
} from "@/components/account/construction-stage-glyphs";

describe("construction-stage-glyphs", () => {
  it("все ключи пикера имеют глиф", () => {
    const keys = [
      "foundation",
      "walls",
      "roof",
      "windows",
      "engineering",
      "facade",
      "interior",
      "landscaping",
      "electric",
      "water",
      "ventilation",
      "floor-heating",
      "radiators",
      "boiler",
      "septic",
      "well",
      "driveway",
      "retaining-wall",
      "landscape-plan",
    ] as const;

    for (const key of keys) {
      expect(CONSTRUCTION_STAGE_GLYPHS[key]).toBeTypeOf("function");
    }
  });

  it("resolveConstructionStageGlyphKey — legacy alias", () => {
    expect(resolveConstructionStageGlyphKey("finish")).toBe("finish");
    expect(resolveConstructionStageGlyphKey("unknown")).toBe("default");
  });
});
