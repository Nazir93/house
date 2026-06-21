import type { HouseProjectItem } from "@/lib/construction-data";
import { resolveProjectListingPriceRub } from "@/lib/project-listing-price";

export type MaterialFilterId = "all" | "gazobeton" | "keramoblok" | "kirpich";
export type FloorsFilterId = "all" | "1" | "1.5" | "2";

/** Сортировка каталога проектов (query `sort`). */
export type ProjectsSortKey = "price" | "area" | "new";

export function parseSortParam(v: string | null): ProjectsSortKey {
  if (v === "area" || v === "new") return v;
  return "price";
}

export const MATERIAL_OPTIONS: { id: MaterialFilterId; label: string }[] = [
  { id: "all", label: "Любой материал" },
  { id: "gazobeton", label: "Газобетон" },
  { id: "keramoblok", label: "Керамоблок" },
  { id: "kirpich", label: "Кирпич" },
];

export const FLOORS_OPTIONS: { id: FloorsFilterId; label: string }[] = [
  { id: "all", label: "Любая этажность" },
  { id: "1", label: "1 этаж" },
  { id: "1.5", label: "1,5 этажа" },
  { id: "2", label: "2 этажа" },
];

export function parseMaterialParam(v: string | null): MaterialFilterId {
  if (v === "gazobeton" || v === "keramoblok" || v === "kirpich") return v;
  return "all";
}

export function parseFloorsParam(v: string | null): FloorsFilterId {
  if (v === "1" || v === "1.5" || v === "2") return v;
  return "all";
}

export function projectMatchesMaterial(p: HouseProjectItem, m: MaterialFilterId): boolean {
  if (m === "all") return true;
  const mats = p.materials.map((x) => x.toLowerCase());
  if (m === "gazobeton") return mats.some((s) => s.includes("газобетон"));
  if (m === "keramoblok") return mats.some((s) => s.includes("керам"));
  if (m === "kirpich") return mats.some((s) => s.includes("кирпич"));
  return true;
}

/** Полтора этажа: в БД целое число — используем текст проекта и компактные двухэтажные коробки как приближение. */
export function projectMatchesFloors(p: HouseProjectItem, f: FloorsFilterId): boolean {
  if (f === "all") return true;
  if (f === "1") return p.floors === 1;
  if (f === "2") return p.floors === 2;
  if (f === "1.5") {
    const text = `${p.title} ${p.shortDescription}`.toLowerCase();
    if (/полутор|1[\s,.]?5|мансард|мезонин/.test(text)) return true;
    return p.floors === 2 && p.area <= 140;
  }
  return true;
}

export function projectMatchesAreaPrice(
  p: HouseProjectItem,
  areaMin: number,
  areaMax: number,
  priceMinRub: number,
  priceMaxRub: number,
  material: MaterialFilterId = "all",
): boolean {
  const price = resolveProjectListingPriceRub(p, material);
  return p.area >= areaMin && p.area <= areaMax && price >= priceMinRub && price <= priceMaxRub;
}

export function projectMatchesQuery(p: HouseProjectItem, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    p.title.toLowerCase().includes(s) ||
    p.slug.toLowerCase().includes(s) ||
    p.shortDescription.toLowerCase().includes(s)
  );
}

const FALLBACK_PROJECT_BOUNDS = {
  minArea: 50,
  maxArea: 350,
  minPriceRub: 4_000_000,
  maxPriceRub: 25_000_000,
} as const;

export type ProjectsCatalogBounds = {
  minArea: number;
  maxArea: number;
  minPriceRub: number;
  maxPriceRub: number;
};

export function getPublishedProjectBounds(
  projects: HouseProjectItem[],
  material: MaterialFilterId = "all",
): ProjectsCatalogBounds {
  let list = projects.filter((p) => p.published);
  if (material !== "all") {
    list = list.filter((p) => projectMatchesMaterial(p, material));
  }
  if (list.length === 0) {
    return material === "all" ? { ...FALLBACK_PROJECT_BOUNDS } : getPublishedProjectBounds(projects, "all");
  }
  const areas = list.map((x) => x.area);
  const prices = list.map((x) => resolveProjectListingPriceRub(x, material));
  return {
    minArea: Math.min(...areas),
    maxArea: Math.max(...areas),
    minPriceRub: Math.min(...prices),
    maxPriceRub: Math.max(...prices),
  };
}

/** Сброс диапазонов площади/цены при смене материала в каталоге. */
export function getCatalogFiltersForMaterialChange(
  projects: HouseProjectItem[],
  material: MaterialFilterId,
  keep: Pick<ProjectsCatalogFilters, "floors" | "q" | "sort">,
): ProjectsCatalogFilters {
  const bounds = getPublishedProjectBounds(projects, material);
  return {
    areaMin: bounds.minArea,
    areaMax: bounds.maxArea,
    priceMinRub: bounds.minPriceRub,
    priceMaxRub: bounds.maxPriceRub,
    material,
    floors: keep.floors,
    q: keep.q,
    sort: keep.sort,
  };
}

export type ProjectsCatalogFilters = {
  areaMin: number;
  areaMax: number;
  priceMinRub: number;
  priceMaxRub: number;
  material: MaterialFilterId;
  floors: FloorsFilterId;
  q: string;
  sort: ProjectsSortKey;
};

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function readSearchParam(sp: SearchParamsRecord, key: string): string | null {
  const v = sp[key];
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function parseNumParam(v: string | null, fallback: number): number {
  if (v == null || v.trim() === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Читает фильтры каталога из query; без параметра — полный диапазон текущего каталога. */
export function parseProjectsCatalogSearchParams(
  sp: SearchParamsRecord,
  bounds: ProjectsCatalogBounds,
): ProjectsCatalogFilters {
  const areaMin = parseNumParam(readSearchParam(sp, "areaMin"), bounds.minArea);
  const areaMax = parseNumParam(readSearchParam(sp, "areaMax"), bounds.maxArea);
  const priceMinRub = parseNumParam(readSearchParam(sp, "priceMin"), bounds.minPriceRub);
  const priceMaxRub = parseNumParam(readSearchParam(sp, "priceMax"), bounds.maxPriceRub);

  return {
    areaMin: Math.min(areaMin, areaMax),
    areaMax: Math.max(areaMin, areaMax),
    priceMinRub: Math.min(priceMinRub, priceMaxRub),
    priceMaxRub: Math.max(priceMinRub, priceMaxRub),
    material: parseMaterialParam(readSearchParam(sp, "material")),
    floors: parseFloorsParam(readSearchParam(sp, "floors")),
    sort: parseSortParam(readSearchParam(sp, "sort")),
    q: readSearchParam(sp, "q")?.trim() ?? "",
  };
}

export function hasCustomProjectsCatalogFilters(sp: SearchParamsRecord): boolean {
  return (
    readSearchParam(sp, "areaMin") != null ||
    readSearchParam(sp, "areaMax") != null ||
    readSearchParam(sp, "priceMin") != null ||
    readSearchParam(sp, "priceMax") != null ||
    readSearchParam(sp, "material") != null ||
    readSearchParam(sp, "floors") != null ||
    readSearchParam(sp, "q") != null ||
    readSearchParam(sp, "sort") != null
  );
}

/** Проходит ли проект по фильтрам, кроме диапазона площади/цены. */
export function projectMatchesCatalogFiltersExceptRange(
  p: HouseProjectItem,
  filters: Pick<ProjectsCatalogFilters, "material" | "floors" | "q">,
): boolean {
  if (!p.published) return false;
  if (!projectMatchesMaterial(p, filters.material)) return false;
  if (!projectMatchesFloors(p, filters.floors)) return false;
  if (!projectMatchesQuery(p, filters.q)) return false;
  return true;
}

export function buildProjectsSearchParams(opts: {
  areaMin: number;
  areaMax: number;
  priceMinRub: number;
  priceMaxRub: number;
  material: MaterialFilterId;
  floors: FloorsFilterId;
  q: string;
  sort?: ProjectsSortKey;
  bounds: ProjectsCatalogBounds;
}): string {
  const p = new URLSearchParams();
  if (opts.areaMin > opts.bounds.minArea) p.set("areaMin", String(opts.areaMin));
  if (opts.areaMax < opts.bounds.maxArea) p.set("areaMax", String(opts.areaMax));
  if (opts.priceMinRub > opts.bounds.minPriceRub) p.set("priceMin", String(opts.priceMinRub));
  if (opts.priceMaxRub < opts.bounds.maxPriceRub) p.set("priceMax", String(opts.priceMaxRub));
  if (opts.material !== "all") p.set("material", opts.material);
  if (opts.floors !== "all") p.set("floors", opts.floors);
  if (opts.q.trim()) p.set("q", opts.q.trim());
  const sort = opts.sort ?? "price";
  if (sort !== "price") p.set("sort", sort);
  return p.toString();
}
