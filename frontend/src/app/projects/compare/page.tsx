import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME } from "@/lib/constants";
import { getHouseProjects } from "@/lib/construction-data";
import { CompareProjectsContent } from "./content";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Сравнение проектов домов | ${SITE_NAME}`,
    description: "Сравните до 4 проектов домов по цене, площади, этажности, комнатам, санузлам и материалам.",
    path: "/projects/compare",
    keywords: ["сравнение проектов домов", "выбрать проект дома", SITE_NAME],
  });
}

export default async function CompareProjectsPage() {
  const projects = await getHouseProjects();
  return <CompareProjectsContent projects={projects} />;
}
