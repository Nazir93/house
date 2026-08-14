import { describe, expect, it } from "vitest";

import {
  SEO_ACCEPTANCE_CRITERIA,
  findDuplicateSeoAcceptanceFields,
  listSeoAcceptanceRedirectExpectations,
  listSeoAcceptanceTargets,
  seoAcceptanceInterlinkCoverage,
  seoAcceptanceMetrikaGoalsReady,
} from "@/lib/seo/seo-acceptance";

describe("seo-acceptance (ТЗ SEO §28)", () => {
  it("целевые URL: главная, /projects, proektirovanie + 3 материала", () => {
    const paths = listSeoAcceptanceTargets().map((t) => t.path);
    expect(paths).toEqual([
      "/",
      "/projects",
      "/projects/gazobeton",
      "/projects/kirpich",
      "/projects/keramoblok",
      "/services/proektirovanie",
    ]);
    expect(listSeoAcceptanceTargets().every((t) => t.indexable && t.inSitemap)).toBe(true);
  });

  it("Title / Description / H1 уникальны между целевыми страницами (код)", () => {
    expect(findDuplicateSeoAcceptanceFields()).toEqual([]);
  });

  it("критерии приёмки зафиксированы", () => {
    expect(SEO_ACCEPTANCE_CRITERIA.map((c) => c.id)).toEqual([
      "unique_title_description_h1",
      "seo_content_in_html",
      "canonical_self",
      "mirrors_and_duplicates",
      "targets_in_sitemap",
      "html_interlinking",
      "http_200_targets",
      "metrika_conversions",
    ]);
  });

  it("редиректы и перелинковка / метрика готовы в коде", () => {
    const redirects = listSeoAcceptanceRedirectExpectations();
    expect(redirects.some((r) => r.from.includes("частьдуши.рф"))).toBe(true);
    expect(redirects.some((r) => r.from.includes("stroitelstvo-domov-iz-gazobetona"))).toBe(true);

    const links = seoAcceptanceInterlinkCoverage();
    expect(links.homeHrefs).toEqual(
      expect.arrayContaining([
        "/projects/gazobeton",
        "/projects",
        "/portfolio",
        "/services/proektirovanie",
      ]),
    );
    expect(links.projectsHubHrefs).toContain("/calculator");

    const metrika = seoAcceptanceMetrikaGoalsReady();
    expect(metrika.allGoalIdsIncludeWired).toBe(true);
    expect(metrika.wiredTzGoals).toEqual(
      expect.arrayContaining(["form_submit", "calculate_start", "phone_click"]),
    );
  });
});
