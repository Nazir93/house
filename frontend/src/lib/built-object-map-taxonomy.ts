import type { BuiltObjectItem } from "@/lib/construction-shared";
import { builtObjectMaterialLabel, normalizeBuiltObjectMaterialEnum } from "@/lib/construction-shared";

/** Регионы для фильтров карты и админки (slug → подпись). */
export const BUILT_OBJECT_MAP_REGIONS = [
  { slug: "lo", label: "Ленинградская область и СЗ" },
  { slug: "mo", label: "Москва и Московская область" },
  { slug: "vnovgorod", label: "Новгородская область" },
  { slug: "other", label: "Другой регион" },
] as const;

export type BuiltObjectMapRegionSlug = (typeof BUILT_OBJECT_MAP_REGIONS)[number]["slug"];

/** Районы внутри региона (slug хранится в БД). */
export const BUILT_OBJECT_MAP_DISTRICTS: Record<string, { slug: string; label: string }[]> = {
  lo: [
    { slug: "vyborg", label: "Выборгский район" },
    { slug: "gatchina", label: "Гатчинский район" },
    { slug: "vsevolozhsk", label: "Всеволожский район / Токсово" },
    { slug: "priyutninskoe", label: "Приветнинское" },
    { slug: "vyritsa", label: "Вырица и окрестности" },
  ],
  mo: [
    { slug: "ramenskoe", label: "Раменское" },
    { slug: "krasnogorsk", label: "Красногорск" },
    { slug: "other_mo", label: "Другой район МО" },
  ],
  vnovgorod: [{ slug: "novgorod_city", label: "Великий Новгород" }],
  other: [],
};

export type MapAreaBucketId =
  | "all"
  | "lt100"
  | "b100_125"
  | "b125_150"
  | "b150_175"
  | "b175_200"
  | "b200_300"
  | "gt300";

export const MAP_AREA_FILTER_OPTIONS: { id: MapAreaBucketId; label: string }[] = [
  { id: "all", label: "Любая" },
  { id: "lt100", label: "до 100 м²" },
  { id: "b100_125", label: "100–125 м²" },
  { id: "b125_150", label: "125–150 м²" },
  { id: "b150_175", label: "150–175 м²" },
  { id: "b175_200", label: "175–200 м²" },
  { id: "b200_300", label: "200–300 м²" },
  { id: "gt300", label: "свыше 300 м²" },
];

export type MapFloorBucketId = "all" | "eq1" | "eq15" | "gte2";

export const MAP_FLOOR_FILTER_OPTIONS: { id: MapFloorBucketId; label: string }[] = [
  { id: "all", label: "Любая" },
  { id: "eq1", label: "1 этаж" },
  { id: "eq15", label: "1,5 этажа" },
  { id: "gte2", label: "2+ этажа" },
];

/** Регион для фильтра: из БД или эвристика по адресу (пока не заполнили regionSlug). */
export function effectiveBuiltObjectRegionSlug(o: BuiltObjectItem): BuiltObjectMapRegionSlug {
  const raw = (o.regionSlug || "").trim().toLowerCase();
  if (raw === "lo" || raw === "mo" || raw === "vnovgorod" || raw === "other") return raw as BuiltObjectMapRegionSlug;
  const l = (o.location || "").toLowerCase();
  if (/моск|подмоск|м\. о\.|московск/.test(l)) return "mo";
  if (/велик(ий|ого)\s+новгород|новгородск/.test(l)) return "vnovgorod";
  if (/ленинград|санкт|спб|петербург|псков|карел|лодейн|выборг|гатчин|всеволож|токсов|выриц|приветнинск/.test(l)) return "lo";
  return "other";
}

function areaMatchesBucket(area: number, bucket: MapAreaBucketId): boolean {
  switch (bucket) {
    case "all":
      return true;
    case "lt100":
      return area < 100;
    case "b100_125":
      return area >= 100 && area < 125;
    case "b125_150":
      return area >= 125 && area < 150;
    case "b150_175":
      return area >= 150 && area < 175;
    case "b175_200":
      return area >= 175 && area < 200;
    case "b200_300":
      return area >= 200 && area <= 300;
    case "gt300":
      return area > 300;
    default:
      return true;
  }
}

function floorMatchesBucket(floors: number | null | undefined, bucket: MapFloorBucketId): boolean {
  if (bucket === "all") return true;
  if (floors == null || !Number.isFinite(Number(floors))) return false;
  const f = Number(floors);
  if (bucket === "eq1") return f < 1.35 && Math.abs(f - 1.5) > 0.08;
  if (bucket === "eq15") return Math.abs(f - 1.5) < 0.12;
  if (bucket === "gte2") return f >= 1.85;
  return true;
}

export interface BuiltObjectMapFilterState {
  material: string;
  region: "all" | BuiltObjectMapRegionSlug;
  district: string;
  area: MapAreaBucketId;
  floors: MapFloorBucketId;
}

export function filterBuiltObjectsForMap(objects: BuiltObjectItem[], f: BuiltObjectMapFilterState): BuiltObjectItem[] {
  return objects.filter((o) => {
    if (f.material !== "all" && normalizeBuiltObjectMaterialEnum(o.material) !== f.material) return false;
    if (f.region !== "all" && effectiveBuiltObjectRegionSlug(o) !== f.region) return false;
    if (f.region !== "all" && f.district !== "all") {
      const d = (o.district || "").trim();
      if (!d || d !== f.district) return false;
    }
    if (f.area !== "all") {
      if (o.area == null) return false;
      if (!areaMatchesBucket(o.area, f.area)) return false;
    }
    if (f.floors !== "all" && !floorMatchesBucket(o.floors, f.floors)) return false;
    return true;
  });
}

/** Опции района для селекта: из справочника + фактические значения из данных (если задали вручную). */
export function districtOptionsForRegion(
  region: "all" | BuiltObjectMapRegionSlug,
  objects: BuiltObjectItem[]
): { slug: string; label: string }[] {
  if (region === "all") return [];
  const fromTaxonomy = BUILT_OBJECT_MAP_DISTRICTS[region] ?? [];
  const seen = new Set(fromTaxonomy.map((x) => x.slug));
  const extra: { slug: string; label: string }[] = [];
  if (region !== "other") {
    for (const o of objects) {
      if (effectiveBuiltObjectRegionSlug(o) !== region) continue;
      const d = (o.district || "").trim();
      if (!d || seen.has(d)) continue;
      seen.add(d);
      extra.push({ slug: d, label: d });
    }
  }
  return [...fromTaxonomy, ...extra];
}
