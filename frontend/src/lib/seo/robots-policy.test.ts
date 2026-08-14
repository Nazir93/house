import { describe, expect, it } from "vitest";

import {
  buildRobotsTxtBody,
  isForbiddenRobotsDisallowPath,
  listDefaultRobotsDisallow,
  listProjectsCatalogCleanParamLines,
  sanitizeRobotsDisallowPaths,
} from "@/lib/seo/robots-policy";
import { PROJECTS_CATALOG_FILTER_QUERY_KEYS } from "@/lib/seo/projects-catalog-filter-indexing";

describe("robots-policy (ТЗ SEO §16)", () => {
  it("не запрещает основные URL и параметрические дубли через Disallow", () => {
    expect(isForbiddenRobotsDisallowPath("/")).toBe(true);
    expect(isForbiddenRobotsDisallowPath("/projects")).toBe(true);
    expect(isForbiddenRobotsDisallowPath("/projects/")).toBe(true);
    expect(isForbiddenRobotsDisallowPath("/projects/*")).toBe(true);
    expect(isForbiddenRobotsDisallowPath("/*?*")).toBe(true);
    expect(isForbiddenRobotsDisallowPath("/projects?*")).toBe(true);
    expect(isForbiddenRobotsDisallowPath("/*?material=")).toBe(true);
    expect(isForbiddenRobotsDisallowPath("/services")).toBe(true);
  });

  it("разрешает Disallow только техническим путям", () => {
    for (const path of listDefaultRobotsDisallow()) {
      expect(isForbiddenRobotsDisallowPath(path)).toBe(false);
    }
    expect(sanitizeRobotsDisallowPaths(["/admin/", "/*?*", "/projects", "/lp/"])).toEqual([
      "/admin/",
      "/lp/",
    ]);
  });

  it("Clean-param покрывает ключи фильтров каталога, без Disallow этих ключей", () => {
    const lines = listProjectsCatalogCleanParamLines();
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^Clean-param: .+ \/projects$/);
    expect(lines[1]).toMatch(/^Clean-param: .+ \/typical-projects$/);
    for (const key of PROJECTS_CATALOG_FILTER_QUERY_KEYS) {
      expect(lines[0]).toContain(key);
    }
  });

  it("buildRobotsTxtBody: Allow /, тех. Disallow, Clean-param, канон Host/Sitemap", () => {
    const body = buildRobotsTxtBody({ siteUrl: "https://chastdushi.ru" });
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /admin/");
    expect(body).toContain("Disallow: /lp/");
    expect(body).toContain("Disallow: /account/");
    expect(body).not.toMatch(/Disallow: \/\*\?\*/);
    expect(body).not.toMatch(/Disallow: \/projects\?/);
    expect(body).toContain("Clean-param:");
    expect(body).toContain("Host: chastdushi.ru");
    expect(body).toContain("Sitemap: https://chastdushi.ru/sitemap.xml");
  });

  it("кастомный robots из админки: вырезает опасный Disallow, сохраняет Clean-param", () => {
    const body = buildRobotsTxtBody({
      siteUrl: "https://chastdushi.ru",
      customRules: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /*?*
Disallow: /projects
Disallow: /lp/
Host: evil.example
Sitemap: https://evil.example/sitemap.xml`,
    });
    expect(body).toContain("Disallow: /admin/");
    expect(body).toContain("Disallow: /lp/");
    expect(body).not.toContain("Disallow: /*?*");
    expect(body).not.toContain("Disallow: /projects");
    expect(body).toContain("Clean-param:");
    expect(body).toContain("Host: chastdushi.ru");
    expect(body).not.toContain("evil.example");
  });
});
