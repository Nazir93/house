import { getCalculatorConfig } from "@/lib/calculator-catalog";
import {
  computeShellPricesForTiers,
  resolveProjectCategory,
} from "@/lib/house-project-calculator-quote";
import { getEffectiveCalculatorUi, normalizeCalculatorJson, resolveProjectHeroPricing } from "@/lib/construction-data";
import type { HeroPricingTier, HouseProjectItem } from "@/lib/construction-data";
import { inferPartOfSoulFloors, resolveProjectRoofPitch } from "@/lib/part-of-soul-pricing";
import type { HouseCalculatorCategoryId } from "@/lib/house-project-calculator-engine";

export async function getHeroShellTiersForProject(project: HouseProjectItem): Promise<HeroPricingTier[]> {
  const heroResolved = resolveProjectHeroPricing(project);
  const calculatorUi = getEffectiveCalculatorUi(project);
  const pricingFloors = inferPartOfSoulFloors(
    project.floors,
    calculatorUi.partOfSoul?.pricingFloors
  );
  const roofPitch = resolveProjectRoofPitch(pricingFloors, calculatorUi.partOfSoul?.defaultRoof);

  const explicitCategory =
    project.calculatorCategory &&
    ["a", "b", "c", "d", "e", "f"].includes(project.calculatorCategory) ?
      (project.calculatorCategory as HouseCalculatorCategoryId)
    : null;

  const categoryId = resolveProjectCategory({
    calculatorCategory: explicitCategory,
    pricingFloors,
    roofPitch,
  });

  if (!categoryId) return heroResolved.tiers;

  try {
    const config = await getCalculatorConfig();
    return computeShellPricesForTiers({
      buildingArea: project.area,
      categoryId,
      tiers: heroResolved.tiers,
      config,
    });
  } catch {
    return heroResolved.tiers;
  }
}
