import { SITE_URL } from "@/lib/constants";
import { buildSelfReferencingCanonical } from "@/lib/seo/self-referencing-canonical";

/**
 * Зеркало частьдуши.рф (ТЗ SEO §14).
 * На проде nginx 301 → тот же путь на chastdushi.ru; 200 только на каноне.
 */

/** Punycode Host для частьдуши.рф */
export const CYRILLIC_MIRROR_HOST_PUNYCODE = "xn--80aim8afhxn7a.xn--p1ai";

/** Unicode-имя зеркала (для доков / админки). */
export const CYRILLIC_MIRROR_HOST_UNICODE = "частьдуши.рф";

export function isCyrillicMirrorHost(hostname: string | null | undefined): boolean {
  if (!hostname) return false;
  const h = hostname.trim().toLowerCase();
  return h === CYRILLIC_MIRROR_HOST_PUNYCODE || h === CYRILLIC_MIRROR_HOST_UNICODE;
}

/**
 * Куда должен уйти 301 с зеркала: абсолютный URL канона без дубля 200.
 * Path/query сохраняем как у `$request_uri` в nginx.
 */
export function buildCyrillicMirrorRedirectLocation(
  requestPathWithQuery: string,
  canonicalSiteUrl: string = SITE_URL,
): string {
  const base = canonicalSiteUrl.replace(/\/$/, "");
  const raw = requestPathWithQuery.trim() || "/";
  let pathname = "/";
  let search = "";

  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      pathname = u.pathname || "/";
      search = u.search;
    } else {
      const u = new URL(raw.startsWith("/") ? raw : `/${raw}`, base);
      pathname = u.pathname || "/";
      search = u.search;
    }
  } catch {
    const [pathPart, queryPart] = raw.split("?");
    pathname = pathPart?.startsWith("/") ? pathPart : `/${pathPart || ""}`;
    search = queryPart ? `?${queryPart}` : "";
  }

  if (pathname !== "/") {
    pathname = pathname.replace(/\/+$/, "") || "/";
  }

  // Главная: как в ТЗ и nginx (`…/`), остальные — без лишнего слэша + query как есть.
  if (pathname === "/" && !search) {
    return buildSelfReferencingCanonical("/", base);
  }
  return `${base}${pathname === "/" ? "" : pathname}${search}`;
}

/** Хосты, которые не должны отдавать индексируемый дубль канона. */
export function listSeoMirrorHostsThatMust301(): string[] {
  return [CYRILLIC_MIRROR_HOST_PUNYCODE, "www.chastdushi.ru"];
}
