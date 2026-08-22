import { permanentRedirect } from "next/navigation";

import { AuthorProjectsAfterCatalogSection } from "@/components/projects/author-projects-after-catalog-section";
import { getPageMeta } from "@/lib/get-page-meta";
import { getAllHouseProjects } from "@/lib/construction-data";
import { ALL_HOUSE_PROJECTS_CATALOG } from "@/lib/house-project-catalog";
import { parseProjectsCatalogTypeParam } from "@/lib/project-catalog-type-filter";
import {
  getAuthorProjectsCatalogSeo,
  getPartnerProjectsCatalogSeo,
  getUnifiedProjectsCatalogSeo,
} from "@/lib/seo/project-catalog-hub-seo";
import { getProjectCatalogSliceSeoPages } from "@/lib/seo/project-catalog-slice-seo";
import { getProjectMaterialSeoPages } from "@/lib/seo/project-material-seo";
import { resolveProjectsCatalogFilterSeoAction } from "@/lib/seo/projects-catalog-filter-indexing";
import { ProjectsCatalogContent } from "./content";

export const revalidate = 60;

const catalog = ALL_HOUSE_PROJECTS_CATALOG;

function readCatalogParam(sp: Record<string, string | string[] | undefined>): string | null {
  const raw = sp.catalog;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

function resolveProjectsHubSeo(sp: Record<string, string | string[] | undefined>) {
  const catalogType = parseProjectsCatalogTypeParam(readCatalogParam(sp));
  if (catalogType === "author") return getAuthorProjectsCatalogSeo();
  if (catalogType === "partner") return getPartnerProjectsCatalogSeo();
  return getUnifiedProjectsCatalogSeo();
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const seo = resolveProjectsHubSeo(sp);
  const filterSeo = resolveProjectsCatalogFilterSeoAction(sp, "/projects");
  return getPageMeta({
    title: seo.title,
    description: seo.description,
    path: filterSeo.canonicalPath,
    keywords: seo.keywords,
    forceNoindex: filterSeo.noindex,
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const seo = resolveProjectsHubSeo(await searchParams);
  const [projects, sp] = await Promise.all([getAllHouseProjects(), searchParams]);
  const filterSeo = resolveProjectsCatalogFilterSeoAction(sp, "/projects");
  if (filterSeo.redirectTo) {
    permanentRedirect(filterSeo.redirectTo);
  }
  const catalogType = parseProjectsCatalogTypeParam(readCatalogParam(sp));

  return (
    <>
      <ProjectsCatalogContent
        projects={projects}
        searchParams={sp}
        catalog={catalog}
        pageTitle={seo.h1}
        pageDescription={seo.intro}
        breadcrumbLabel={seo.h1}
        seoLandingLinks={[...getProjectMaterialSeoPages(), ...getProjectCatalogSliceSeoPages()].map((page) => ({
          href: page.path,
          label: page.h1,
          description: page.keywords.slice(0, 3).join(", "),
        }))}
      />
      {catalogType !== "partner" ? <AuthorProjectsAfterCatalogSection /> : null}
    </>
  );
}
