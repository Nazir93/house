import { describe, expect, it } from "vitest";
import { ABOUT_FOUNDER, ABOUT_VALUES } from "@/lib/about-page-copy";

describe("about-page-copy", () => {
  it("CTA links from TZ", () => {
    expect(ABOUT_FOUNDER.ctas.map((c) => c.href)).toEqual(["/projects", "/portfolio", "/contacts"]);
  });

  it("four values from TZ", () => {
    expect(ABOUT_VALUES.items).toHaveLength(4);
    expect(ABOUT_VALUES.items.map((v) => v.title)).toContain("Продуманность");
  });
});
