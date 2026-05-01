import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME } from "@/lib/constants";
import { getHouseProjectBySlug, getSimilarHouseProjects } from "@/lib/construction-data";
import { HouseProjectDetailContent } from "./content";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getHouseProjectBySlug(params.slug);
  if (!project) return {};
  return getPageMeta({
    title: `${project.title} — проект дома ${project.area} м² | ${SITE_NAME}`,
    description: project.shortDescription,
    path: `/projects/${project.slug}`,
    keywords: [project.title, "проект дома", `${project.area} м2`, SITE_NAME],
  });
}

export default async function HouseProjectPage({ params }: { params: { slug: string } }) {
  const project = await getHouseProjectBySlug(params.slug);
  if (!project) notFound();
  const similarProjects = await getSimilarHouseProjects(project);
  return <HouseProjectDetailContent project={project} similarProjects={similarProjects} />;
}
