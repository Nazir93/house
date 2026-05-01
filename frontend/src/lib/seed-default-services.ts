import type { ServiceType } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Шаблон услуг для таблицы Service (динамические лендинги /services/[slug]).
 * Раньше сюда входили лендинги электромонтажа — они убраны; новые строки создаются вручную в админке под актуальные услуги.
 */
const DEFAULT_SERVICES: Array<{
  slug: string;
  serviceType: ServiceType;
  title: string;
  shortDescription: string;
  icon: string;
}> = [];

export async function ensureDefaultServicesIfNeeded(): Promise<void> {
  const n = await prisma.service.count();
  if (n >= DEFAULT_SERVICES.length) return;
  await ensureDefaultServices();
}

export async function ensureDefaultServices(): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (let order = 0; order < DEFAULT_SERVICES.length; order++) {
    const row = DEFAULT_SERVICES[order];
    const exists = await prisma.service.findUnique({ where: { slug: row.slug } });
    if (exists) {
      skipped += 1;
      continue;
    }

    try {
      await prisma.service.create({
        data: {
          slug: row.slug,
          title: row.title,
          shortDescription: row.shortDescription,
          serviceType: row.serviceType,
          icon: row.icon,
          coverImage: null,
          videoUrl: null,
          bannerImageDesktop: null,
          bannerImageMobile: null,
          published: true,
          order,
        },
      });
      created += 1;
    } catch (e: unknown) {
      const code = e && typeof e === "object" && "code" in e ? (e as { code?: string }).code : "";
      if (code === "P2002") skipped += 1;
      else throw e;
    }
  }

  return { created, skipped };
}
