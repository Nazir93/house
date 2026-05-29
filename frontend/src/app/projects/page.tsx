import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME } from "@/lib/constants";
import { getHouseProjects } from "@/lib/construction-data";
import { ProjectsCatalogContent } from "./content";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Проекты домов — каталог с ценами | ${SITE_NAME}`,
    description: "Типовые проекты домов: фильтры по этажности, площади, цене, комнатам и санузлам и подробные карточки.",
    path: "/projects",
    keywords: ["проекты домов", "каталог домов", "дом под ключ", SITE_NAME],
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [projects, sp] = await Promise.all([getHouseProjects(), searchParams]);
  return <ProjectsCatalogContent projects={projects} searchParams={sp} />;
}
