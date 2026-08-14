import { SITE_URL } from "@/lib/constants";

/**
 * Self-referencing canonical (ТЗ SEO §13).
 * Абсолютный URL без GET/hash; главная — с завершающим `/`.
 */
export function buildSelfReferencingCanonical(
  path: string,
  siteUrl: string = SITE_URL,
): string {
  const base = siteUrl.replace(/\/$/, "");
  const raw = path.trim();
  let pathname = "/";

  try {
    if (/^https?:\/\//i.test(raw)) {
      pathname = new URL(raw).pathname;
    } else {
      pathname = new URL(raw || "/", base).pathname;
    }
  } catch {
    pathname = (raw.split("?")[0] ?? "/").split("#")[0] || "/";
    if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  }

  if (pathname !== "/") {
    pathname = pathname.replace(/\/+$/, "") || "/";
  }

  if (pathname === "/") return `${base}/`;
  return `${base}${pathname}`;
}

/** Путь без query/hash для передачи в getPageMeta.path. */
export function stripSeoPathQuery(path: string): string {
  const canonical = buildSelfReferencingCanonical(path);
  try {
    const u = new URL(canonical);
    return u.pathname === "/" ? "/" : u.pathname;
  } catch {
    return path.split("?")[0]?.split("#")[0] || "/";
  }
}
