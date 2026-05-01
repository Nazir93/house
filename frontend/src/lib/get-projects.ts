import { prisma } from "@/lib/db";
import {
  mergeProjectVideoUrls,
  readProjectVideoUrlsArray,
  PORTFOLIO_CASES,
  type PortfolioCase,
} from "@/lib/portfolio-data";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export interface ProjectListItem {
  id: string;
  slug: string;
  title: string;
  tag: string;
  industry: string;
  type: string;
  year: string;
  area: string;
  coverImage: string | null;
  videoUrl: string | null;
  shortDescription: string;
  /** Prisma ServiceType — для фильтра на /portfolio */
  service?: string;
}

function serviceTypeToLabel(st: string): string {
  const map: Record<string, string> = {
    ELECTRICAL: "Электромонтаж",
    ACOUSTICS: "Акустика",
    STRUCTURED_CABLING: "СКС",
    SMART_HOME: "Умный дом",
    SECURITY: "Видеонаблюдение",
    ARCHITECTURAL_LIGHTING: "Архитектурная подсветка",
  };
  return map[st] || st;
}

function categoryToLabel(cat: string): string {
  const map: Record<string, string> = {
    RESTAURANT: "Ресторан",
    OFFICE: "Офис",
    APARTMENT: "Квартира",
    SHOP: "Магазин",
    OTHER: "Другое",
  };
  return map[cat] || cat;
}

type ProjectListRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  service: string;
  area: number | null;
  coverImage: string | null;
  videoUrl: string | null;
  description: string;
  seoDescription: string | null;
  industry: string | null;
  projectType: string | null;
  year: string | null;
};

function mapProjectRowToListItem(p: ProjectListRow): ProjectListItem {
  const seo = p.seoDescription?.trim();
  const shortDescription = seo
    ? seo.length > 200
      ? `${seo.slice(0, 200)}…`
      : seo
    : stripHtml(p.description).substring(0, 200);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    tag: categoryToLabel(p.category),
    industry: p.industry || categoryToLabel(p.category).toUpperCase(),
    type: p.projectType || serviceTypeToLabel(p.service),
    year: p.year || "",
    area: p.area ? `${p.area} м²` : "",
    coverImage: p.coverImage,
    videoUrl: p.videoUrl || null,
    shortDescription,
    service: p.service,
  };
}

export async function getProjectsList(): Promise<ProjectListItem[]> {
  try {
    const dbProjects = await prisma.project.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        service: true,
        area: true,
        coverImage: true,
        videoUrl: true,
        description: true,
        seoDescription: true,
        industry: true,
        projectType: true,
        year: true,
      },
    });

    if (dbProjects.length > 0) {
      return dbProjects.map(mapProjectRowToListItem);
    }
  } catch {
    // DB unavailable
  }

  return PORTFOLIO_CASES.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    tag: c.tag,
    industry: c.industry,
    type: c.type,
    year: c.year,
    area: c.area,
    coverImage: null,
    videoUrl: c.videoUrl ?? null,
    shortDescription: c.shortDescription,
  }));
}

const HOME_PORTFOLIO_MAX = 5;

/** Проекты для блока «Портфолио» на главной: отмеченные в админке (до 5), иначе первые 5 из общего списка. */
export async function getHomePortfolioProjects(): Promise<ProjectListItem[]> {
  const fallback = async () => (await getProjectsList()).slice(0, HOME_PORTFOLIO_MAX);

  try {
    const featured = await prisma.project.findMany({
      where: { published: true, featuredOnHome: true },
      orderBy: [{ homeOrder: "asc" }, { order: "asc" }],
      take: HOME_PORTFOLIO_MAX,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        service: true,
        area: true,
        coverImage: true,
        videoUrl: true,
        description: true,
        seoDescription: true,
        industry: true,
        projectType: true,
        year: true,
      },
    });

    if (featured.length > 0) {
      return featured.map(mapProjectRowToListItem);
    }
  } catch {
    // DB unavailable
  }

  return fallback();
}

export async function getProjectBySlug(slug: string): Promise<PortfolioCase | null> {
  try {
    const dbProject = await prisma.project.findUnique({
      where: { slug },
      include: { images: { orderBy: { order: "asc" } } },
    });

    if (dbProject && dbProject.published) {
      const features = dbProject.features
        ? dbProject.features.split("\n").filter(Boolean)
        : [];

      const galleryUrls = dbProject.images.map((im) => im.url);

      const seo = dbProject.seoDescription?.trim() ?? "";
      const shortDescription = seo
        ? seo.length > 200
          ? `${seo.slice(0, 200)}…`
          : seo
        : stripHtml(dbProject.description).substring(0, 200);

      return {
        id: dbProject.id,
        slug: dbProject.slug,
        title: dbProject.title,
        tag: categoryToLabel(dbProject.category),
        industry: dbProject.industry || categoryToLabel(dbProject.category).toUpperCase(),
        type: dbProject.projectType || serviceTypeToLabel(dbProject.service),
        year: dbProject.year || new Date(dbProject.createdAt).getFullYear().toString(),
        area: dbProject.area ? `${dbProject.area} м²` : "",
        location: dbProject.location || "",
        seoDescription: seo || null,
        shortDescription,
        heroDescription: dbProject.description,
        features,
        goals: dbProject.goals || "",
        leftText1: dbProject.leftText1 || "",
        rightText1: dbProject.rightText1 || "",
        leftText2: dbProject.leftText2 || "",
        rightText2: dbProject.rightText2 || "",
        showcaseLabel1: dbProject.showcaseLabel1 || dbProject.images[0]?.alt || "Фото проекта",
        showcaseLabel2: dbProject.showcaseLabel2 || dbProject.images[1]?.alt || "Фото проекта",
        showcaseImage1: dbProject.showcaseImage1 || dbProject.images[0]?.url || null,
        showcaseImage2: dbProject.showcaseImage2 || dbProject.images[1]?.url || null,
        videoUrl: dbProject.videoUrl || null,
        videoUrls: mergeProjectVideoUrls(readProjectVideoUrlsArray(dbProject), dbProject.videoUrl),
        coverImage: dbProject.coverImage || null,
        galleryUrls,
      };
    }
  } catch {
    // DB unavailable
  }

  return PORTFOLIO_CASES.find((c) => c.slug === slug) || null;
}

export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    const dbSlugs = await prisma.project.findMany({
      where: { published: true },
      select: { slug: true },
    });
    if (dbSlugs.length > 0) {
      return dbSlugs.map((p) => p.slug);
    }
  } catch {
    // DB unavailable
  }

  return PORTFOLIO_CASES.map((c) => c.slug);
}
