import { describe, expect, it } from "vitest";

import {
  finalizePublicSitemapEntries,
  isSitemapTechnicalPath,
  listStaticPublicSitemapPaths,
  normalizePublicSitemapUrl,
} from "@/lib/seo/public-sitemap";
import { getProjectCatalogSliceSeoPages } from "@/lib/seo/project-catalog-slice-seo";
import { getProjectMaterialSeoPages } from "@/lib/seo/project-material-seo";
import { getKnownServiceSeoSlugs } from "@/lib/seo/service-seo-defaults";

describe("public-sitemap (ТЗ SEO §15)", () => {
  it("нормализует канон: главная со /, без GET и без зеркала", () => {
    expect(normalizePublicSitemapUrl("https://chastdushi.ru")).toBe("https://chastdushi.ru/");
    expect(normalizePublicSitemapUrl("https://chastdushi.ru/")).toBe("https://chastdushi.ru/");
    expect(normalizePublicSitemapUrl("https://chastdushi.ru/projects")).toBe(
      "https://chastdushi.ru/projects",
    );
    expect(normalizePublicSitemapUrl("https://chastdushi.ru/projects?material=kirpich")).toBeNull();
    expect(normalizePublicSitemapUrl("https://xn--80aim8afhxn7a.xn--p1ai/projects")).toBeNull();
    expect(normalizePublicSitemapUrl("https://www.chastdushi.ru/about")).toBeNull();
  });

  it("режет технические URL", () => {
    expect(isSitemapTechnicalPath("/lp/kirpich")).toBe(true);
    expect(isSitemapTechnicalPath("/admin/seo")).toBe(true);
    expect(isSitemapTechnicalPath("/api/leads")).toBe(true);
    expect(isSitemapTechnicalPath("/account")).toBe(true);
    expect(isSitemapTechnicalPath("/projects/compare")).toBe(true);
    expect(isSitemapTechnicalPath("/projects/gazobeton")).toBe(false);
    expect(
      normalizePublicSitemapUrl("https://chastdushi.ru/lp/gazobeton"),
    ).toBeNull();
  });

  it("дедуп + excludePaths (noindex / 301 источники)", () => {
    const out = finalizePublicSitemapEntries(
      [
        { url: "https://chastdushi.ru/projects" },
        { url: "https://chastdushi.ru/projects/" },
        { url: "https://chastdushi.ru/projects?sort=price" },
        { url: "https://chastdushi.ru/lp/kirpich" },
        { url: "https://chastdushi.ru/about" },
      ],
      { excludePaths: ["/about"] },
    );
    expect(out.map((e) => e.url)).toEqual(["https://chastdushi.ru/projects"]);
  });

  it("материал/срезы/услуги — отдельные ЧПУ в sitemap-кандидатах, без stroitelstvo-*", () => {
    const material = getProjectMaterialSeoPages().map((p) => p.path);
    const slices = getProjectCatalogSliceSeoPages().map((p) => p.path);
    expect(material).toEqual(["/projects/gazobeton", "/projects/kirpich", "/projects/keramoblok"]);
    expect(slices).toEqual(
      expect.arrayContaining([
        "/projects/odnoetazhnye",
        "/projects/dvuhetazhnye",
        "/projects/do-150-m2",
        "/projects/150-220-m2",
      ]),
    );
    expect(getKnownServiceSeoSlugs()).toContain("proektirovanie");
    expect([...material, ...slices].join(" ")).not.toMatch(/stroitelstvo/);

    const entries = finalizePublicSitemapEntries([
      ...listStaticPublicSitemapPaths().map((path) => ({
        url: path === "/" ? "https://chastdushi.ru/" : `https://chastdushi.ru${path}`,
      })),
      ...material.map((path) => ({ url: `https://chastdushi.ru${path}` })),
      ...slices.map((path) => ({ url: `https://chastdushi.ru${path}` })),
    ]);
    expect(entries.some((e) => e.url.endsWith("/projects/gazobeton"))).toBe(true);
    expect(entries.some((e) => e.url.includes("?"))).toBe(false);
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
  });
});
