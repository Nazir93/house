import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { FALLBACK_BUILT_OBJECTS, FALLBACK_HOUSE_PROJECTS } from "@/lib/construction-data";
import { KNOWN_CMS_SERVICE_SLUGS } from "@/lib/service-slug-routes";
import { getProjectCatalogSliceSeoPages } from "@/lib/seo/project-catalog-slice-seo";
import { getKnownServiceSeoSlugs } from "@/lib/seo/service-seo-defaults";
import { getProjectMaterialSeoPages } from "@/lib/seo/project-material-seo";
import {
  finalizePublicSitemapEntries,
  listStaticPublicSitemapPaths,
} from "@/lib/seo/public-sitemap";
import { buildSelfReferencingCanonical } from "@/lib/seo/self-referencing-canonical";

export const revalidate = 300;

function entry(
  path: string,
  extra: Partial<MetadataRoute.Sitemap[number]> = {},
): MetadataRoute.Sitemap[number] {
  return {
    url: buildSelfReferencingCanonical(path),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
    ...extra,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = listStaticPublicSitemapPaths().map((path) => {
    if (path === "/") {
      return entry("/", { changeFrequency: "weekly", priority: 1.0 });
    }
    const priorityByPath: Record<string, number> = {
      "/services": 0.9,
      "/projects": 0.9,
      "/typical-projects": 0.88,
      "/portfolio": 0.7,
      "/portfolio/under-construction": 0.68,
      "/portfolio/map": 0.72,
      "/individual-design": 0.8,
      "/mortgage": 0.75,
      "/calculator": 0.78,
      "/about": 0.6,
      "/reviews": 0.5,
      "/team": 0.55,
      "/blog": 0.7,
      "/contacts": 0.6,
      "/partners/supplier": 0.5,
      "/partners/partner": 0.5,
      "/partners/vacancies": 0.45,
      "/partners/rent-repair": 0.45,
      "/consent": 0.2,
      "/privacy": 0.3,
      "/technology/materials": 0.55,
      "/technology/house-area": 0.55,
    };
    const freq: MetadataRoute.Sitemap[number]["changeFrequency"] =
      path === "/projects" ||
      path === "/typical-projects" ||
      path === "/portfolio" ||
      path === "/portfolio/under-construction" ||
      path === "/portfolio/map" ||
      path === "/blog"
        ? "weekly"
        : path === "/consent" || path === "/privacy"
          ? "yearly"
          : "monthly";
    return entry(path, {
      changeFrequency: freq,
      priority: priorityByPath[path] ?? 0.5,
    });
  });

  const serviceLandingPages: MetadataRoute.Sitemap = getKnownServiceSeoSlugs().map((slug) =>
    entry(`/services/${slug}`, { changeFrequency: "monthly", priority: 0.74 }),
  );

  const projectMaterialLandingPages: MetadataRoute.Sitemap = getProjectMaterialSeoPages().map(
    (page) =>
      entry(page.path, {
        changeFrequency: "weekly",
        priority: page.slug === "kirpich" ? 0.82 : page.slug === "gazobeton" ? 0.8 : 0.72,
      }),
  );

  const projectCatalogSliceLandingPages: MetadataRoute.Sitemap = getProjectCatalogSliceSeoPages().map(
    (page) => entry(page.path, { changeFrequency: "weekly", priority: 0.78 }),
  );

  let dynamicPages: MetadataRoute.Sitemap = [];
  let excludePaths: string[] = [];

  try {
    const [posts, houseProjects, builtObjects, servicesFromDb, noindexMeta, redirects] =
      await Promise.all([
        prisma.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
        prisma.houseProject.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true, catalogKind: true },
        }),
        prisma.builtObject.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true },
        }),
        prisma.service.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true },
        }),
        prisma.pageMeta.findMany({
          where: { noindex: true },
          select: { path: true },
        }),
        prisma.redirect.findMany({ select: { fromPath: true } }),
      ]);

    excludePaths = [
      ...noindexMeta.map((row) => row.path),
      ...redirects.map((row) => row.fromPath),
    ];

    dynamicPages = [
      ...posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...houseProjects.map((p) => ({
        url: `${SITE_URL}${p.catalogKind === "partner" ? "/typical-projects" : "/projects"}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.75,
      })),
      ...builtObjects.map((p) => ({
        url: `${SITE_URL}/portfolio/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.65,
      })),
      ...servicesFromDb.map((s) => ({
        url: `${SITE_URL}/services/${s.slug}`,
        lastModified: s.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.72,
      })),
    ];
  } catch {
    dynamicPages = [
      ...KNOWN_CMS_SERVICE_SLUGS.map((slug) => ({
        url: `${SITE_URL}/services/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.72,
      })),
      ...FALLBACK_HOUSE_PROJECTS.map((p) => ({
        url: `${SITE_URL}/projects/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.75,
      })),
      ...FALLBACK_BUILT_OBJECTS.map((p) => ({
        url: `${SITE_URL}/portfolio/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.65,
      })),
    ];
  }

  return finalizePublicSitemapEntries(
    [
      ...staticPages,
      ...serviceLandingPages,
      ...projectMaterialLandingPages,
      ...projectCatalogSliceLandingPages,
      ...dynamicPages,
    ],
    { excludePaths },
  );
}
