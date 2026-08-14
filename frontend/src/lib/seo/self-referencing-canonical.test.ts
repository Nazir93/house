import { describe, expect, it } from "vitest";

import {
  buildSelfReferencingCanonical,
  stripSeoPathQuery,
} from "@/lib/seo/self-referencing-canonical";

describe("self-referencing-canonical (ТЗ SEO §13)", () => {
  const site = "https://chastdushi.ru";

  it("главная — self-canonical с завершающим слэшем", () => {
    expect(buildSelfReferencingCanonical("/", site)).toBe("https://chastdushi.ru/");
    expect(buildSelfReferencingCanonical("", site)).toBe("https://chastdushi.ru/");
  });

  it("основные страницы — абсолютный URL без GET", () => {
    expect(buildSelfReferencingCanonical("/projects", site)).toBe("https://chastdushi.ru/projects");
    expect(buildSelfReferencingCanonical("/projects/", site)).toBe("https://chastdushi.ru/projects");
    expect(buildSelfReferencingCanonical("/projects/gazobeton", site)).toBe(
      "https://chastdushi.ru/projects/gazobeton",
    );
    expect(buildSelfReferencingCanonical("/projects/kirpich", site)).toBe(
      "https://chastdushi.ru/projects/kirpich",
    );
    expect(buildSelfReferencingCanonical("/calculator", site)).toBe("https://chastdushi.ru/calculator");
  });

  it("отрезает лишние GET и hash", () => {
    expect(buildSelfReferencingCanonical("/projects?material=kirpich&floors=1", site)).toBe(
      "https://chastdushi.ru/projects",
    );
    expect(buildSelfReferencingCanonical("/projects#grid", site)).toBe("https://chastdushi.ru/projects");
    expect(
      buildSelfReferencingCanonical("https://chastdushi.ru/projects?sort=price", site),
    ).toBe("https://chastdushi.ru/projects");
  });

  it("stripSeoPathQuery отдаёт pathname для getPageMeta", () => {
    expect(stripSeoPathQuery("/")).toBe("/");
    expect(stripSeoPathQuery("/projects?foo=1")).toBe("/projects");
    expect(stripSeoPathQuery("/projects/keramoblok/")).toBe("/projects/keramoblok");
  });
});
