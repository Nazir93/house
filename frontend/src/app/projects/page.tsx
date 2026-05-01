import { Suspense } from "react";
import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME } from "@/lib/constants";
import { getHouseProjects } from "@/lib/construction-data";
import { ProjectsCatalogContent } from "./content";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Проекты домов — каталог с ценами | ${SITE_NAME}`,
    description: "Типовые проекты домов: фильтры по этажности, площади, цене, комнатам и санузлам. Сравнение проектов и подробные карточки.",
    path: "/projects",
    keywords: ["проекты домов", "каталог домов", "дом под ключ", SITE_NAME],
  });
}

export default async function ProjectsPage() {
  const projects = await getHouseProjects();
  return (
    <Suspense
      fallback={
        <section className="min-h-[40vh] pt-28 pb-20" style={{ backgroundColor: "var(--bg)" }}>
          <p className="container mx-auto px-5 text-center text-[var(--text-muted)]">Загрузка каталога…</p>
        </section>
      }
    >
      <ProjectsCatalogContent projects={projects} />
    </Suspense>
  );
}
