import { describe, expect, it } from "vitest";
import { cmsServiceSlugFallbackRow } from "@/lib/get-service-landing-page";

describe("cmsServiceSlugFallbackRow", () => {
  it("proektirovanie: опубликованный шаблон HOUSE_DESIGN", () => {
    const row = cmsServiceSlugFallbackRow("proektirovanie");
    expect(row).not.toBeNull();
    expect(row?.published).toBe(true);
    expect(row?.serviceType).toBe("HOUSE_DESIGN");
  });

  it("неизвестный slug → null", () => {
    expect(cmsServiceSlugFallbackRow("unknown-slug")).toBeNull();
  });
});
