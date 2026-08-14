import { describe, expect, it } from "vitest";
import {
  getProjectMaterialPageMetaSeeds,
  getProjectMaterialSeo,
  getProjectMaterialSeoPages,
  getProjectMaterialSeoSlugs,
} from "@/lib/seo/project-material-seo";

describe("project material SEO semantic core", () => {
  it("keeps the material clusters confirmed by old advertising data", () => {
    expect(getProjectMaterialSeoSlugs().sort()).toEqual(["gazobeton", "keramoblok", "kirpich"].sort());
  });

  it("maps every material landing to a stable projects URL and catalog material filter", () => {
    expect(getProjectMaterialSeo("gazobeton")).toMatchObject({
      path: "/projects/gazobeton",
      material: "gazobeton",
    });
    expect(getProjectMaterialSeo("kirpich")?.keywords).toEqual(
      expect.arrayContaining([
        "строительство домов из кирпича",
        "кирпичный дом под ключ",
        "построить кирпичный дом",
      ]),
    );
    expect(getProjectMaterialSeo("keramoblok")?.keywords).toEqual(
      expect.arrayContaining(["строительство домов из керамоблока", "дом из керамоблока"]),
    );
  });

  it("creates unique PageMeta seeds for all material landing pages", () => {
    const seeds = getProjectMaterialPageMetaSeeds();
    const paths = seeds.map((seed) => seed.path);

    expect(paths).toEqual(expect.arrayContaining(["/projects/gazobeton", "/projects/kirpich", "/projects/keramoblok"]));
    expect(new Set(paths).size).toBe(paths.length);
    expect(getProjectMaterialSeoPages().every((page) => page.faq.length >= 3)).toBe(true);
  });
});
