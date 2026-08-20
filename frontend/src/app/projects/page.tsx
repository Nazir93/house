import { permanentRedirect } from "next/navigation";

import { AuthorProjectsAfterCatalogSection } from "@/components/projects/author-projects-after-catalog-section";
import { getPageMeta } from "@/lib/get-page-meta";
import { getHouseProjects } from "@/lib/construction-data";
import { AUTHOR_HOUSE_PROJECT_CATALOG } from "@/lib/house-project-catalog";
import { getHomeHeroBannerConfig } from "@/lib/home-hero-banner-config";
import { getAuthorProjectsCatalogSeo } from "@/lib/seo/project-catalog-hub-seo";
import { getProjectCatalogSliceSeoPages } from "@/lib/seo/project-catalog-slice-seo";
import { getProjectMaterialSeoPages } from "@/lib/seo/project-material-seo";
import { resolveProjectsCatalogFilterSeoAction } from "@/lib/seo/projects-catalog-filter-indexing";
import { ProjectsCatalogContent } from "./content";

export const revalidate = 60;

const catalog = AUTHOR_HOUSE_PROJECT_CATALOG;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const seo = getAuthorProjectsCatalogSeo();
  const sp = await searchParams;
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
  const seo = getAuthorProjectsCatalogSeo();
  const [projects, sp, homeBanner] = await Promise.all([
    getHouseProjects("author"),
    searchParams,
    getHomeHeroBannerConfig(),
  ]);
  const filterSeo = resolveProjectsCatalogFilterSeoAction(sp, "/projects");
  if (filterSeo.redirectTo) {
    permanentRedirect(filterSeo.redirectTo);
  }

  return (
    <>
      <ProjectsCatalogContent
        projects={projects}
        searchParams={sp}
        catalog={catalog}
        pageTitle={seo.h1}
        pageDescription={seo.intro}
        breadcrumbLabel={seo.h1}
        homePromos={homeBanner.promos}
        seoLandingLinks={[...getProjectMaterialSeoPages(), ...getProjectCatalogSliceSeoPages()].map((page) => ({
          href: page.path,
          label: page.h1,
          description: page.keywords.slice(0, 3).join(", "),
        }))}
      />
      <AuthorProjectsAfterCatalogSection />
    </>
  );
}
