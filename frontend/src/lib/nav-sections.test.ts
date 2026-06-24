import { describe, expect, it } from "vitest";
import { NAV_SECTIONS } from "@/lib/nav-sections";
import { BUILT_HOMES_SECTION_LABEL } from "@/lib/constants";

describe("nav-sections", () => {
  it("раздел построенных домов в меню называется «Построенные дома»", () => {
    const section = NAV_SECTIONS.find((item) => item.items.some((link) => "href" in link && link.href === "/portfolio"));
    expect(section?.label).toBe(BUILT_HOMES_SECTION_LABEL);
  });
});
