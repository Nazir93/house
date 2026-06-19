import type { HouseProjectCatalogKind } from "@/lib/house-project-catalog";

/** Элемент списка сравнения: slug + каталог (авторские / типовые). */
export type ProjectCompareEntry = {
  catalogKind: HouseProjectCatalogKind;
  slug: string;
};

export const PROJECT_COMPARE_MAX = 4;
export const PROJECT_COMPARE_STORAGE_KEY = "house-project-compare-v1";
export const PROJECT_COMPARE_PAGE_PATH = "/projects/compare";

export function compareEntryKey(entry: ProjectCompareEntry): string {
  return `${entry.catalogKind}:${entry.slug}`;
}

export function parseCompareEntryKey(raw: string): ProjectCompareEntry | null {
  const trimmed = raw.trim();
  const match = /^(author|partner):(.+)$/.exec(trimmed);
  if (!match?.[2]) return null;
  const slug = decodeURIComponent(match[2]).trim();
  if (!slug) return null;
  return { catalogKind: match[1] as HouseProjectCatalogKind, slug };
}

export function normalizeCompareEntries(entries: ProjectCompareEntry[]): ProjectCompareEntry[] {
  const seen = new Set<string>();
  const out: ProjectCompareEntry[] = [];
  for (const entry of entries) {
    const slug = entry.slug?.trim();
    if (!slug) continue;
    const kind = entry.catalogKind === "partner" ? "partner" : "author";
    const normalized: ProjectCompareEntry = { catalogKind: kind, slug };
    const key = compareEntryKey(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
    if (out.length >= PROJECT_COMPARE_MAX) break;
  }
  return out;
}

export function isCompareEntrySelected(
  entries: ProjectCompareEntry[],
  entry: ProjectCompareEntry,
): boolean {
  const key = compareEntryKey(entry);
  return entries.some((item) => compareEntryKey(item) === key);
}

export type ToggleCompareResult = {
  entries: ProjectCompareEntry[];
  added: boolean;
  removed: boolean;
  rejectedFull: boolean;
};

/** Добавить или убрать проект из списка (toggle). Не более PROJECT_COMPARE_MAX. */
export function toggleCompareEntry(
  entries: ProjectCompareEntry[],
  entry: ProjectCompareEntry,
  max = PROJECT_COMPARE_MAX,
): ToggleCompareResult {
  const normalized = normalizeCompareEntries([entry])[0];
  if (!normalized) {
    return { entries: normalizeCompareEntries(entries), added: false, removed: false, rejectedFull: false };
  }

  const key = compareEntryKey(normalized);
  const list = normalizeCompareEntries(entries);
  const index = list.findIndex((item) => compareEntryKey(item) === key);

  if (index >= 0) {
    const next = list.filter((_, i) => i !== index);
    return { entries: next, added: false, removed: true, rejectedFull: false };
  }

  if (list.length >= max) {
    return { entries: list, added: false, removed: false, rejectedFull: true };
  }

  return { entries: [...list, normalized], added: true, removed: false, rejectedFull: false };
}

export function removeCompareEntry(
  entries: ProjectCompareEntry[],
  entry: ProjectCompareEntry,
): ProjectCompareEntry[] {
  const key = compareEntryKey(entry);
  return normalizeCompareEntries(entries).filter((item) => compareEntryKey(item) !== key);
}

export function parseCompareSearchParam(value: string | string[] | undefined): ProjectCompareEntry[] {
  const chunks: string[] = [];
  if (typeof value === "string") chunks.push(value);
  else if (Array.isArray(value)) chunks.push(...value);

  const parsed: ProjectCompareEntry[] = [];
  for (const chunk of chunks) {
    for (const part of chunk.split(",")) {
      const entry = parseCompareEntryKey(part);
      if (entry) parsed.push(entry);
    }
  }
  return normalizeCompareEntries(parsed);
}

export function buildComparePageHref(entries: ProjectCompareEntry[]): string {
  const list = normalizeCompareEntries(entries);
  if (!list.length) return PROJECT_COMPARE_PAGE_PATH;
  const query = list
    .map((entry) => `p=${encodeURIComponent(compareEntryKey(entry))}`)
    .join("&");
  return `${PROJECT_COMPARE_PAGE_PATH}?${query}`;
}

export function formatProjectFloorsLabel(floors: number): string {
  const n = Math.round(Number(floors));
  if (n <= 1) return "1 этаж";
  if (n === 2) return "2 этажа";
  return `${n} этажа`;
}

export function formatProjectMaterialsLabel(materials: string[]): string {
  if (!materials.length) return "—";
  return materials.map((m) => m.replace(/\.$/, "").trim()).join(", ");
}

export function readCompareEntriesFromStorage(): ProjectCompareEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROJECT_COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return normalizeCompareEntries(
      data.filter(
        (item): item is ProjectCompareEntry =>
          item != null &&
          typeof item === "object" &&
          typeof (item as ProjectCompareEntry).slug === "string" &&
          ((item as ProjectCompareEntry).catalogKind === "author" ||
            (item as ProjectCompareEntry).catalogKind === "partner"),
      ),
    );
  } catch {
    return [];
  }
}

export function writeCompareEntriesToStorage(entries: ProjectCompareEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    const list = normalizeCompareEntries(entries);
    if (!list.length) {
      localStorage.removeItem(PROJECT_COMPARE_STORAGE_KEY);
      return;
    }
    localStorage.setItem(PROJECT_COMPARE_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / private mode
  }
}
