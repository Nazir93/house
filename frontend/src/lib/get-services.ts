import type { ServiceType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { SERVICES } from "@/lib/constants";

/** Устаревшие типы услуг из прежней версии каталога не показываем на витрине /services. */
const LEGACY_SERVICE_TYPES: ServiceType[] = [
  "ELECTRICAL",
  "ACOUSTICS",
  "STRUCTURED_CABLING",
  "SMART_HOME",
  "SECURITY",
  "ARCHITECTURAL_LIGHTING",
];

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  icon: string;
  coverImage: string | null;
  videoUrl: string | null;
}

export async function getServicesList(): Promise<ServiceItem[]> {
  try {
    const dbServices = await prisma.service.findMany({
      where: { published: true, serviceType: { notIn: LEGACY_SERVICE_TYPES } },
      orderBy: { order: "asc" },
    });

    if (dbServices.length > 0) {
      return dbServices.map((s) => ({
        id: s.id,
        slug: s.slug.startsWith("/") ? s.slug : `/services/${s.slug}`,
        title: s.title,
        shortDescription: s.shortDescription,
        icon: s.icon,
        coverImage: s.coverImage,
        videoUrl: s.videoUrl,
      }));
    }
  } catch {
    // DB unavailable
  }

  return SERVICES.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    shortDescription: s.shortDescription,
    icon: s.icon,
    coverImage: s.coverImage,
    videoUrl: s.videoUrl,
  }));
}
