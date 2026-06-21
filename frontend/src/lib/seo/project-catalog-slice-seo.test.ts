import { describe, expect, it } from "vitest";
import {
  getProjectCatalogSlicePageMetaSeeds,
  getProjectCatalogSliceSeo,
  getProjectCatalogSliceSeoPages,
  getProjectCatalogSliceSeoSlugs,
} from "@/lib/seo/project-catalog-slice-seo";

describe("project catalog slice SEO core", () => {
  it("keeps the floor-based catalog landings from the semantic plan", () => {
    expect(getProjectCatalogSliceSeoSlugs().sort()).toEqual(
      ["150-220-m2", "do-150-m2", "dvuhetazhnye", "odnoetazhnye"].sort()
    );
  });

  it("maps floor landings to stable project URLs and catalog filters", () => {
    expect(getProjectCatalogSliceSeo("odnoetazhnye")).toMatchObject({
      path: "/projects/odnoetazhnye",
      filters: { floors: "1" },
    });
    expect(getProjectCatalogSliceSeo("dvuhetazhnye")).toMatchObject({
      path: "/projects/dvuhetazhnye",
      filters: { floors: "2" },
    });
  });

  it("maps area landings to stable project URLs and area filters", () => {
    expect(getProjectCatalogSliceSeo("do-150-m2")).toMatchObject({
      path: "/projects/do-150-m2",
      filters: { areaMax: 150 },
    });
    expect(getProjectCatalogSliceSeo("150-220-m2")).toMatchObject({
      path: "/projects/150-220-m2",
      filters: { areaMin: 150, areaMax: 220 },
    });
  });

  it("creates unique PageMeta seeds with FAQ coverage", () => {
    const seeds = getProjectCatalogSlicePageMetaSeeds();
    const paths = seeds.map((seed) => seed.path);

    expect(paths).toEqual(
      expect.arrayContaining([
        "/projects/odnoetazhnye",
        "/projects/dvuhetazhnye",
        "/projects/do-150-m2",
        "/projects/150-220-m2",
      ])
    );
    expect(new Set(paths).size).toBe(paths.length);
    expect(getProjectCatalogSliceSeoPages().every((page) => page.faq.length >= 3)).toBe(true);
  });
});
