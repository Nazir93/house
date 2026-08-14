import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";
import { CYRILLIC_MIRROR_HOST_PUNYCODE, CYRILLIC_MIRROR_HOST_UNICODE } from "@/lib/seo/cyrillic-mirror-domain";
import { buildSelfReferencingCanonical } from "@/lib/seo/self-referencing-canonical";
import { sitemapUrlHasDisallowedQuery } from "@/lib/seo/projects-catalog-filter-indexing";

/**
 * Политика публичного sitemap (ТЗ SEO §15).
 * Только канонические URL на SITE_URL; без GET, зеркала, техники и дублей.
 */

/** Префиксы / точные пути, которые не должны попадать в sitemap. */
export const SITEMAP_TECHNICAL_PATH_PREFIXES = [
  "/lp",
  "/admin",
  "/api",
  "/account",
  "/_next",
  "/serwist",
  "/projects/compare",
] as const;

export function isSitemapTechnicalPath(pathname: string): boolean {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const normalized = p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
  return SITEMAP_TECHNICAL_PATH_PREFIXES.some((prefix) => {
    if (prefix === "/lp") return normalized === "/lp" || normalized.startsWith("/lp/");
    return normalized === prefix || normalized.startsWith(`${prefix}/`);
  });
}

export function isSitemapMirrorOrForeignHost(hostname: string, canonicalHost: string): boolean {
  const h = hostname.toLowerCase();
  const canon = canonicalHost.toLowerCase();
  if (h === CYRILLIC_MIRROR_HOST_PUNYCODE || h === CYRILLIC_MIRROR_HOST_UNICODE) return true;
  if (h === `www.${canon}`) return true;
  return h !== canon;
}

/**
 * Нормализует URL к канону для sitemap: https канон-хост, без GET/hash,
 * главная со `/`, остальные без хвостового слэша.
 */
export function normalizePublicSitemapUrl(
  url: string,
  siteUrl: string = SITE_URL,
): string | null {
  const base = siteUrl.replace(/\/$/, "");
  let canonicalHost: string;
  try {
    canonicalHost = new URL(base).hostname;
  } catch {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    try {
      parsed = new URL(url.trim().startsWith("/") ? url.trim() : `/${url.trim()}`, base);
    } catch {
      return null;
    }
  }

  if (sitemapUrlHasDisallowedQuery(parsed.href) || parsed.search || parsed.hash) {
    return null;
  }
  if (isSitemapMirrorOrForeignHost(parsed.hostname, canonicalHost)) {
    return null;
  }
  if (isSitemapTechnicalPath(parsed.pathname)) {
    return null;
  }

  return buildSelfReferencingCanonical(parsed.pathname, base);
}

export type SitemapEntryLike = Pick<MetadataRoute.Sitemap[number], "url"> &
  Partial<Omit<MetadataRoute.Sitemap[number], "url">>;

/**
 * Фильтрует и дедуплицирует записи sitemap под §15.
 * `excludePaths` — например PageMeta.noindex или источники 301.
 */
export function finalizePublicSitemapEntries<T extends SitemapEntryLike>(
  entries: readonly T[],
  opts?: {
    siteUrl?: string;
    excludePaths?: readonly string[];
  },
): T[] {
  const siteUrl = opts?.siteUrl ?? SITE_URL;
  const excluded = new Set(
    (opts?.excludePaths ?? []).map((p) => {
      const n = normalizePublicSitemapUrl(
        p.startsWith("http") ? p : `${siteUrl.replace(/\/$/, "")}${p.startsWith("/") ? p : `/${p}`}`,
        siteUrl,
      );
      return n;
    }).filter((x): x is string => Boolean(x)),
  );

  const seen = new Set<string>();
  const out: T[] = [];

  for (const entry of entries) {
    const normalized = normalizePublicSitemapUrl(entry.url, siteUrl);
    if (!normalized) continue;
    if (excluded.has(normalized)) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push({ ...entry, url: normalized });
  }

  return out;
}

/** Статические публичные пути хаба (без CMS-динамики). */
export function listStaticPublicSitemapPaths(): string[] {
  return [
    "/",
    "/services",
    "/projects",
    "/typical-projects",
    "/portfolio",
    "/portfolio/under-construction",
    "/portfolio/map",
    "/individual-design",
    "/mortgage",
    "/calculator",
    "/about",
    "/reviews",
    "/team",
    "/blog",
    "/contacts",
    "/partners/supplier",
    "/partners/partner",
    "/partners/vacancies",
    "/partners/rent-repair",
    "/consent",
    "/privacy",
    "/technology/materials",
    "/technology/house-area",
  ];
}
