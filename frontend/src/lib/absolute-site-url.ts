import { SITE_URL } from "@/lib/constants";

/** Приводит путь вида `/uploads/…` или `//host/path` к полному URL для OG, Twitter и schema.org. */
export function toAbsoluteSiteUrl(href: string | null | undefined): string | undefined {
  if (href == null) return undefined;
  const raw = href.trim();
  if (!raw) return undefined;
  const base = SITE_URL.replace(/\/$/, "");
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}
