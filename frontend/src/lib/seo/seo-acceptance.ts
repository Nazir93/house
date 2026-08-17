/**
 * Приёмка этапа 1 SEO (ТЗ §28).
 * Целевые URL + критерии. Живые HTTP/meta — в `docs/seo-execution/ACCEPTANCE.md`.
 */

import { getCommercialPageSeo } from "@/lib/seo/commercial-page-seo";
import { getAuthorProjectsCatalogSeo } from "@/lib/seo/project-catalog-hub-seo";
import { getProjectMaterialSeo } from "@/lib/seo/project-material-seo";
import { getServiceSeoBySlug } from "@/lib/seo/service-seo-defaults";
import { SEO_LEGACY_PATH_REDIRECTS } from "@/lib/seo/redirect-map";
import { HOME_SEO_INTERLINKS, PROJECTS_HUB_SEO_INTERLINKS } from "@/lib/seo/seo-interlinking";
import { listWiredSeoMetrikaTzGoals } from "@/lib/seo/seo-metrika-goals";
import { METRIKA_GOAL_IDS } from "@/lib/analytics-goals";

export type SeoAcceptanceTargetId =
  | "home"
  | "projects"
  | "gazobeton"
  | "kirpich"
  | "keramoblok"
  | "proektirovanie";

export type SeoAcceptanceTarget = {
  id: SeoAcceptanceTargetId;
  path: string;
  /** Ожидаемые meta из кода (после деплоя + без перебития PageMeta). */
  title: string;
  description: string;
  h1: string;
  canonicalPath: string;
  indexable: true;
  inSitemap: true;
};

export type SeoAcceptanceCriterionId =
  | "unique_title_description_h1"
  | "seo_content_in_html"
  | "canonical_self"
  | "mirrors_and_duplicates"
  | "targets_in_sitemap"
  | "html_interlinking"
  | "http_200_targets"
  | "metrika_conversions";

export type SeoAcceptanceCriterion = {
  id: SeoAcceptanceCriterionId;
  title: string;
};

/** URL из ТЗ §28 + 3 усиленные сито-страницы материалов. */
export function listSeoAcceptanceTargets(): SeoAcceptanceTarget[] {
  const home = getCommercialPageSeo("home");
  const projects = getAuthorProjectsCatalogSeo();
  const gaz = getProjectMaterialSeo("gazobeton")!;
  const kir = getProjectMaterialSeo("kirpich")!;
  const ker = getProjectMaterialSeo("keramoblok")!;
  const pro = getServiceSeoBySlug("proektirovanie")!;

  return [
    {
      id: "home",
      path: "/",
      title: home.title,
      description: home.description,
      h1: home.h1,
      canonicalPath: "/",
      indexable: true,
      inSitemap: true,
    },
    {
      id: "projects",
      path: "/projects",
      title: projects.title,
      description: projects.description,
      h1: projects.h1,
      canonicalPath: "/projects",
      indexable: true,
      inSitemap: true,
    },
    {
      id: "gazobeton",
      path: "/projects/gazobeton",
      title: gaz.title,
      description: gaz.description,
      h1: gaz.h1,
      canonicalPath: "/projects/gazobeton",
      indexable: true,
      inSitemap: true,
    },
    {
      id: "kirpich",
      path: "/projects/kirpich",
      title: kir.title,
      description: kir.description,
      h1: kir.h1,
      canonicalPath: "/projects/kirpich",
      indexable: true,
      inSitemap: true,
    },
    {
      id: "keramoblok",
      path: "/projects/keramoblok",
      title: ker.title,
      description: ker.description,
      h1: ker.h1,
      canonicalPath: "/projects/keramoblok",
      indexable: true,
      inSitemap: true,
    },
    {
      id: "proektirovanie",
      path: "/services/proektirovanie",
      title: pro.title,
      description: pro.description,
      h1: pro.h1,
      canonicalPath: "/services/proektirovanie",
      indexable: true,
      inSitemap: true,
    },
  ];
}

export const SEO_ACCEPTANCE_CRITERIA: readonly SeoAcceptanceCriterion[] = [
  {
    id: "unique_title_description_h1",
    title: "У каждой целевой страницы уникальные Title / Description / H1",
  },
  {
    id: "seo_content_in_html",
    title: "SEO-критичный контент присутствует в HTML (SSR)",
  },
  {
    id: "canonical_self",
    title: "Canonical self-referencing без GET",
  },
  {
    id: "mirrors_and_duplicates",
    title: "Дубли и зеркало обработаны (www / .рф / legacy)",
  },
  {
    id: "targets_in_sitemap",
    title: "Целевые страницы в sitemap",
  },
  {
    id: "html_interlinking",
    title: "Перелинковка обычными HTML-ссылками на каноны",
  },
  {
    id: "http_200_targets",
    title: "Яндекс получает целевые страницы с HTTP 200",
  },
  {
    id: "metrika_conversions",
    title: "Метрика фиксирует основные конверсии",
  },
] as const;

export function findDuplicateSeoAcceptanceFields(
  targets: ReadonlyArray<SeoAcceptanceTarget> = listSeoAcceptanceTargets(),
): { field: "title" | "description" | "h1"; value: string; ids: string[] }[] {
  const fields: Array<"title" | "description" | "h1"> = ["title", "description", "h1"];
  const dups: { field: "title" | "description" | "h1"; value: string; ids: string[] }[] = [];
  for (const field of fields) {
    const map = new Map<string, string[]>();
    for (const t of targets) {
      const value = t[field].trim();
      const ids = map.get(value) ?? [];
      ids.push(t.id);
      map.set(value, ids);
    }
    for (const [value, ids] of map) {
      if (ids.length > 1) dups.push({ field, value, ids });
    }
  }
  return dups;
}

/** Кодовые 301/308, которые должны быть на проде после деплоя. */
export function listSeoAcceptanceRedirectExpectations(): Array<{
  from: string;
  to: string;
  status: "301" | "308";
  note: string;
}> {
  return [
    {
      from: "https://www.chastdushi.ru/*",
      to: "https://chastdushi.ru/*",
      status: "301",
      note: "nginx www",
    },
    {
      from: "http://chastdushi.ru/*",
      to: "https://chastdushi.ru/*",
      status: "301",
      note: "nginx http→https",
    },
    {
      from: "https://частьдуши.рф/*",
      to: "https://chastdushi.ru/*",
      status: "301",
      note: "зеркало §14",
    },
    ...SEO_LEGACY_PATH_REDIRECTS.map((r) => ({
      from: r.fromPath,
      to: r.toPath,
      status: "301" as const,
      note: "SEO legacy §11–12 / §21 (после деплоя)",
    })),
  ];
}

export function seoAcceptanceInterlinkCoverage(): {
  homeHrefs: string[];
  projectsHubHrefs: string[];
} {
  return {
    homeHrefs: HOME_SEO_INTERLINKS.map((l) => l.href),
    projectsHubHrefs: PROJECTS_HUB_SEO_INTERLINKS.map((l) => l.href),
  };
}

export function seoAcceptanceMetrikaGoalsReady(): {
  wiredTzGoals: string[];
  allGoalIdsIncludeWired: boolean;
} {
  const wiredTzGoals = listWiredSeoMetrikaTzGoals();
  return {
    wiredTzGoals,
    allGoalIdsIncludeWired: wiredTzGoals.every((g) => METRIKA_GOAL_IDS.includes(g as (typeof METRIKA_GOAL_IDS)[number])),
  };
}
