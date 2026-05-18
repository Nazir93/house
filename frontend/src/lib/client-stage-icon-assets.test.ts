import { describe, expect, it } from "vitest";
import { resolveStageIconAssetKey, resolveStageIconAssetUrl } from "./client-stage-icon-assets";

describe("client-stage-icon-assets", () => {
  it("resolveStageIconAssetUrl — основные этапы", () => {
    expect(resolveStageIconAssetUrl("foundation")).toBe("/icons/stages/foundation.png");
    expect(resolveStageIconAssetUrl("walls")).toBe("/icons/stages/walls.png");
  });

  it("resolveStageIconAssetUrl — подэтапы наследуют родителя", () => {
    expect(resolveStageIconAssetKey("electric")).toBe("engineering");
    expect(resolveStageIconAssetUrl("driveway")).toBe("/icons/stages/landscaping.png");
  });

  it("resolveStageIconAssetUrl — неизвестный ключ", () => {
    expect(resolveStageIconAssetUrl("circle")).toBeNull();
  });
});
