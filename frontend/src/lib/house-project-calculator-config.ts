import type {
  CategoryCoefficients,
  CategoryShellPrices,
  ConstructionOptionCode,
  EngineeringOptionCode,
  HouseCalculatorCategoryDef,
  HouseCalculatorCategoryId,
  HouseProjectCalculatorConfig,
  PricedOptionDef,
} from "@/lib/house-project-calculator-engine";

export const HOUSE_PROJECT_CALCULATOR_SETTINGS_KEY = "house_project_calculator_json";

const COEF: Record<HouseCalculatorCategoryId, CategoryCoefficients> = {
  a: { facade: 1.4, perimeter: 0.42, roof: 1.3, soffit: 0.6, gutter: 0.6, overlap: 0, insulation: 1, cross: 1 },
  b: { facade: 1.45, perimeter: 0.43, roof: 1.38, soffit: 0.65, gutter: 0.75, overlap: 0, insulation: 1, cross: 1 },
  c: { facade: 1.4, perimeter: 0.42, roof: 1.45, soffit: 0.7, gutter: 1, overlap: 0, insulation: 1, cross: 1 },
  d: { facade: 1.85, perimeter: 0.33, roof: 1.2, soffit: 0.55, gutter: 0.6, overlap: 0.55, insulation: 1.2, cross: 1.2 },
  e: { facade: 1.95, perimeter: 0.34, roof: 1.3, soffit: 0.6, gutter: 0.75, overlap: 0.55, insulation: 1.3, cross: 1.3 },
  f: { facade: 2.05, perimeter: 0.3, roof: 0.9, soffit: 0.7, gutter: 1, overlap: 0.5, insulation: 0.85, cross: 0.85 },
};

const SHELL: Record<HouseCalculatorCategoryId, CategoryShellPrices> = {
  a: { gas: 65_825, ceramic: 68_054, brick: 71_462 },
  b: { gas: 66_123, ceramic: 70_161, brick: 73_527 },
  c: { gas: 65_126, ceramic: 68_680, brick: 72_480 },
  d: { gas: 50_890, ceramic: 53_078, brick: 55_409 },
  e: { gas: 51_894, ceramic: 54_259, brick: 56_781 },
  f: { gas: 55_446, ceramic: 56_725, brick: 60_299 },
};

const CATEGORY_LABELS: Record<HouseCalculatorCategoryId, string> = {
  a: "1 этаж, двухскатная кровля",
  b: "1 этаж, трёхскатная кровля",
  c: "1 этаж, четырёхскатная кровля",
  d: "Мансарда, двухскатная кровля",
  e: "Мансарда, трёхскатная кровля",
  f: "2 этажа, четырёхскатная кровля",
};

function buildDefaultCategories(): Record<HouseCalculatorCategoryId, HouseCalculatorCategoryDef> {
  const ids: HouseCalculatorCategoryId[] = ["a", "b", "c", "d", "e", "f"];
  const floorRoof: Record<HouseCalculatorCategoryId, { floors: 1 | 1.5 | 2; roof: "dual" | "triple" | "quad" }> = {
    a: { floors: 1, roof: "dual" },
    b: { floors: 1, roof: "triple" },
    c: { floors: 1, roof: "quad" },
    d: { floors: 1.5, roof: "dual" },
    e: { floors: 1.5, roof: "triple" },
    f: { floors: 2, roof: "quad" },
  };
  const out = {} as Record<HouseCalculatorCategoryId, HouseCalculatorCategoryDef>;
  for (const id of ids) {
    out[id] = {
      id,
      label: CATEGORY_LABELS[id],
      floors: floorRoof[id].floors,
      roof: floorRoof[id].roof,
      coefficients: { ...COEF[id] },
      shellPrices: { ...SHELL[id] },
    };
  }
  return out;
}

function eng(code: EngineeringOptionCode, label: string, pricingType: "per_area" | "fixed", price: number): PricedOptionDef {
  return { label, pricingType, price, enabled: true };
}

function con(
  label: string,
  pricingType: PricedOptionDef["pricingType"],
  price: number,
  enabled = true
): PricedOptionDef {
  return { label, pricingType, price, enabled };
}

export const DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG: HouseProjectCalculatorConfig = {
  categories: buildDefaultCategories(),
  facades: {
    brick: { label: "Облицовка кирпичом", pricePerM2: 19_478 },
    plaster: { label: "Штукатурка с утеплением", pricePerM2: 7_643 },
    thermo: { label: "Термопанели", pricePerM2: 12_309 },
    brick_insulated: { label: "Облицовка кирпичом с утеплением", pricePerM2: 22_400 },
  },
  engineering: {
    electric: eng("electric", "Электроснабжение", "per_area", 3_839),
    radiators: eng("radiators", "Радиаторы", "per_area", 4_698),
    water: eng("water", "Разводка воды", "per_area", 667),
    heatedFloor: eng("heatedFloor", "Тёплый пол", "per_area", 7_418),
    sewer: eng("sewer", "Канализация", "per_area", 556),
    boiler: eng("boiler", "Котельная", "fixed", 295_495),
    bio: eng("bio", "Станция биоочистки", "fixed", 351_458),
  },
  construction: {
    blind_area: con("Отмостка", "per_blind_area", 7_428),
    drainage: con("Дренаж", "per_perimeter", 6_063),
    soffits: con("Софиты", "per_soffit_length", 3_750),
    gutter: con("Водосточка", "per_gutter_length", 4_143),
    roof_folding: con("Фальцевая кровля", "per_roof", 12_976),
    roof_soft: con("Мягкая кровля", "per_roof", 12_242),
    roof_insulation_200: con("Утепление кровли 200 мм", "per_roof", 3_823),
    roof_insulation_250: con("Утепление кровли 250 мм", "per_roof", 5_622),
    monolithic_stairs: con("Монолитная лестница", "fixed", 228_000),
    monolithic_overlap: con("Монолитное перекрытие", "per_overlap_area", 8_500),
  },
  settings: {
    smallAreaThresholdM2: 100,
    smallAreaSurcharge: 0.15,
    blindAreaWidthM: 0.8,
  },
};

function finiteOr(defaultVal: number, v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : defaultVal;
}

function mergeCoefficients(def: CategoryCoefficients, raw: unknown): CategoryCoefficients {
  if (!raw || typeof raw !== "object") return { ...def };
  const o = raw as Record<string, unknown>;
  return {
    facade: finiteOr(def.facade, o.facade),
    perimeter: finiteOr(def.perimeter, o.perimeter),
    roof: finiteOr(def.roof, o.roof),
    soffit: finiteOr(def.soffit, o.soffit),
    gutter: finiteOr(def.gutter, o.gutter),
    overlap: finiteOr(def.overlap, o.overlap),
    insulation: finiteOr(def.insulation, o.insulation),
    cross: finiteOr(def.cross, o.cross),
  };
}

function mergeShellPrices(def: CategoryShellPrices, raw: unknown): CategoryShellPrices {
  if (!raw || typeof raw !== "object") return { ...def };
  const o = raw as Record<string, unknown>;
  return {
    gas: finiteOr(def.gas, o.gas),
    ceramic: finiteOr(def.ceramic, o.ceramic),
    brick: finiteOr(def.brick, o.brick),
  };
}

function mergePricedOption(def: PricedOptionDef, raw: unknown): PricedOptionDef {
  if (!raw || typeof raw !== "object") return { ...def };
  const o = raw as Record<string, unknown>;
  return {
    label: typeof o.label === "string" && o.label.trim() ? o.label : def.label,
    pricingType: def.pricingType,
    price: finiteOr(def.price, o.price),
    enabled: typeof o.enabled === "boolean" ? o.enabled : def.enabled,
  };
}

export function mergeHouseProjectCalculatorConfig(raw: unknown): HouseProjectCalculatorConfig {
  const def = DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG;
  if (!raw || typeof raw !== "object") return structuredClone(def);

  const o = raw as Record<string, unknown>;
  const categories = structuredClone(def.categories);
  if (o.categories && typeof o.categories === "object") {
    for (const id of Object.keys(def.categories) as HouseCalculatorCategoryId[]) {
      const patch = (o.categories as Record<string, unknown>)[id];
      if (!patch || typeof patch !== "object") continue;
      const p = patch as Record<string, unknown>;
      categories[id] = {
        ...categories[id],
        label: typeof p.label === "string" && p.label.trim() ? p.label : categories[id].label,
        coefficients: mergeCoefficients(categories[id].coefficients, p.coefficients),
        shellPrices: mergeShellPrices(categories[id].shellPrices, p.shellPrices),
      };
    }
  }

  let facades = structuredClone(def.facades);
  if (o.facades && typeof o.facades === "object") {
    for (const key of Object.keys(def.facades) as (keyof typeof def.facades)[]) {
      const patch = (o.facades as Record<string, unknown>)[key];
      if (!patch || typeof patch !== "object") continue;
      const p = patch as Record<string, unknown>;
      facades[key] = {
        label: typeof p.label === "string" && p.label.trim() ? p.label : facades[key].label,
        pricePerM2: finiteOr(facades[key].pricePerM2, p.pricePerM2),
      };
    }
  }

  let engineering = structuredClone(def.engineering);
  if (o.engineering && typeof o.engineering === "object") {
    for (const key of Object.keys(def.engineering) as EngineeringOptionCode[]) {
      const patch = (o.engineering as Record<string, unknown>)[key];
      if (patch !== undefined) engineering[key] = mergePricedOption(engineering[key], patch);
    }
  }

  let construction = structuredClone(def.construction);
  if (o.construction && typeof o.construction === "object") {
    for (const key of Object.keys(def.construction) as ConstructionOptionCode[]) {
      const patch = (o.construction as Record<string, unknown>)[key];
      if (patch !== undefined) construction[key] = mergePricedOption(construction[key], patch);
    }
  }

  let settings = { ...def.settings };
  if (o.settings && typeof o.settings === "object") {
    const s = o.settings as Record<string, unknown>;
    settings = {
      smallAreaThresholdM2: finiteOr(def.settings.smallAreaThresholdM2, s.smallAreaThresholdM2),
      smallAreaSurcharge: finiteOr(def.settings.smallAreaSurcharge, s.smallAreaSurcharge),
      blindAreaWidthM: finiteOr(def.settings.blindAreaWidthM, s.blindAreaWidthM),
    };
  }

  return { categories, facades, engineering, construction, settings };
}

export async function getHouseProjectCalculatorConfig(): Promise<HouseProjectCalculatorConfig> {
  const { getCalculatorConfig } = await import("@/lib/calculator-catalog");
  return getCalculatorConfig();
}

export function formatHouseProjectCalculatorConfigJson(config: HouseProjectCalculatorConfig): string {
  return JSON.stringify(config, null, 2);
}
