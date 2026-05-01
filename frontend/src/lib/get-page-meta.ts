import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

interface MetaDefaults {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  ogImage?: string;
  /** Open Graph: для статей блога — article, иначе website */
  openGraphType?: "website" | "article";
}

/** Одна выборка на путь, кэш ISR — меньше обращений к БД при статической выкладке. */
const getCachedPageMetaRow = unstable_cache(
  async (path: string) => {
    try {
      return await prisma.pageMeta.findUnique({
        where: { path },
        select: {
          title: true,
          description: true,
          keywords: true,
          ogTitle: true,
          ogDescription: true,
          ogImage: true,
          h1: true,
          noindex: true,
          bodyHtml: true,
        },
      });
    } catch {
      return null;
    }
  },
  ["page-meta-row"],
  { revalidate: 60 }
);

export async function getPageMeta(defaults: MetaDefaults): Promise<Metadata> {
  const dbMeta = await getCachedPageMetaRow(defaults.path);

  const title = dbMeta?.title || defaults.title;
  const description = dbMeta?.description || defaults.description;
  const keywords = dbMeta?.keywords
    ? dbMeta.keywords.split(",").map((k) => k.trim())
    : defaults.keywords;

  const baseUrl = SITE_URL.replace(/\/$/, "");
  const canonical = `${baseUrl}${defaults.path === "/" ? "" : defaults.path}`;

  return {
    title: { absolute: title },
    description,
    ...(keywords && keywords.length > 0 && { keywords }),
    openGraph: {
      title: dbMeta?.ogTitle || title,
      description: dbMeta?.ogDescription || description,
      type: defaults.openGraphType ?? "website",
      locale: "ru_RU",
      siteName: SITE_NAME,
      url: `${baseUrl}${defaults.path}`,
      ...(dbMeta?.ogImage || defaults.ogImage
        ? { images: [{ url: dbMeta?.ogImage || defaults.ogImage! }] }
        : {}),
    },
    alternates: { canonical },
    ...(dbMeta?.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export async function getPageH1(path: string, fallback: string): Promise<string> {
  const meta = await getCachedPageMetaRow(path);
  return meta?.h1?.trim() || fallback;
}

/** Текст под заголовком на странице: `description` из SEO-админки (тот же сниппет для поиска), иначе fallback. */
export async function getPageDescriptionBody(path: string, fallback: string): Promise<string> {
  const meta = await getCachedPageMetaRow(path);
  if (meta?.description?.trim()) return meta.description.trim();
  return fallback;
}

/** Одна выборка полей страницы для разметки и баннера (OG-картинка = баннер на `/services`). */
export async function getPageMetaFields(path: string): Promise<{
  h1: string | null;
  description: string | null;
  ogImage: string | null;
  bodyHtml: string | null;
}> {
  const meta = await getCachedPageMetaRow(path);
  if (!meta) {
    return { h1: null, description: null, ogImage: null, bodyHtml: null };
  }
  return {
    h1: meta.h1?.trim() || null,
    description: meta.description?.trim() || null,
    ogImage: meta.ogImage?.trim() || null,
    bodyHtml: meta.bodyHtml?.trim() || null,
  };
}
