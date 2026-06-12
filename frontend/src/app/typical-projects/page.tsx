import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME } from "@/lib/constants";
import { getHouseProjects } from "@/lib/construction-data";
import { PARTNER_HOUSE_PROJECT_CATALOG } from "@/lib/house-project-catalog";
import { ProjectsCatalogContent } from "@/app/projects/content";

export const revalidate = 60;

const catalog = PARTNER_HOUSE_PROJECT_CATALOG;

export async function generateMetadata() {
  return getPageMeta({
    title: `${catalog.listTitle} — цены и планировки | ${SITE_NAME}`,
    description: catalog.listDescription,
    path: catalog.basePath,
    keywords: ["типовые проекты домов", "каталог домов", "дом под ключ", SITE_NAME],
  });
}

export default async function TypicalProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [projects, sp] = await Promise.all([getHouseProjects("partner"), searchParams]);
  return <ProjectsCatalogContent projects={projects} searchParams={sp} catalog={catalog} />;
}
