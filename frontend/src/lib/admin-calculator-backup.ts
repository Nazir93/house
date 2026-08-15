/** Снимок справочника калькулятора для бэкапа/восстановления в админке. */

export const CALCULATOR_CATALOG_BACKUP_KEY = "calculator_catalog_backup_v1";

export type CalculatorCatalogSnapshotSettings = {
  smallAreaThresholdM2: number;
  smallAreaSurcharge: number;
  addonsSurchargeUnderThreshold: number;
  blindAreaWidthM: number;
};

export type CalculatorCatalogSnapshotCategory = {
  id: string;
  labelRu: string;
  floors: number;
  roofType: string;
  facadeCoef: number;
  perimeterCoef: number;
  roofCoef: number;
  insulationCoef: number;
  gutterCoef: number;
  soffitCoef: number;
  overlapCoef: number;
  crossCoef: number;
  sortOrder: number;
  isActive: boolean;
  shellPrices: Array<{ wallMaterial: string; pricePerM2: number }>;
};

export type CalculatorCatalogSnapshotFacade = {
  id: string;
  slug: string;
  name: string;
  pricePerM2: number;
  sortOrder: number;
  isActive: boolean;
};

export type CalculatorCatalogSnapshotOption = {
  id: string;
  slug: string;
  name: string;
  groupSlug: string;
  pricingType: string;
  pricePerUnit: number;
  description: string | null;
  imageUrl: string | null;
  allowedCategories: string[];
  sortOrder: number;
  isActive: boolean;
};

export type CalculatorCatalogSnapshot = {
  version: 1;
  savedAt: string;
  settings: CalculatorCatalogSnapshotSettings | null;
  categories: CalculatorCatalogSnapshotCategory[];
  facades: CalculatorCatalogSnapshotFacade[];
  options: CalculatorCatalogSnapshotOption[];
};

export type CalculatorCatalogBackupMeta = {
  exists: boolean;
  savedAt: string | null;
};

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asBool(v: unknown, fallback = true): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function parseShellPrices(raw: unknown): Array<{ wallMaterial: string; pricePerM2: number }> {
  if (!Array.isArray(raw)) return [];
  const out: Array<{ wallMaterial: string; pricePerM2: number }> = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const wallMaterial = asString((row as { wallMaterial?: unknown }).wallMaterial).trim();
    const pricePerM2 = (row as { pricePerM2?: unknown }).pricePerM2;
    if (!wallMaterial || !isFiniteNumber(pricePerM2)) continue;
    out.push({ wallMaterial, pricePerM2: Math.round(pricePerM2) });
  }
  return out;
}

export function buildCalculatorCatalogSnapshot(input: {
  settings: CalculatorCatalogSnapshotSettings | null;
  categories: CalculatorCatalogSnapshotCategory[];
  facades: CalculatorCatalogSnapshotFacade[];
  options: CalculatorCatalogSnapshotOption[];
  savedAt?: string;
}): CalculatorCatalogSnapshot {
  return {
    version: 1,
    savedAt: input.savedAt ?? new Date().toISOString(),
    settings: input.settings,
    categories: input.categories,
    facades: input.facades,
    options: input.options,
  };
}

export function parseCalculatorCatalogSnapshot(raw: unknown): CalculatorCatalogSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 1) return null;
  if (!Array.isArray(obj.categories) || !Array.isArray(obj.facades) || !Array.isArray(obj.options)) {
    return null;
  }

  const categories: CalculatorCatalogSnapshotCategory[] = [];
  for (const row of obj.categories) {
    if (!row || typeof row !== "object") continue;
    const c = row as Record<string, unknown>;
    const id = asString(c.id).trim();
    if (!id) continue;
    if (
      !isFiniteNumber(c.facadeCoef) ||
      !isFiniteNumber(c.perimeterCoef) ||
      !isFiniteNumber(c.roofCoef) ||
      !isFiniteNumber(c.insulationCoef) ||
      !isFiniteNumber(c.gutterCoef) ||
      !isFiniteNumber(c.soffitCoef) ||
      !isFiniteNumber(c.overlapCoef) ||
      !isFiniteNumber(c.crossCoef)
    ) {
      continue;
    }
    categories.push({
      id,
      labelRu: asString(c.labelRu, id),
      floors: isFiniteNumber(c.floors) ? c.floors : 1,
      roofType: asString(c.roofType, "gable"),
      facadeCoef: c.facadeCoef,
      perimeterCoef: c.perimeterCoef,
      roofCoef: c.roofCoef,
      insulationCoef: c.insulationCoef,
      gutterCoef: c.gutterCoef,
      soffitCoef: c.soffitCoef,
      overlapCoef: c.overlapCoef,
      crossCoef: c.crossCoef,
      sortOrder: isFiniteNumber(c.sortOrder) ? Math.round(c.sortOrder) : 0,
      isActive: asBool(c.isActive, true),
      shellPrices: parseShellPrices(c.shellPrices),
    });
  }

  const facades: CalculatorCatalogSnapshotFacade[] = [];
  for (const row of obj.facades) {
    if (!row || typeof row !== "object") continue;
    const f = row as Record<string, unknown>;
    const id = asString(f.id).trim();
    if (!id || !isFiniteNumber(f.pricePerM2)) continue;
    facades.push({
      id,
      slug: asString(f.slug, id),
      name: asString(f.name, id),
      pricePerM2: Math.round(f.pricePerM2),
      sortOrder: isFiniteNumber(f.sortOrder) ? Math.round(f.sortOrder) : 0,
      isActive: asBool(f.isActive, true),
    });
  }

  const options: CalculatorCatalogSnapshotOption[] = [];
  for (const row of obj.options) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const id = asString(o.id).trim();
    if (!id || !isFiniteNumber(o.pricePerUnit)) continue;
    options.push({
      id,
      slug: asString(o.slug, id),
      name: asString(o.name, id),
      groupSlug: asString(o.groupSlug, "construction"),
      pricingType: asString(o.pricingType, "per_area"),
      pricePerUnit: Math.round(o.pricePerUnit),
      description: typeof o.description === "string" ? o.description : null,
      imageUrl: typeof o.imageUrl === "string" ? o.imageUrl : null,
      allowedCategories: Array.isArray(o.allowedCategories)
        ? o.allowedCategories.filter((x): x is string => typeof x === "string")
        : [],
      sortOrder: isFiniteNumber(o.sortOrder) ? Math.round(o.sortOrder) : 0,
      isActive: asBool(o.isActive, true),
    });
  }

  if (categories.length === 0) return null;

  let settings: CalculatorCatalogSnapshotSettings | null = null;
  if (obj.settings && typeof obj.settings === "object") {
    const s = obj.settings as Record<string, unknown>;
    if (
      isFiniteNumber(s.smallAreaThresholdM2) &&
      isFiniteNumber(s.smallAreaSurcharge) &&
      isFiniteNumber(s.blindAreaWidthM)
    ) {
      settings = {
        smallAreaThresholdM2: Math.round(s.smallAreaThresholdM2),
        smallAreaSurcharge: s.smallAreaSurcharge,
        addonsSurchargeUnderThreshold: isFiniteNumber(s.addonsSurchargeUnderThreshold)
          ? s.addonsSurchargeUnderThreshold
          : 0.1,
        blindAreaWidthM: s.blindAreaWidthM,
      };
    }
  }

  return {
    version: 1,
    savedAt: asString(obj.savedAt, new Date(0).toISOString()),
    settings,
    categories,
    facades,
    options,
  };
}

export function calculatorBackupMetaFromSnapshot(
  snapshot: CalculatorCatalogSnapshot | null,
): CalculatorCatalogBackupMeta {
  if (!snapshot) return { exists: false, savedAt: null };
  return { exists: true, savedAt: snapshot.savedAt || null };
}

export function formatCalculatorBackupSavedAt(savedAt: string | null | undefined): string {
  if (!savedAt) return "нет";
  const d = new Date(savedAt);
  if (Number.isNaN(d.getTime())) return "нет";
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
