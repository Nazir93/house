import type { BuiltObjectSiteStatus } from "@/lib/construction-shared";

/** Фильтр статуса объекта на карте и в каталоге. */
export type BuiltObjectSiteStatusFilter = "all" | "COMPLETED" | "UNDER_CONSTRUCTION";

export const BUILT_OBJECT_SITE_STATUS_FILTER_OPTIONS: {
  id: BuiltObjectSiteStatusFilter;
  label: string;
}[] = [
  { id: "all", label: "Все" },
  { id: "COMPLETED", label: "Готовые" },
  { id: "UNDER_CONSTRUCTION", label: "Строящиеся" },
];

/** Парсинг ?status= из URL (building | completed | all). */
export function parseBuiltObjectSiteStatusFilterParam(
  raw: string | null | undefined,
): BuiltObjectSiteStatusFilter {
  const v = (raw || "").trim().toLowerCase();
  if (v === "building" || v === "under_construction" || v === "construction") {
    return "UNDER_CONSTRUCTION";
  }
  if (v === "completed" || v === "ready" || v === "done") return "COMPLETED";
  if (v === "all") return "all";
  return "all";
}

export function builtObjectSiteStatusFilterToParam(
  filter: BuiltObjectSiteStatusFilter,
): string | null {
  if (filter === "UNDER_CONSTRUCTION") return "building";
  if (filter === "COMPLETED") return "completed";
  return null;
}

export function resolveBuiltObjectSiteStatus(
  status: BuiltObjectSiteStatus | null | undefined,
): BuiltObjectSiteStatus {
  return status === "UNDER_CONSTRUCTION" ? "UNDER_CONSTRUCTION" : "COMPLETED";
}

export function matchesBuiltObjectSiteStatusFilter(
  object: { siteStatus?: BuiltObjectSiteStatus | null },
  filter: BuiltObjectSiteStatusFilter,
): boolean {
  if (filter === "all") return true;
  return resolveBuiltObjectSiteStatus(object.siteStatus ?? undefined) === filter;
}

export function filterBuiltObjectsBySiteStatus<T extends { siteStatus?: BuiltObjectSiteStatus | null }>(
  objects: T[],
  filter: BuiltObjectSiteStatusFilter,
): T[] {
  return objects.filter((o) => matchesBuiltObjectSiteStatusFilter(o, filter));
}

export function builtObjectSiteStatusLabel(status: BuiltObjectSiteStatus | null | undefined): string {
  return resolveBuiltObjectSiteStatus(status) === "UNDER_CONSTRUCTION" ? "Строится" : "Сдан";
}

export function builtObjectSiteStatusAdminLabel(status: BuiltObjectSiteStatus | null | undefined): string {
  return resolveBuiltObjectSiteStatus(status) === "UNDER_CONSTRUCTION"
    ? "Строится (стройплощадка)"
    : "Сдан / готов";
}
