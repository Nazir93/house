import {
  getEffectiveCalculatorUi,
  type HouseProjectItem,
} from "@/lib/construction-data";
import {
  computePartOfSoulShellTotalRub,
  inferPartOfSoulFloors,
  resolveProjectRoofPitch,
} from "@/lib/part-of-soul-pricing";

/**
 * Расчётная цена коробки из газобетона (₽/м² × площадь, PDF «Часть души»).
 * Используется в каталоге, если менеджер не задал цену вручную.
 */
export function resolveDefaultGasShellPriceRub(project: HouseProjectItem): number {
  const calculatorUi = getEffectiveCalculatorUi(project);
  const pos = calculatorUi.partOfSoul;
  const pricingFloors = inferPartOfSoulFloors(project.floors, pos?.pricingFloors);
  const roof = resolveProjectRoofPitch(pricingFloors, pos?.defaultRoof);
  const computed = computePartOfSoulShellTotalRub({
    areaSqm: project.area,
    pf: pricingFloors,
    roof,
    wall: "gas",
    smallThresholdSqm: pos?.smallHouseThresholdSqm ?? 100,
    shellSurchargeIfSmall: pos?.shellSurchargeUnderThreshold ?? 0.15,
  });
  return computed != null && computed > 0 ? computed : 0;
}

/** Цена для каталога: ручная из админки или расчёт по площади (газобетон). */
export function resolveProjectListingPriceRub(project: HouseProjectItem): number {
  const manual = Math.round(Number(project.price));
  if (manual > 0) return manual;
  return resolveDefaultGasShellPriceRub(project);
}
