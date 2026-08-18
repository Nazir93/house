import { describe, expect, it } from "vitest";

import { PAGE_LEAD_CLASSNAME, SECTION_LEAD_CLASSNAME } from "@/lib/responsive-copy";

describe("responsive-copy", () => {
  it("лиды открываются на lg, на мобиле/планшете остаются с max-w", () => {
    expect(SECTION_LEAD_CLASSNAME).toContain("max-w-2xl");
    expect(SECTION_LEAD_CLASSNAME).toContain("sm:max-w-3xl");
    expect(SECTION_LEAD_CLASSNAME).toContain("lg:max-w-none");
    expect(PAGE_LEAD_CLASSNAME).toContain("md:max-w-4xl");
    expect(PAGE_LEAD_CLASSNAME).toContain("lg:max-w-none");
  });
});
