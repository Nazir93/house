import type { BuiltObjectItem } from "@/lib/construction-shared";
import { builtObjectMaterialLabel, normalizeBuiltObjectMaterialEnum } from "@/lib/construction-shared";
import type { BuiltObjectSiteStatusFilter } from "@/lib/built-object-site-status";
import { matchesBuiltObjectSiteStatusFilter } from "@/lib/built-object-site-status";

export type PortfolioMaterialFilterOption = { value: string; label: string };
export type PortfolioFloorFilterOption = { id: string; label: string; floors: number };
export type PortfolioAreaFilterId = "all" | "lte150" | "mid" | "gt250";

export const DEFAULT_PORTFOLIO_MATERIAL_FILTER_OPTIONS: PortfolioMaterialFilterOption[] = [
  { value: "BRICK", label: "Кирпич" },
  { value: "GAS_BLOCK", label: "Газобетон" },
  { value: "CERAMIC_BLOCK", label: "Керамический блок" },
];

export const DEFAULT_PORTFOLIO_FLOOR_FILTER_OPTIONS: PortfolioFloorFilterOption[] = [
  { id: "1", label: "1 этаж", floors: 1 },
  { id: "1.5", label: "1,5 этажа", floors: 1.5 },
  { id: "2", label: "2 этажа", floors: 2 },
];

export const PORTFOLIO_AREA_FILTER_OPTIONS: { id: PortfolioAreaFilterId; label: string }[] = [
  { id: "all", label: "Любая" },
  { id: "lte150", label: "до 150 м²" },
  { id: "mid", label: "150–250 м²" },
  { id: "gt250", label: "свыше 250 м²" },
];

const VALID_MATERIAL_ENUM = new Set([
  "GAS_BLOCK",
  "BRICK",
  "CERAMIC_BLOCK",
  "FRAME",
  "OTHER",
]);

export function normalizePortfolioFilterLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function labelKey(label: string): string {
  return normalizePortfolioFilterLabel(label).toLowerCase();
}

export function mergeMaterialFilterOptions(currentMaterial?: string): PortfolioMaterialFilterOption[] {
  const seen = new Set<string>();
  const out: PortfolioMaterialFilterOption[] = [];

  const push = (value: string, label: string) => {
    const v = value.trim().toUpperCase();
    const l = normalizePortfolioFilterLabel(label);
    if (!v || !l || !VALID_MATERIAL_ENUM.has(v)) return;
    const key = `${v}::${labelKey(l)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ value: v, label: l });
  };

  for (const p of DEFAULT_PORTFOLIO_MATERIAL_FILTER_OPTIONS) push(p.value, p.label);
  if (currentMaterial?.trim()) {
    push(currentMaterial, builtObjectMaterialLabel(currentMaterial));
  }

  return out;
}

export function mergeFloorFilterOptions(currentFloors?: number | null): PortfolioFloorFilterOption[] {
  const seen = new Set<string>();
  const out: PortfolioFloorFilterOption[] = [];

  const push = (id: string, label: string, floors: number) => {
    const l = normalizePortfolioFilterLabel(label);
    if (!id.trim() || !l || !Number.isFinite(floors)) return;
    if (seen.has(id)) return;
    seen.add(id);
    out.push({ id, label: l, floors });
  };

  for (const p of DEFAULT_PORTFOLIO_FLOOR_FILTER_OPTIONS) push(p.id, p.label, p.floors);
  if (currentFloors != null && Number.isFinite(currentFloors)) {
    const id = String(currentFloors).replace(".", "_");
    push(`current-${id}`, formatFloorFilterLabel(currentFloors), currentFloors);
  }

  return out;
}

export function formatFloorFilterLabel(floors: number): string {
  if (Math.abs(floors - 1.5) < 0.06) return "1,5 этажа";
  if (Math.abs(floors - Math.round(floors)) < 0.06) {
    const n = Math.round(floors);
    return n === 1 ? "1 этаж" : `${n} этажа`;
  }
  return `${String(floors).replace(".", ",")} этажа`;
}

export function floorMatchesFilterOption(
  objectFloors: number | null | undefined,
  option: PortfolioFloorFilterOption
): boolean {
  if (objectFloors == null || !Number.isFinite(objectFloors)) return false;
  const f = Number(objectFloors);
  const target = option.floors;
  if (Math.abs(target - 1.5) < 0.06) return Math.abs(f - 1.5) < 0.12;
  if (Math.abs(target - 1) < 0.06) return f < 1.35 && Math.abs(f - 1.5) > 0.08;
  if (Math.abs(target - 2) < 0.06) return f >= 1.85;
  return Math.abs(f - target) < 0.12;
}

export function filterPortfolioObjects(
  objects: BuiltObjectItem[],
  filters: {
    material: string;
    floorId: string;
    areaId: PortfolioAreaFilterId;
    siteStatus?: BuiltObjectSiteStatusFilter;
  },
  floorOptions: PortfolioFloorFilterOption[]
): BuiltObjectItem[] {
  let list = objects;

  if (filters.siteStatus && filters.siteStatus !== "all") {
    list = list.filter((o) => matchesBuiltObjectSiteStatusFilter(o, filters.siteStatus!));
  }

  if (filters.material !== "all") {
    list = list.filter(
      (o) => normalizeBuiltObjectMaterialEnum(o.material) === filters.material
    );
  }

  if (filters.floorId !== "all") {
    const opt = floorOptions.find((f) => f.id === filters.floorId);
    if (opt) list = list.filter((o) => floorMatchesFilterOption(o.floors, opt));
  }

  if (filters.areaId === "lte150") list = list.filter((o) => o.area != null && o.area <= 150);
  if (filters.areaId === "mid") list = list.filter((o) => o.area != null && o.area > 150 && o.area <= 250);
  if (filters.areaId === "gt250") list = list.filter((o) => o.area != null && o.area > 250);

  return list;
}
