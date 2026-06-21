import { describe, expect, it } from "vitest";
import {
  getKnownServiceSeoSlugs,
  getServicePageMetaSeeds,
  getServiceSeoBySlug,
} from "@/lib/seo/service-seo-defaults";

describe("service SEO semantic defaults", () => {
  it("keeps every core service landing in the semantic core", () => {
    expect(getKnownServiceSeoSlugs().sort()).toEqual(
      ["fundament", "inzheneriya", "karkas", "krovlya", "otdelka", "proektirovanie"].sort()
    );
  });

  it("returns commercially focused metadata for known service slugs", () => {
    const seo = getServiceSeoBySlug("fundament");

    expect(seo?.title).toContain("Фундамент под ключ");
    expect(seo?.description).toContain("Фундамент для загородного дома");
    expect(seo?.keywords).toEqual(expect.arrayContaining(["фундамент для дома", "строительство фундамента"]));
  });

  it("seeds the services index and each known service page without overwriting admin edits later", () => {
    const seeds = getServicePageMetaSeeds();
    const paths = seeds.map((row) => row.path);

    expect(paths).toContain("/services");
    expect(paths).toContain("/services/proektirovanie");
    expect(paths).toContain("/services/fundament");
    expect(new Set(paths).size).toBe(paths.length);
  });
});
