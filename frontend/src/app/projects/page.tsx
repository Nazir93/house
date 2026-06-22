import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME } from "@/lib/constants";
import { getHouseProjects } from "@/lib/construction-data";
import { AUTHOR_HOUSE_PROJECT_CATALOG } from "@/lib/house-project-catalog";
import { getProjectCatalogSliceSeoPages } from "@/lib/seo/project-catalog-slice-seo";
import { getProjectMaterialSeoPages } from "@/lib/seo/project-material-seo";
import { ProjectsCatalogContent } from "./content";

export const revalidate = 60;

const catalog = AUTHOR_HOUSE_PROJECT_CATALOG;

export async function generateMetadata() {
  return getPageMeta({
    title: `${catalog.listTitle} — цены и планировки | ${SITE_NAME}`,
    description: catalog.listDescription,
    path: catalog.basePath,
    keywords: ["авторские проекты домов", "каталог домов", "дом под ключ", SITE_NAME],
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [projects, sp] = await Promise.all([getHouseProjects("author"), searchParams]);
  return (
    <ProjectsCatalogContent
      projects={projects}
      searchParams={sp}
      catalog={catalog}
      seoLandingLinks={[...getProjectMaterialSeoPages(), ...getProjectCatalogSliceSeoPages()].map((page) => ({
        href: page.path,
        label: page.h1,
        description: page.keywords.slice(0, 3).join(", "),
      }))}
    />
  );
}
