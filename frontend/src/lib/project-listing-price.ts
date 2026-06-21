import type { MaterialFilterId } from "@/lib/project-filters";
import {
  getEffectiveCalculatorUi,
  type HouseProjectItem,
} from "@/lib/construction-data";
import {
  computePartOfSoulShellTotalRub,
  inferPartOfSoulFloors,
  resolveProjectRoofPitch,
  type PartOfSoulWallMaterial,
} from "@/lib/part-of-soul-pricing";

export function listingWallForMaterialFilter(material: MaterialFilterId): PartOfSoulWallMaterial {
  if (material === "keramoblok") return "ceramic";
  if (material === "kirpich") return "brick";
  return "gas";
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
