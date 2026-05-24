import type { BuiltObjectItem } from "@/lib/construction-shared";
import { builtObjectMaterialLabel } from "@/lib/construction-shared";
import { CACHE_TAG_PORTFOLIO_FILTER_OPTIONS } from "@/lib/cache-tags-public";

export const PORTFOLIO_FILTER_OPTIONS_SETTINGS_KEY = "portfolio_filter_options_v1";

export type PortfolioMaterialFilterOption = { value: string; label: string };
export type PortfolioFloorFilterOption = { id: string; label: string; floors: number };
export type PortfolioAreaFilterId = "all" | "lte150" | "mid" | "gt250";

export type PortfolioFilterOptionsConfig = {
  customMaterials: PortfolioMaterialFilterOption[];
  customFloors: PortfolioFloorFilterOption[];
};

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

export function parsePortfolioFilterOptionsConfig(raw: string | null | undefined): PortfolioFilterOptionsConfig {
  if (!raw?.trim()) {
    return { customMaterials: [], customFloors: [] };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PortfolioFilterOptionsConfig>;
    const customMaterials = Array.isArray(parsed.customMaterials)
      ? parsed.customMaterials
          .filter(
            (x): x is PortfolioMaterialFilterOption =>
              !!x &&
              typeof x === "object" &&
              typeof (x as PortfolioMaterialFilterOption).value === "string" &&
              typeof (x as PortfolioMaterialFilterOption).label === "string"
          )
          .map((x) => ({
            value: String(x.value).trim().toUpperCase(),
            label: normalizePortfolioFilterLabel(x.label),
          }))
          .filter((x) => x.label && VALID_MATERIAL_ENUM.has(x.value))
      : [];
    const customFloors = Array.isArray(parsed.customFloors)
      ? parsed.customFloors
          .filter(
            (x): x is PortfolioFloorFilterOption =>
              !!x &&
              typeof x === "object" &&
              typeof (x as PortfolioFloorFilterOption).id === "string" &&
              typeof (x as PortfolioFloorFilterOption).label === "string" &&
              typeof (x as PortfolioFloorFilterOption).floors === "number"
          )
          .map((x) => ({
            id: String(x.id).trim(),
            label: normalizePortfolioFilterLabel(x.label),
            floors: Number(x.floors),
          }))
          .filter((x) => x.id && x.label && Number.isFinite(x.floors))
      : [];
    return { customMaterials, customFloors };
  } catch {
    return { customMaterials: [], customFloors: [] };
  }
}

export function serializePortfolioFilterOptionsConfig(config: PortfolioFilterOptionsConfig): string {
  return JSON.stringify(config);
}

export function mergeMaterialFilterOptions(
  config: PortfolioFilterOptionsConfig,
  currentMaterial?: string
): PortfolioMaterialFilterOption[] {
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
  for (const c of config.customMaterials) push(c.value, c.label);
  if (currentMaterial?.trim()) {
    push(currentMaterial, builtObjectMaterialLabel(currentMaterial));
  }

  return out;
}

export function mergeFloorFilterOptions(
  config: PortfolioFilterOptionsConfig,
  currentFloors?: number | null
): PortfolioFloorFilterOption[] {
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
  for (const c of config.customFloors) push(c.id, c.label, c.floors);
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
  },
  floorOptions: PortfolioFloorFilterOption[]
): BuiltObjectItem[] {
  let list = objects;

  if (filters.material !== "all") {
    list = list.filter((o) => o.material === filters.material);
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

export function addCustomMaterialOption(
  config: PortfolioFilterOptionsConfig,
  value: string,
  label: string
): PortfolioFilterOptionsConfig {
  const v = value.trim().toUpperCase();
  const l = normalizePortfolioFilterLabel(label);
  if (!l || !VALID_MATERIAL_ENUM.has(v)) return config;
  const presetKeys = new Set(DEFAULT_PORTFOLIO_MATERIAL_FILTER_OPTIONS.map((p) => labelKey(p.label)));
  if (presetKeys.has(labelKey(l))) return config;
  const exists = config.customMaterials.some(
    (x) => x.value === v && labelKey(x.label) === labelKey(l)
  );
  if (exists) return config;
  return { ...config, customMaterials: [...config.customMaterials, { value: v, label: l }] };
}

export function addCustomFloorOption(
  config: PortfolioFilterOptionsConfig,
  label: string,
  floors: number
): PortfolioFilterOptionsConfig {
  const l = normalizePortfolioFilterLabel(label);
  if (!l || !Number.isFinite(floors)) return config;
  const presetIds = new Set(DEFAULT_PORTFOLIO_FLOOR_FILTER_OPTIONS.map((p) => p.id));
  const id = `custom-${String(floors).replace(".", "_")}-${labelKey(l).replace(/\s+/g, "-")}`;
  if (presetIds.has(id)) return config;
  const exists = config.customFloors.some((x) => x.id === id || (x.floors === floors && labelKey(x.label) === labelKey(l)));
  if (exists) return config;
  return { ...config, customFloors: [...config.customFloors, { id, label: l, floors }] };
}

export async function loadPortfolioFilterOptionsConfig(): Promise<PortfolioFilterOptionsConfig> {
  try {
    const { prisma } = await import("@/lib/db");
    const row = await prisma.siteSettings.findUnique({
      where: { key: PORTFOLIO_FILTER_OPTIONS_SETTINGS_KEY },
    });
    return parsePortfolioFilterOptionsConfig(row?.value);
  } catch {
    return { customMaterials: [], customFloors: [] };
  }
}

export async function loadPortfolioFilterOptionsCached(): Promise<PortfolioFilterOptionsConfig> {
  const { unstable_cache } = await import("next/cache");
  return unstable_cache(
    loadPortfolioFilterOptionsConfig,
    ["portfolio-filter-options-v1"],
    { revalidate: 60, tags: [CACHE_TAG_PORTFOLIO_FILTER_OPTIONS] }
  )();
}
