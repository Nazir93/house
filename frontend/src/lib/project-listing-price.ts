import type { MaterialFilterId } from "@/lib/project-filters";
import {
  getEffectiveCalculatorUi,
  type HouseProjectItem,
} from "@/lib/construction-data";
import {
  computePartOfSoulShellTotalRub,
  inferPartOfSoulFloors,
  resolveProjectRoofPitch,
  tierIdToWallMaterial,
  type PartOfSoulWallMaterial,
} from "@/lib/part-of-soul-pricing";

export function listingWallForMaterialFilter(material: MaterialFilterId): PartOfSoulWallMaterial {
  if (material === "keramoblok") return "ceramic";
  if (material === "kirpich") return "brick";
  return "gas";
}

/**
 * Индекс тарифа стен в герое/калькуляторе по фильтру каталога (?material=).
 * Если материал не найден в списке тарифов — 0 (как раньше).
 */
export function heroTierIndexForMaterialFilter(
  tiers: ReadonlyArray<{ id: string; label: string }>,
  material: MaterialFilterId,
): number {
  if (!tiers.length || material === "all") return 0;
  const wall = listingWallForMaterialFilter(material);
  const idx = tiers.findIndex((t) => tierIdToWallMaterial(t.id, t.label) === wall);
  return idx >= 0 ? idx : 0;
}

/**
 * Расчётная цена коробки (₽/м² × площадь, PDF «Часть души»).
 * Используется в каталоге, если менеджер не задал цену вручную.
 */
export function resolveDefaultShellPriceRub(
  project: HouseProjectItem,
  wall: PartOfSoulWallMaterial = "gas",
): number {
  const calculatorUi = getEffectiveCalculatorUi(project);
  const pos = calculatorUi.partOfSoul;
  const pricingFloors = inferPartOfSoulFloors(project.floors, pos?.pricingFloors);
  const roof = resolveProjectRoofPitch(pricingFloors, pos?.defaultRoof);
  const computed = computePartOfSoulShellTotalRub({
    areaSqm: project.area,
    pf: pricingFloors,
    roof,
    wall,
    smallThresholdSqm: pos?.smallHouseThresholdSqm ?? 100,
    shellSurchargeIfSmall: pos?.shellSurchargeUnderThreshold ?? 0.15,
  });
  return computed != null && computed > 0 ? computed : 0;
}

/** @deprecated используйте resolveDefaultShellPriceRub */
export function resolveDefaultGasShellPriceRub(project: HouseProjectItem): number {
  return resolveDefaultShellPriceRub(project, "gas");
}

/**
 * Цена для каталога: ручная из админки (газобетон / «любой материал») или расчёт по материалу фильтра.
 */
export function resolveProjectListingPriceRub(
  project: HouseProjectItem,
  material: MaterialFilterId = "all",
): number {
  const manual = Math.round(Number(project.price));
  if (manual > 0 && (material === "all" || material === "gazobeton")) {
    return manual;
  }
  return resolveDefaultShellPriceRub(project, listingWallForMaterialFilter(material));
}
