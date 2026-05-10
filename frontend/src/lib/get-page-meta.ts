import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { toAbsoluteSiteUrl } from "@/lib/absolute-site-url";

const DEFAULT_OG_PATH = process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE?.trim() || "/icon.png";

interface MetaDefaults {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  ogImage?: string;
  /** Open Graph: для статей блога — article, иначе website */
  openGraphType?: "website" | "article";
  /** Поля для OG type=article и соцсетей */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
  /**
   * Если не true — при отсутствии og из БД/страницы подставляется NEXT_PUBLIC_DEFAULT_OG_IMAGE или /icon.png
   * (лучше сниппеты в мессенджерах).
   */
  skipDefaultOgImage?: boolean;
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
  const noindex = Boolean(dbMeta?.noindex);

  const explicitOg = (dbMeta?.ogImage || defaults.ogImage || "").trim();
  const fallbackRel = defaults.skipDefaultOgImage ? "" : DEFAULT_OG_PATH;
  const ogHref = explicitOg || fallbackRel;
  const ogAbs = ogHref ? toAbsoluteSiteUrl(ogHref) : undefined;
  const ogImages =
    ogAbs != null ? [{ url: ogAbs, alt: title }] : undefined;

  const art = defaults.openGraphType === "article" ? defaults.article : undefined;
  const ogArticleExtras =
    art &&
    {
      ...(art.publishedTime ? { publishedTime: art.publishedTime } : {}),
      ...(art.modifiedTime ? { modifiedTime: art.modifiedTime } : {}),
      ...(art.authors?.length ? { authors: art.authors } : {}),
      ...(art.section ? { section: art.section } : {}),
      ...(art.tags?.length ? { tags: art.tags } : {}),
    };

  const twitterTitle = dbMeta?.ogTitle?.trim() || title;
  const twitterDescription = dbMeta?.ogDescription?.trim() || description;

  return {
    title: { absolute: title },
    description,
    ...(keywords && keywords.length > 0 && { keywords }),
    openGraph: {
      title: dbMeta?.ogTitle || title,
      description: dbMeta?.ogDescription || description,
      type: (defaults.openGraphType ?? "website") as "website" | "article",
      locale: "ru_RU",
      siteName: SITE_NAME,
      url: `${baseUrl}${defaults.path}`,
      ...(ogImages ? { images: ogImages } : {}),
      ...(ogArticleExtras ?? {}),
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      ...(ogAbs ? { images: [ogAbs] } : {}),
    },
    alternates: { canonical },
    ...(noindex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false },
          },
        }
      : {
          robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-image-preview": "large",
              "max-snippet": -1,
              "max-video-preview": -1,
            },
          },
        }),
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
