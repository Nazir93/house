import { describe, expect, it } from "vitest";

import { HOME_FEATURED_PROJECTS_INTRO } from "@/lib/home-featured-projects-section";

describe("home-featured-projects-section", () => {
  it("вводный текст секции «Популярные проекты» на главной", () => {
    expect(HOME_FEATURED_PROJECTS_INTRO).toContain("Готовые и индивидуальные проекты домов");
    expect(HOME_FEATURED_PROJECTS_INTRO).toContain("материал строительства");
    expect(HOME_FEATURED_PROJECTS_INTRO).not.toContain("500+");
  });
});
