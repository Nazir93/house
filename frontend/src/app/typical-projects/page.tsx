import { permanentRedirect } from "next/navigation";

import { PROJECTS_CATALOG_TYPE_QUERY_KEY } from "@/lib/project-catalog-type-filter";
import { PROJECTS_CATALOG_FILTER_QUERY_KEYS } from "@/lib/seo/projects-catalog-filter-indexing";

function readSearchParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const raw = sp[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

/** Типовые проекты — вкладка единого каталога на `/projects`. */
export default async function TypicalProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  params.set(PROJECTS_CATALOG_TYPE_QUERY_KEY, "partner");
  for (const key of PROJECTS_CATALOG_FILTER_QUERY_KEYS) {
    if (key === PROJECTS_CATALOG_TYPE_QUERY_KEY) continue;
    const value = readSearchParam(sp, key);
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  permanentRedirect(qs ? `/projects?${qs}` : `/projects?${PROJECTS_CATALOG_TYPE_QUERY_KEY}=partner`);
}
