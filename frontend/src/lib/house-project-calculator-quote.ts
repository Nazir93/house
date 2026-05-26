import type { CalculatorAddonItem } from "@/lib/project-calculator-types";
import type { PartOfSoulFacadeVariant, PartOfSoulRoofPitch, PartOfSoulWallMaterial } from "@/lib/part-of-soul-pricing";
import { tierIdToWallMaterial } from "@/lib/part-of-soul-pricing";
import {
  computeHouseProjectQuote,
  resolveHouseCalculatorCategory,
  toPublicQuoteResult,
  type ConstructionOptionCode,
  type EngineeringOptionCode,
  type HouseCalculatorCategoryId,
  type HouseProjectCalculatorConfig,
  type HouseProjectQuoteInput,
  type HouseProjectQuoteResult,
} from "@/lib/house-project-calculator-engine";

export type ProjectCalculatorAddonSpec =
  | { kind: "engineering"; code: EngineeringOptionCode }
  | { kind: "facade"; variant: PartOfSoulFacadeVariant }
  | { kind: "construction"; code: ConstructionOptionCode }
  | { kind: "fixed"; rub: number };

export function addonSpecFromItem(item: CalculatorAddonItem): ProjectCalculatorAddonSpec | null {
  const spec = item.calculatorAddon ?? item.partOfSoulAddon;
  if (!spec) {
    if (item.price > 0) return { kind: "fixed", rub: item.price };
    return null;
  }
  if (spec.kind === "engineering") return { kind: "engineering", code: spec.code as EngineeringOptionCode };
  if (spec.kind === "facade") return { kind: "facade", variant: spec.variant };
  if (spec.kind === "construction") return { kind: "construction", code: spec.code as ConstructionOptionCode };
  if (spec.kind === "fixed") return { kind: "fixed", rub: spec.rub };
  return null;
}

export function buildQuoteInputFromSelections(params: {
  buildingArea: number;
  categoryId: HouseCalculatorCategoryId;
  tierId: string;
  tierLabel: string;
  selectedAddonItems: CalculatorAddonItem[];
  projectAdjustmentPercent?: number;
  transportSurchargeRub?: number;
}): HouseProjectQuoteInput {
  const wallMaterial = tierIdToWallMaterial(params.tierId, params.tierLabel);
  const engineeringCodes: EngineeringOptionCode[] = [];
  const constructionCodes: ConstructionOptionCode[] = [];
  let facadeVariant: PartOfSoulFacadeVariant | null = null;

  for (const item of params.selectedAddonItems) {
    const spec = addonSpecFromItem(item);
    if (!spec) continue;
    if (spec.kind === "engineering") {
      engineeringCodes.push(spec.code);
    } else if (spec.kind === "facade") {
      facadeVariant = spec.variant;
    } else if (spec.kind === "construction") {
      constructionCodes.push(spec.code);
    }
  }

  return {
    buildingArea: params.buildingArea,
    categoryId: params.categoryId,
    wallMaterial,
    facadeVariant,
    engineeringCodes,
    constructionCodes,
    projectAdjustmentPercent: params.projectAdjustmentPercent,
    transportSurchargeRub: params.transportSurchargeRub ?? 0,
  };
}

export function resolveProjectCategory(params: {
  calculatorCategory?: HouseCalculatorCategoryId | null;
  pricingFloors: 1 | 1.5 | 2;
  roofPitch: PartOfSoulRoofPitch;
}): HouseCalculatorCategoryId | null {
  return resolveHouseCalculatorCategory({
    explicit: params.calculatorCategory,
    floors: params.pricingFloors,
    roof: params.roofPitch,
  });
}

export function computeProjectCalculatorQuote(
  input: HouseProjectQuoteInput,
  config: HouseProjectCalculatorConfig
): HouseProjectQuoteResult | null {
  return computeHouseProjectQuote(input, config);
}

/** Итог с транспортом, фиксированными позициями и корректировкой проекта. */
export function finalizeProjectQuote(params: {
  formulaQuote: HouseProjectQuoteResult;
  fixedExtrasRub: number;
  transportSurchargeRub: number;
  adjustmentPercent: number;
}): HouseProjectQuoteResult {
  const { formulaQuote, fixedExtrasRub, transportSurchargeRub, adjustmentPercent } = params;
  const subtotalBeforeAdjustmentRub =
    formulaQuote.shellTotalRub +
    formulaQuote.facadeTotalRub +
    formulaQuote.engineeringTotalRub +
    formulaQuote.constructionTotalRub +
    fixedExtrasRub +
    transportSurchargeRub;
  const adjustmentAmountRub = Math.round(subtotalBeforeAdjustmentRub * (adjustmentPercent / 100));
  return {
    ...formulaQuote,
    constructionTotalRub: formulaQuote.constructionTotalRub + fixedExtrasRub,
    transportSurchargeRub,
    subtotalBeforeAdjustmentRub,
    adjustmentPercentApplied: adjustmentPercent,
    adjustmentAmountRub,
    grandTotalRub: subtotalBeforeAdjustmentRub + adjustmentAmountRub,
  };
}

export function computeShellPricesForTiers(params: {
  buildingArea: number;
  categoryId: HouseCalculatorCategoryId;
  tiers: { id: string; label: string }[];
  config: HouseProjectCalculatorConfig;
}): { id: string; label: string; price: number }[] {
  const category = params.config.categories[params.categoryId];
  if (!category) return params.tiers.map((t) => ({ ...t, price: 0 }));

  return params.tiers.map((t) => {
    const wall = tierIdToWallMaterial(t.id, t.label);
    const quote = computeHouseProjectQuote(
      {
        buildingArea: params.buildingArea,
        categoryId: params.categoryId,
        wallMaterial: wall,
        engineeringCodes: [],
        constructionCodes: [],
      },
      params.config
    );
    return { ...t, price: quote?.shellTotalRub ?? 0 };
  });
}

export { toPublicQuoteResult };
