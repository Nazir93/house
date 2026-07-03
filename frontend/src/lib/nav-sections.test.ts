import { describe, expect, it } from "vitest";
import { NAV_SECTIONS } from "@/lib/nav-sections";
import { BUILT_HOMES_SECTION_LABEL, UNDER_CONSTRUCTION_SECTION_LABEL } from "@/lib/constants";

describe("nav-sections", () => {
  it("раздел построенных домов в меню называется «Построенные дома»", () => {
    const section = NAV_SECTIONS.find((item) => item.items.some((link) => "href" in link && link.href === "/portfolio"));
    expect(section?.label).toBe(BUILT_HOMES_SECTION_LABEL);
  });

  it("в меню есть пункт «Строящиеся объекты»", () => {
    const section = NAV_SECTIONS.find((item) =>
      item.items.some((link) => "href" in link && link.href === "/portfolio/under-construction")
    );
    const link = section?.items.find((item) => "href" in item && item.href === "/portfolio/under-construction");
    expect(link && "label" in link ? link.label : "").toBe(UNDER_CONSTRUCTION_SECTION_LABEL);
  });
});
