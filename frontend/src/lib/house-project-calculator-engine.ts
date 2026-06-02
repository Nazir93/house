/**
 * Калькулятор стоимости на карточке проекта (ТЗ: категории a–f, коэффициенты, формулы).
 * Числовые значения приходят из конфига БД; здесь только типы формул и расчёт.
 */

import type { PartOfSoulFacadeVariant, PartOfSoulRoofPitch, PartOfSoulWallMaterial } from "@/lib/part-of-soul-pricing";

export type HouseCalculatorCategoryId = "a" | "b" | "c" | "d" | "e" | "f";

export interface CategoryCoefficients {
  facade: number;
  perimeter: number;
  roof: number;
  soffit: number;
  gutter: number;
  overlap: number;
  insulation: number;
  cross: number;
}

export interface CategoryShellPrices {
  gas: number;
  ceramic: number;
  brick: number;
}

export interface HouseCalculatorCategoryDef {
  id: HouseCalculatorCategoryId;
  label: string;
  floors: 1 | 1.5 | 2;
  roof: PartOfSoulRoofPitch;
  coefficients: CategoryCoefficients;
  shellPrices: CategoryShellPrices;
}

export type EngineeringOptionCode =
  | "electric"
  | "radiators"
  | "water"
  | "heatedFloor"
  | "sewer"
  | "boiler"
  | "bio";

export type ConstructionOptionCode =
  | "interior_plaster"
  | "blind_area"
  | "drainage"
  | "soffits"
  | "gutter"
  | "roof_folding"
  | "roof_soft"
  | "roof_insulation_200"
  | "roof_insulation_250"
  | "monolithic_stairs"
  | "monolithic_overlap";

export type PricingType =
  | "per_area"
  | "fixed"
  | "per_blind_area"
  | "per_perimeter"
  | "per_soffit_length"
  | "per_gutter_length"
  | "per_roof"
  | "per_overlap_area";

export interface PricedOptionDef {
  label: string;
  pricingType: PricingType;
  price: number;
  enabled: boolean;
  description?: string | null;
  imageUrl?: string | null;
}

export interface HouseProjectCalculatorSettings {
  smallAreaThresholdM2: number;
  smallAreaSurcharge: number;
  blindAreaWidthM: number;
}

export interface HouseProjectCalculatorConfig {
  categories: Record<HouseCalculatorCategoryId, HouseCalculatorCategoryDef>;
  facades: Record<PartOfSoulFacadeVariant, { label: string; pricePerM2: number }>;
  engineering: Record<string, PricedOptionDef>;
  construction: Record<string, PricedOptionDef>;
  settings: HouseProjectCalculatorSettings;
}

export interface DerivedMetrics {
  buildingArea: number;
  roofArea: number;
  insulationArea: number;
  facadeArea: number;
  perimeter: number;
  blindArea: number;
  soffitLength: number;
  gutterLength: number;
  overlapArea: number;
}

export interface QuoteLineItem {
  id: string;
  label: string;
  amountRub: number;
  group: "shell" | "facade" | "engineering" | "construction";
}

export interface HouseProjectQuoteInput {
  buildingArea: number;
  categoryId: HouseCalculatorCategoryId;
  wallMaterial: PartOfSoulWallMaterial;
  facadeVariant?: PartOfSoulFacadeVariant | null;
  engineeringCodes: string[];
  constructionCodes: string[];
  projectAdjustmentPercent?: number;
  transportSurchargeRub?: number;
}

export interface HouseProjectQuoteResult {
  categoryId: HouseCalculatorCategoryId;
  shellTotalRub: number;
  facadeTotalRub: number;
  engineeringLines: QuoteLineItem[];
  engineeringTotalRub: number;
  constructionLines: QuoteLineItem[];
  constructionTotalRub: number;
  transportSurchargeRub: number;
  subtotalBeforeAdjustmentRub: number;
  grandTotalRub: number;
  /** Не показывать пользователю — только для админки/аудита */
  adjustmentPercentApplied: number;
  adjustmentAmountRub: number;
}

const CATEGORY_FLOOR_ROOF: Record<
  HouseCalculatorCategoryId,
  { floors: 1 | 1.5 | 2; roof: PartOfSoulRoofPitch }
> = {
  a: { floors: 1, roof: "dual" },
  b: { floors: 1, roof: "triple" },
  c: { floors: 1, roof: "quad" },
  d: { floors: 1.5, roof: "dual" },
  e: { floors: 1.5, roof: "triple" },
  f: { floors: 2, roof: "quad" },
};

const LADDER_CATEGORIES = new Set<HouseCalculatorCategoryId>(["d", "e", "f"]);
const OVERLAP_CATEGORIES = new Set<HouseCalculatorCategoryId>(["d", "e", "f"]);

export function getHouseCalculatorCategoryParams(
  categoryId: HouseCalculatorCategoryId
): { floors: 1 | 1.5 | 2; roof: PartOfSoulRoofPitch } {
  return CATEGORY_FLOOR_ROOF[categoryId];
}

export function resolveHouseCalculatorCategory(params: {
  explicit?: HouseCalculatorCategoryId | null;
  floors: 1 | 1.5 | 2;
  roof: PartOfSoulRoofPitch;
}): HouseCalculatorCategoryId | null {
  if (params.explicit && CATEGORY_FLOOR_ROOF[params.explicit]) {
    const def = CATEGORY_FLOOR_ROOF[params.explicit];
    if (def.floors === params.floors && def.roof === params.roof) return params.explicit;
  }
  for (const [id, def] of Object.entries(CATEGORY_FLOOR_ROOF) as [
    HouseCalculatorCategoryId,
    (typeof CATEGORY_FLOOR_ROOF)[HouseCalculatorCategoryId],
  ][]) {
    if (def.floors === params.floors && def.roof === params.roof) return id;
  }
  return null;
}

export function deriveMetrics(
  buildingArea: number,
  coefficients: CategoryCoefficients,
  blindAreaWidthM: number
): DerivedMetrics {
  const area = Math.max(buildingArea, 0);
  const perimeter = area * coefficients.perimeter;
  return {
    buildingArea: area,
    roofArea: area * coefficients.roof,
    insulationArea: area * coefficients.roof * coefficients.insulation,
    facadeArea: area * coefficients.facade,
    perimeter,
    blindArea: perimeter * blindAreaWidthM,
    soffitLength: perimeter * coefficients.soffit,
    gutterLength: perimeter * coefficients.gutter,
    overlapArea: area * coefficients.overlap,
  };
}

function shellPricePerM2(
  category: HouseCalculatorCategoryDef,
  wall: PartOfSoulWallMaterial
): number {
  return category.shellPrices[wall];
}

export function computeShellTotalRub(params: {
  buildingArea: number;
  category: HouseCalculatorCategoryDef;
  wallMaterial: PartOfSoulWallMaterial;
  smallAreaThresholdM2: number;
  smallAreaSurcharge: number;
}): number {
  const area = Math.max(params.buildingArea, 0);
  const rate = shellPricePerM2(params.category, params.wallMaterial);
  let total = rate * area;
  if (area > 0 && area < params.smallAreaThresholdM2) {
    total *= 1 + params.smallAreaSurcharge;
  }
  return Math.round(total);
}

export function computeFacadeTotalRub(params: {
  buildingArea: number;
  category: HouseCalculatorCategoryDef;
  facadeVariant: PartOfSoulFacadeVariant;
  facadePricePerM2: number;
}): number {
  const metrics = deriveMetrics(params.buildingArea, params.category.coefficients, 0.8);
  return Math.round(metrics.facadeArea * params.facadePricePerM2);
}

function isConstructionAllowed(
  code: string,
  categoryId: HouseCalculatorCategoryId
): boolean {
  if (code === "monolithic_stairs") return LADDER_CATEGORIES.has(categoryId);
  if (code === "monolithic_overlap") return OVERLAP_CATEGORIES.has(categoryId);
  return true;
}

export function computeConstructionOptionRub(
  code: string,
  option: PricedOptionDef,
  metrics: DerivedMetrics,
  categoryId: HouseCalculatorCategoryId
): number {
  if (!option.enabled) return 0;
  if (!isConstructionAllowed(code, categoryId)) return 0;

  switch (option.pricingType) {
    case "fixed":
      return Math.round(option.price);
    case "per_blind_area":
      return Math.round(metrics.blindArea * option.price);
    case "per_perimeter":
      return Math.round(metrics.perimeter * option.price);
    case "per_soffit_length":
      return Math.round(metrics.soffitLength * option.price);
    case "per_gutter_length":
      return Math.round(metrics.gutterLength * option.price);
    case "per_roof":
      return Math.round(metrics.roofArea * option.price);
    case "per_overlap_area":
      return Math.round(metrics.overlapArea * option.price);
    case "per_area":
      return Math.round(metrics.buildingArea * option.price);
    default:
      return 0;
  }
}

export function computeRoofInsulationRub(
  code: "roof_insulation_200" | "roof_insulation_250",
  option: PricedOptionDef,
  metrics: DerivedMetrics,
  categoryId: HouseCalculatorCategoryId
): number {
  if (!option.enabled) return 0;
  return Math.round(metrics.roofArea * option.price);
}

export function computeEngineeringOptionRub(
  code: string,
  option: PricedOptionDef,
  buildingArea: number
): number {
  if (!option.enabled) return 0;
  if (option.pricingType === "fixed") return Math.round(option.price);
  return Math.round(Math.max(buildingArea, 0) * option.price);
}

export function computeHouseProjectQuote(
  input: HouseProjectQuoteInput,
  config: HouseProjectCalculatorConfig
): HouseProjectQuoteResult | null {
  const category = config.categories[input.categoryId];
  if (!category) return null;

  const settings = config.settings;
  const metrics = deriveMetrics(
    input.buildingArea,
    category.coefficients,
    settings.blindAreaWidthM
  );

  const shellTotalRub = computeShellTotalRub({
    buildingArea: input.buildingArea,
    category,
    wallMaterial: input.wallMaterial,
    smallAreaThresholdM2: settings.smallAreaThresholdM2,
    smallAreaSurcharge: settings.smallAreaSurcharge,
  });

  let facadeTotalRub = 0;
  if (input.facadeVariant) {
    const facadeDef = config.facades[input.facadeVariant];
    if (facadeDef) {
      facadeTotalRub = computeFacadeTotalRub({
        buildingArea: input.buildingArea,
        category,
        facadeVariant: input.facadeVariant,
        facadePricePerM2: facadeDef.pricePerM2,
      });
    }
  }

  const engineeringLines: QuoteLineItem[] = [];
  for (const code of input.engineeringCodes) {
    const opt = config.engineering[code];
    if (!opt?.enabled) continue;
    const amount = computeEngineeringOptionRub(code, opt, input.buildingArea);
    if (amount <= 0) continue;
    engineeringLines.push({
      id: code,
      label: opt.label,
      amountRub: amount,
      group: "engineering",
    });
  }
  const engineeringTotalRub = engineeringLines.reduce((s, l) => s + l.amountRub, 0);

  const constructionLines: QuoteLineItem[] = [];
  for (const code of input.constructionCodes) {
    const opt = config.construction[code];
    if (!opt) continue;
    let amount: number;
    if (code === "roof_insulation_200" || code === "roof_insulation_250") {
      amount = computeRoofInsulationRub(code, opt, metrics, input.categoryId);
    } else {
      amount = computeConstructionOptionRub(code, opt, metrics, input.categoryId);
    }
    if (amount <= 0) continue;
    constructionLines.push({
      id: code,
      label: opt.label,
      amountRub: amount,
      group: "construction",
    });
  }
  const constructionTotalRub = constructionLines.reduce((s, l) => s + l.amountRub, 0);

  const transportSurchargeRub = Math.round(input.transportSurchargeRub ?? 0);
  const subtotalBeforeAdjustmentRub =
    shellTotalRub + facadeTotalRub + engineeringTotalRub + constructionTotalRub + transportSurchargeRub;

  const adjustmentPercent = input.projectAdjustmentPercent ?? 0;
  const adjustmentAmountRub = Math.round(subtotalBeforeAdjustmentRub * (adjustmentPercent / 100));
  const grandTotalRub = subtotalBeforeAdjustmentRub + adjustmentAmountRub;

  return {
    categoryId: input.categoryId,
    shellTotalRub,
    facadeTotalRub,
    engineeringLines,
    engineeringTotalRub,
    constructionLines,
    constructionTotalRub,
    transportSurchargeRub,
    subtotalBeforeAdjustmentRub,
    grandTotalRub,
    adjustmentPercentApplied: adjustmentPercent,
    adjustmentAmountRub,
  };
}

/** Публичный ответ API — без служебных полей и коэффициентов. */
export function toPublicQuoteResult(quote: HouseProjectQuoteResult) {
  return {
    categoryId: quote.categoryId,
    shellTotalRub: quote.shellTotalRub,
    facadeTotalRub: quote.facadeTotalRub,
    engineeringLines: quote.engineeringLines.map(({ id, label, amountRub }) => ({
      id,
      label,
      amountRub,
    })),
    engineeringTotalRub: quote.engineeringTotalRub,
    constructionLines: quote.constructionLines.map(({ id, label, amountRub }) => ({
      id,
      label,
      amountRub,
    })),
    constructionTotalRub: quote.constructionTotalRub,
    transportSurchargeRub: quote.transportSurchargeRub,
    grandTotalRub: quote.grandTotalRub,
  };
}

export function isConstructionOptionAllowed(
  code: ConstructionOptionCode,
  categoryId: HouseCalculatorCategoryId
): boolean {
  return isConstructionAllowed(code, categoryId);
}

export function isAddonAllowedForCategory(
  spec: { kind: string; code?: string },
  categoryId: HouseCalculatorCategoryId
): boolean {
  if (spec.kind === "construction" && spec.code) {
    return isConstructionAllowed(spec.code as ConstructionOptionCode, categoryId);
  }
  if (spec.kind === "monolithic_stairs") return LADDER_CATEGORIES.has(categoryId);
  if (spec.kind === "monolithic_overlap") return OVERLAP_CATEGORIES.has(categoryId);
  return true;
}
