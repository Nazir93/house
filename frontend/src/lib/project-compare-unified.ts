import type { ProjectCompareEntry } from "@/lib/project-compare";
import { compareEntryKey } from "@/lib/project-compare";

export const PROJECT_COMPARE_SETTINGS_STORAGE_KEY = "house-project-compare-settings-v2";

export type CompareUnifiedTier = { id: string; label: string };

/** Материалы коробки для единого сравнения (как на карточке проекта). */
export const COMPARE_UNIFIED_TIERS: CompareUnifiedTier[] = [
  { id: "gas", label: "Газоблок" },
  { id: "ceramic", label: "Керамический блок" },
  { id: "brick", label: "Кирпич" },
];

/** Быстрый пресет инженерии. */
export const COMPARE_ENGINEERING_PRESET = ["electric", "water", "sewer", "radiators"] as const;

export type CompareUnifiedSettings = {
  tierId: string;
  tierLabel: string;
  facadeSlug: string | null;
  engineeringSlugs: string[];
  constructionSlugs: string[];
  transportBandId: string;
};

export const DEFAULT_COMPARE_UNIFIED_SETTINGS: CompareUnifiedSettings = {
  tierId: "gas",
  tierLabel: "Газоблок",
  facadeSlug: null,
  engineeringSlugs: [],
  constructionSlugs: [],
  transportBandId: "30",
};

export type CompareQuoteRequestBody = {
  tierId: string;
  tierLabel: string;
  facadeSlug: string | null;
  engineeringSlugs: string[];
  constructionSlugs: string[];
  transportBandId: string;
};

export type CompareQuoteLine = { id: string; label: string; amountRub: number };

export type CompareQuoteCell = {
  grandTotalRub: number;
  shellTotalRub: number;
  facadeTotalRub: number;
  engineeringTotalRub: number;
  constructionTotalRub: number;
  transportSurchargeRub: number;
  engineeringLines: CompareQuoteLine[];
  constructionLines: CompareQuoteLine[];
  fallbackUsed: boolean;
  error: string | null;
};

export function resolveCompareUnifiedTier(tierId: string): CompareUnifiedTier {
  return COMPARE_UNIFIED_TIERS.find((t) => t.id === tierId) ?? COMPARE_UNIFIED_TIERS[0];
}

export function buildCompareQuoteRequest(settings: CompareUnifiedSettings): CompareQuoteRequestBody {
  return {
    tierId: settings.tierId,
    tierLabel: settings.tierLabel,
    facadeSlug: settings.facadeSlug,
    engineeringSlugs: settings.engineeringSlugs,
    constructionSlugs: settings.constructionSlugs,
    transportBandId: settings.transportBandId,
  };
}

/** Цепочка запросов: полный → без отделки → без инженерии → без фасада. */
export function compareQuoteFallbackBodies(settings: CompareUnifiedSettings): CompareQuoteRequestBody[] {
  const full = buildCompareQuoteRequest(settings);
  const withoutConstruction = { ...full, constructionSlugs: [] as string[] };
  const withoutEngAndCon = { ...withoutConstruction, engineeringSlugs: [] as string[] };
  const shellOnly = { ...withoutEngAndCon, facadeSlug: null as string | null };
  return [full, withoutConstruction, withoutEngAndCon, shellOnly];
}

export function emptyCompareQuoteCell(error: string | null = null): CompareQuoteCell {
  return {
    grandTotalRub: 0,
    shellTotalRub: 0,
    facadeTotalRub: 0,
    engineeringTotalRub: 0,
    constructionTotalRub: 0,
    transportSurchargeRub: 0,
    engineeringLines: [],
    constructionLines: [],
    fallbackUsed: false,
    error,
  };
}

export function compareColumnKey(entry: ProjectCompareEntry): string {
  return compareEntryKey(entry);
}

export function findCheapestCompareQuoteKey(
  quotes: ReadonlyMap<string, CompareQuoteCell>,
): string | null {
  let minKey: string | null = null;
  let minVal = Infinity;
  for (const [key, cell] of quotes) {
    if (cell.error || cell.grandTotalRub <= 0) continue;
    if (cell.grandTotalRub < minVal) {
      minVal = cell.grandTotalRub;
      minKey = key;
    }
  }
  return minKey;
}

export function formatComparePriceDeltaRub(deltaRub: number): string {
  if (deltaRub <= 0) return "";
  if (deltaRub < 1_000_000) {
    const k = Math.round(deltaRub / 1000);
    return `+${k.toLocaleString("ru-RU")} тыс. ₽`;
  }
  const mln = deltaRub / 1_000_000;
  return `+${mln.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} млн ₽`;
}

function isValidCompareSettingsV2(data: unknown): data is CompareUnifiedSettings {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.tierId === "string" &&
    typeof o.tierLabel === "string" &&
    (o.facadeSlug === null || typeof o.facadeSlug === "string") &&
    Array.isArray(o.engineeringSlugs) &&
    Array.isArray(o.constructionSlugs) &&
    typeof o.transportBandId === "string"
  );
}

function migrateLegacyCompareSettings(raw: Record<string, unknown>): CompareUnifiedSettings {
  const tier = resolveCompareUnifiedTier(String(raw.tierId ?? "gas"));
  const engineeringEnabled = Boolean(raw.engineeringEnabled);
  return {
    tierId: tier.id,
    tierLabel: tier.label,
    facadeSlug: null,
    engineeringSlugs: engineeringEnabled ? [...COMPARE_ENGINEERING_PRESET] : [],
    constructionSlugs: [],
    transportBandId:
      typeof raw.transportBandId === "string" && raw.transportBandId.trim()
        ? raw.transportBandId.trim()
        : DEFAULT_COMPARE_UNIFIED_SETTINGS.transportBandId,
  };
}

export function normalizeCompareUnifiedSettings(raw: unknown): CompareUnifiedSettings {
  if (isValidCompareSettingsV2(raw)) {
    const tier = resolveCompareUnifiedTier(raw.tierId);
    return {
      tierId: tier.id,
      tierLabel: tier.label,
      facadeSlug: raw.facadeSlug,
      engineeringSlugs: raw.engineeringSlugs.map(String),
      constructionSlugs: raw.constructionSlugs.map(String),
      transportBandId: raw.transportBandId.trim() || DEFAULT_COMPARE_UNIFIED_SETTINGS.transportBandId,
    };
  }
  if (raw && typeof raw === "object" && "engineeringEnabled" in (raw as object)) {
    return migrateLegacyCompareSettings(raw as Record<string, unknown>);
  }
  return DEFAULT_COMPARE_UNIFIED_SETTINGS;
}

const LEGACY_SETTINGS_KEY = "house-project-compare-settings-v1";

export function readCompareSettingsFromStorage(): CompareUnifiedSettings {
  if (typeof window === "undefined") return DEFAULT_COMPARE_UNIFIED_SETTINGS;
  try {
    const rawV2 = localStorage.getItem(PROJECT_COMPARE_SETTINGS_STORAGE_KEY);
    if (rawV2) return normalizeCompareUnifiedSettings(JSON.parse(rawV2));

    const rawV1 = localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (rawV1) {
      const migrated = normalizeCompareUnifiedSettings(JSON.parse(rawV1));
      writeCompareSettingsToStorage(migrated);
      localStorage.removeItem(LEGACY_SETTINGS_KEY);
      return migrated;
    }
    return DEFAULT_COMPARE_UNIFIED_SETTINGS;
  } catch {
    return DEFAULT_COMPARE_UNIFIED_SETTINGS;
  }
}

export function writeCompareSettingsToStorage(settings: CompareUnifiedSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      PROJECT_COMPARE_SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizeCompareUnifiedSettings(settings)),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function buildCompareSettingsKey(settings: CompareUnifiedSettings): string {
  return [
    settings.tierId,
    settings.facadeSlug ?? "",
    settings.engineeringSlugs.join(","),
    settings.constructionSlugs.join(","),
    settings.transportBandId,
  ].join("|");
}

export function aggregateCompareQuoteLineAmounts(
  quotes: ReadonlyMap<string, CompareQuoteCell>,
  facadeSlug: string | null,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const cell of quotes.values()) {
    if (cell.error) continue;
    for (const line of [...cell.engineeringLines, ...cell.constructionLines]) {
      if (!map.has(line.id)) map.set(line.id, line.amountRub);
    }
    if (facadeSlug && cell.facadeTotalRub > 0) {
      map.set(`facade:${facadeSlug}`, cell.facadeTotalRub);
    }
  }
  return map;
}
