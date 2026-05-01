import { prisma } from "@/lib/db";
import { getServicePageMetaSeeds } from "@/lib/seo/service-seo-defaults";

/**
 * Создаёт записи PageMeta для /services и лендингов услуг, если пути ещё нет в БД.
 * Не перезаписывает существующие строки (правки в админке SEO сохраняются).
 */
export async function ensureDefaultServicePageMetaIfNeeded(): Promise<{ created: number; skipped: number }> {
  const seeds = getServicePageMetaSeeds();
  let created = 0;
  let skipped = 0;

  for (const row of seeds) {
    const exists = await prisma.pageMeta.findUnique({ where: { path: row.path } });
    if (exists) {
      skipped += 1;
      continue;
    }
    await prisma.pageMeta.create({
      data: {
        path: row.path,
        title: row.title,
        description: row.description,
        keywords: row.keywords,
        h1: row.h1,
      },
    });
    created += 1;
  }

  return { created, skipped };
}
