import { describe, expect, it } from "vitest";

import { getCommercialPageSeo } from "@/lib/seo/commercial-page-seo";
import { buildGeneralContractorJsonLd } from "@/lib/seo/general-contractor-json-ld";
import { listCurrentSeoCanonicalPaths } from "@/lib/seo/indexed-url-stability";
import { authorProjectsAfterCatalogPlainText } from "@/lib/seo/project-catalog-hub-seo";
import { getProjectCatalogSliceSeoPages } from "@/lib/seo/project-catalog-slice-seo";
import { getMaterialCommercialLanding } from "@/lib/seo/project-material-commercial";
import { getProjectMaterialSeoPages } from "@/lib/seo/project-material-seo";
import {
  FORBIDDEN_SEO_MASKING_MARKERS,
  MAX_AUTO_GEO_LANDING_PAGES,
  MAX_H1_PER_INDEXABLE_PAGE,
  SEO_PROHIBITIONS,
  classOrStyleLooksLikeSeoMasking,
  filterComboIndexingAllowed,
  findNearDuplicateSeoBodyPairs,
  indexedUrlRenameAllowed,
  isForbiddenMassGeoLandingPath,
  listSeoProhibitionIds,
  looksLikeCommaSeparatedKeywordList,
  schemaHasFakeReviewsOrRating,
  seoBodiesAreNearDuplicates,
  seoTextSimilarityRatio,
} from "@/lib/seo/seo-prohibitions";

describe("seo-prohibitions (ТЗ SEO §26)", () => {
  it("чеклист из 9 запретов зафиксирован", () => {
    expect(listSeoProhibitionIds()).toEqual([
      "hidden_seo_text",
      "white_on_white",
      "mass_geo_pages",
      "duplicate_seo_bodies",
      "comma_keyword_lists",
      "multiple_h1",
      "index_all_filters",
      "rename_indexed_url_without_301",
      "fake_schema_reviews",
    ]);
    expect(SEO_PROHIBITIONS).toHaveLength(9);
    expect(MAX_H1_PER_INDEXABLE_PAGE).toBe(1);
    expect(MAX_AUTO_GEO_LANDING_PAGES).toBe(0);
    expect(FORBIDDEN_SEO_MASKING_MARKERS.length).toBeGreaterThan(3);
  });

  it("детектор перечисления ключей через запятую", () => {
    expect(
      looksLikeCommaSeparatedKeywordList(
        "строительство домов, дом под ключ, газобетон, кирпич, керамоблок, смета",
      ),
    ).toBe(true);
    expect(
      looksLikeCommaSeparatedKeywordList(
        "Строим частные дома под ключ. Газобетон, кирпич и керамоблок — в каталоге проектов.",
      ),
    ).toBe(false);
  });

  it("видимые SEO-блоки сайта не выглядят как список ключей", () => {
    const samples = [
      getCommercialPageSeo("home").h1,
      getCommercialPageSeo("home").intro,
      getCommercialPageSeo("home").description,
      authorProjectsAfterCatalogPlainText(),
      ...getProjectMaterialSeoPages().flatMap((p) => [p.h1, p.intro, p.description]),
      ...getProjectCatalogSliceSeoPages().flatMap((p) => [p.h1, p.intro, p.description]),
    ];
    for (const sample of samples) {
      expect(looksLikeCommaSeparatedKeywordList(sample), sample.slice(0, 80)).toBe(false);
    }
  });

  it("длинные SEO-тексты разных страниц не near-duplicate", () => {
    const bodies: Array<{ id: string; text: string }> = [
      { id: "home-intro", text: getCommercialPageSeo("home").intro },
      { id: "projects-after-catalog", text: authorProjectsAfterCatalogPlainText() },
    ];
    for (const page of getProjectMaterialSeoPages()) {
      bodies.push({ id: `${page.slug}-intro`, text: page.intro });
      bodies.push({ id: `${page.slug}-description`, text: page.description });
      const commercial = getMaterialCommercialLanding(page.slug);
      if (commercial) {
        bodies.push({ id: `${page.slug}-hero`, text: commercial.heroLead });
        bodies.push({ id: `${page.slug}-wall`, text: commercial.wallTech.lead });
      }
    }
    for (const slice of getProjectCatalogSliceSeoPages()) {
      bodies.push({ id: `slice-${slice.slug}-intro`, text: slice.intro });
    }

    const dupes = findNearDuplicateSeoBodyPairs(bodies);
    expect(dupes, JSON.stringify(dupes)).toEqual([]);
  });

  it("similarity helpers: identical long text vs разный", () => {
    const longA =
      "Строительство домов из газобетона под ключ в Санкт-Петербурге и области. Проекты, смета, технология стены и реальные объекты компании для постоянного проживания семьи.";
    const longB =
      "Строительство домов из газобетона под ключ в Санкт-Петербурге и области. Проекты, смета, технология стены и реальные объекты компании для постоянного проживания семьи.";
    const longC =
      "Калькулятор считает ориентир стоимости дома по площади, этажности, кровле и комплектации. Итог уточняется после выбора проекта и условий участка.";
    expect(seoTextSimilarityRatio(longA, longB)).toBeGreaterThan(0.95);
    expect(seoBodiesAreNearDuplicates(longA, longB)).toBe(true);
    expect(seoBodiesAreNearDuplicates(longA, longC)).toBe(false);
  });

  it("нет mass GEO путей среди текущих SEO-канонов", () => {
    for (const path of listCurrentSeoCanonicalPaths()) {
      expect(isForbiddenMassGeoLandingPath(path), path).toBe(false);
    }
    expect(isForbiddenMassGeoLandingPath("/geo/vsevolozhsk")).toBe(true);
    expect(isForbiddenMassGeoLandingPath("/vsevolozhsk")).toBe(true);
    expect(isForbiddenMassGeoLandingPath("/projects/gazobeton")).toBe(false);
  });

  it("комбинации фильтров не индексируются; хаб — да", () => {
    expect(filterComboIndexingAllowed({})).toBe(true);
    expect(filterComboIndexingAllowed({ floors: "1", sort: "area" })).toBe(false);
  });

  it("смена protected URL без 301 запрещена; Schema без фейков", () => {
    expect(indexedUrlRenameAllowed("/projects", "/proekty-domov", {})).toBe(false);
    expect(
      indexedUrlRenameAllowed("/projects", "/proekty-domov", {
        "/projects": { toPath: "/proekty-domov", permanent: true },
      }),
    ).toBe(true);

    const schema = buildGeneralContractorJsonLd({
      phone: "+7 (812) 989-99-01",
      email: "info@chastdushi.ru",
      address: "ул. Ординарная, д. 18",
      includeDescription: false,
      includeOpeningHours: false,
      includeAreaServed: false,
      sameAs: [],
    }) as unknown as Record<string, unknown>;
    expect(schemaHasFakeReviewsOrRating(schema)).toBe(false);
    expect(schemaHasFakeReviewsOrRating({ ...schema, aggregateRating: { ratingValue: 5 } })).toBe(
      true,
    );
  });

  it("маскирующие маркеры для скрытого SEO ловятся", () => {
    expect(classOrStyleLooksLikeSeoMasking("seo-hidden text-sm")).toBe(true);
    expect(classOrStyleLooksLikeSeoMasking("left-[-9999px]")).toBe(true);
    expect(classOrStyleLooksLikeSeoMasking("text-muted leading-relaxed")).toBe(false);
  });
});
