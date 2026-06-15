import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME } from "@/lib/constants";
import { getHouseProjectBySlug, getSimilarHouseProjects } from "@/lib/construction-data";
import { AUTHOR_HOUSE_PROJECT_CATALOG } from "@/lib/house-project-catalog";
import { getHeroShellTiersForProject } from "@/lib/project-hero-shell-tiers";
import { getProjectRenders } from "@/lib/construction-shared";
import { houseProjectHeroTeaser } from "@/lib/house-project-teaser";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { HouseProjectDetailContent } from "./content";

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const catalog = AUTHOR_HOUSE_PROJECT_CATALOG;
  const project = await getHouseProjectBySlug(params.slug, catalog.kind);
  if (!project) return {};
  const cover = getProjectRenders(project)[0]?.url;
  return getPageMeta({
    title: `${project.title} — проект дома ${project.area} м² | ${SITE_NAME}`,
    description: houseProjectHeroTeaser(project.shortDescription, project.description),
    path: `${catalog.basePath}/${project.slug}`,
    keywords: [project.title, "проект дома", `${project.area} м2`, SITE_NAME],
    ...(cover ? { ogImage: cover } : {}),
  });
}

export default async function HouseProjectPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const catalog = AUTHOR_HOUSE_PROJECT_CATALOG;
  const project = await getHouseProjectBySlug(params.slug, catalog.kind);
  if (!project) notFound();
  const similarProjects = await getSimilarHouseProjects(project);
  const heroShellTiers = await getHeroShellTiersForProject(project);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: catalog.detailBreadcrumbLabel, path: catalog.basePath },
          { name: project.title, path: `${catalog.basePath}/${project.slug}` },
        ]}
      />
      <HouseProjectDetailContent
        project={project}
        similarProjects={similarProjects}
        heroShellTiers={heroShellTiers}
        catalog={catalog}
      />
    </>
  );
}
