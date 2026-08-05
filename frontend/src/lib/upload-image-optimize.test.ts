import { describe, expect, it } from "vitest";

import { getUploadImageOptimizeLimits } from "@/lib/upload-image-optimize";

describe("upload-image-optimize", () => {
  it("карточки/портфолио — компактный край, без 4K", () => {
    expect(getUploadImageOptimizeLimits("default")).toEqual({
      maxEdgePx: 1280,
      webpQuality: 75,
    });
  });

  it("главный баннер (hero) — прежние лимиты 3840 / q88", () => {
    expect(getUploadImageOptimizeLimits("hero")).toEqual({
      maxEdgePx: 3840,
      webpQuality: 88,
    });
  });
});
