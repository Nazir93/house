import { describe, expect, it } from "vitest";

import { getProjectCatalogSliceSeoPages } from "@/lib/seo/project-catalog-slice-seo";
import { getProjectMaterialSeoPages } from "@/lib/seo/project-material-seo";
import {
  isProjectMaterialSeoSlug,
  normalizeProjectsCatalogMaterialParam,
  projectsCatalogHasFilterQuery,
  projectsCatalogMaterialOnlyHref,
  resolveProjectsCatalogFilterSeoAction,
  sitemapUrlHasDisallowedQuery,
} from "@/lib/seo/projects-catalog-filter-indexing";

describe("projects-catalog-filter-indexing (SEO §9)", () => {
  it("хаб без query индексируется", () => {
    expect(resolveProjectsCatalogFilterSeoAction({}, "/projects")).toEqual({
      canonicalPath: "/projects",
      noindex: false,
      redirectTo: null,
    });
    expect(projectsCatalogHasFilterQuery({})).toBe(false);
  });

  it("только material → каталог с фильтром (noindex), без редиректа на коммерческую ЧПУ", () => {
    const action = resolveProjectsCatalogFilterSeoAction({ material: "gazobeton" }, "/projects");
    expect(action).toEqual({
      canonicalPath: "/projects",
      noindex: true,
      redirectTo: null,
    });

    expect(resolveProjectsCatalogFilterSeoAction({ material: "gasobeton" }, "/projects").redirectTo).toBeNull();
    expect(normalizeProjectsCatalogMaterialParam("gasobeton")).toBe("gazobeton");
    expect(normalizeProjectsCatalogMaterialParam("kirpich")).toBe("kirpich");
    expect(isProjectMaterialSeoSlug("keramoblok")).toBe(true);
  });

  it("комбинации GET → noindex + canonical на /projects", () => {
    const action = resolveProjectsCatalogFilterSeoAction(
      { material: "gazobeton", floors: "2" },
      "/projects",
    );
    expect(action).toEqual({
      canonicalPath: "/projects",
      noindex: true,
      redirectTo: null,
    });
    expect(
      resolveProjectsCatalogFilterSeoAction({ floors: "1", sort: "area" }, "/projects").noindex,
    ).toBe(true);
  });

  it("typical-projects: GET не редиректит на material ЧПУ, комбинации noindex", () => {
    expect(resolveProjectsCatalogFilterSeoAction({ material: "kirpich" }, "/typical-projects")).toEqual({
      canonicalPath: "/typical-projects",
      noindex: true,
      redirectTo: null,
    });
  });

  it("UI: только материал остаётся в каталоге (?material=), не уводит на ЧПУ", () => {
    expect(
      projectsCatalogMaterialOnlyHref("/projects", "gazobeton", {
        floors: "all",
        q: "",
        sort: "price",
        rangeCustom: false,
      }),
    ).toBeNull();
    expect(
      projectsCatalogMaterialOnlyHref("/projects", "gazobeton", {
        floors: "2",
        q: "",
        sort: "price",
        rangeCustom: false,
      }),
    ).toBeNull();
  });

  it("SEO-срезы — отдельные ЧПУ; sitemap без query", () => {
    expect(getProjectMaterialSeoPages().map((p) => p.path)).toEqual([
      "/projects/gazobeton",
      "/projects/kirpich",
      "/projects/keramoblok",
    ]);
    for (const page of [...getProjectMaterialSeoPages(), ...getProjectCatalogSliceSeoPages()]) {
      expect(page.path).not.toContain("?");
      expect(sitemapUrlHasDisallowedQuery(`https://chastdushi.ru${page.path}`)).toBe(false);
    }
    expect(sitemapUrlHasDisallowedQuery("https://chastdushi.ru/projects?material=gazobeton")).toBe(true);
  });
});
