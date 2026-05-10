import { SITE_URL } from "@/lib/constants";

export type BreadcrumbItem = { name: string; path: string };

/** JSON-LD BreadcrumbList (position 1-based). */
export function buildBreadcrumbListSchema(items: BreadcrumbItem[]): object {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => {
      const path = it.path.startsWith("/") ? it.path : `/${it.path}`;
      const itemUrl = path === "/" ? `${base}/` : `${base}${path}`;
      return {
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        item: itemUrl,
      };
    }),
  };
}
