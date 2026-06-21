import { prisma } from "@/lib/db";
import { getCalculatorConfig, buildPublicCatalog } from "@/lib/calculator-catalog";
import { getEffectiveCalculatorUi, normalizeCalculatorJson } from "@/lib/construction-data";
import {
  computeProjectCalculatorQuote,
  finalizeProjectQuote,
  resolveProjectCategory,
  toPublicQuoteResult,
} from "@/lib/house-project-calculator-quote";
import {
  inferPartOfSoulFloors,
  resolveProjectRoofPitch,
  tierIdToWallMaterial,
  type PartOfSoulFacadeVariant,
} from "@/lib/part-of-soul-pricing";
import { computeTransportSurchargeRub, normalizeTransportBands } from "@/lib/project-transport-surcharge";
import {
  getHouseCalculatorCategoryParams,
  isHouseCalculatorCategoryId,
  type HouseCalculatorCategoryId,
} from "@/lib/house-project-calculator-engine";
import { sanitizeConstructionOptionSelection } from "@/lib/project-calculator-option-selection";

export type ProjectQuoteRequest = {
  tierId: string;
  tierLabel: string;
  facadeSlug?: string | null;
  engineeringSlugs: string[];
  constructionSlugs: string[];
  transportBandId?: string;
};

function parseDisabledIds(overrides: unknown): string[] {
  if (!overrides || typeof overrides !== "object") return [];
  const o = overrides as Record<string, unknown>;
  if (!Array.isArray(o.disabledOptionIds)) return [];
  return o.disabledOptionIds.map(String);
}

export async function computeProjectQuoteForSlug(projectSlug: string, body: ProjectQuoteRequest) {
  const project = await prisma.houseProject.findUnique({
    where: { slug: projectSlug },
    select: {
      slug: true,
      title: true,
      area: true,
      floors: true,
      calculatorJson: true,
      calculatorCategory: true,
      projectAdjustmentPercent: true,
      calculatorOptionOverrides: true,
      published: true,
    },
  });

  if (!project?.published) {
    return { error: "not_found" as const };
  }

  const calculatorUi = getEffectiveCalculatorUi({
    calculatorUi: normalizeCalculatorJson(project.calculatorJson),
  } as never);

  const explicitCategory =
    project.calculatorCategory &&
    isHouseCalculatorCategoryId(project.calculatorCategory) ?
      (project.calculatorCategory as HouseCalculatorCategoryId)
    : null;

  const explicitCategoryParams = explicitCategory ? getHouseCalculatorCategoryParams(explicitCategory) : null;
  const pricingFloors =
    explicitCategoryParams?.floors ??
    inferPartOfSoulFloors(project.floors, calculatorUi.partOfSoul?.pricingFloors);
  const roofPitch =
    explicitCategoryParams?.roof ??
    resolveProjectRoofPitch(pricingFloors, calculatorUi.partOfSoul?.defaultRoof);

  const categoryId = resolveProjectCategory({
    calculatorCategory: explicitCategory,
    pricingFloors,
    roofPitch,
  });

  if (!categoryId) {
    return { error: "no_category" as const };
  }

  const disabledIds = parseDisabledIds(project.calculatorOptionOverrides);
  const config = await getCalculatorConfig();
  const catalog = buildPublicCatalog(config, categoryId, disabledIds);

  const allowedEng = new Set(catalog.engineering.filter((o) => o.allowed).map((o) => o.slug));
  const allowedCon = new Set(catalog.construction.filter((o) => o.allowed).map((o) => o.slug));
  const constructionSlugs = sanitizeConstructionOptionSelection(body.constructionSlugs);

  for (const slug of body.engineeringSlugs) {
    if (!allowedEng.has(slug)) return { error: "invalid_option" as const, slug };
  }
  for (const slug of constructionSlugs) {
    if (!allowedCon.has(slug)) return { error: "invalid_option" as const, slug };
  }

  if (body.facadeSlug) {
    const ok = catalog.facades.some((f) => f.slug === body.facadeSlug);
    if (!ok) return { error: "invalid_facade" as const };
  }

  const formulaQuote = computeProjectCalculatorQuote(
    {
      buildingArea: project.area,
      categoryId,
      wallMaterial: tierIdToWallMaterial(body.tierId, body.tierLabel),
      facadeVariant: (body.facadeSlug as PartOfSoulFacadeVariant) || null,
      engineeringCodes: body.engineeringSlugs,
      constructionCodes: constructionSlugs,
      projectAdjustmentPercent: 0,
      transportSurchargeRub: 0,
    },
    config
  );

  if (!formulaQuote) return { error: "calc_failed" as const };

  const transportBands = normalizeTransportBands(calculatorUi.transportBands);
  const transportBand = transportBands.find((b) => b.id === body.transportBandId) ?? transportBands[0];
  const transportBase =
    formulaQuote.shellTotalRub +
    formulaQuote.facadeTotalRub +
    formulaQuote.engineeringTotalRub +
    formulaQuote.constructionTotalRub;
  const transportSurchargeRub = computeTransportSurchargeRub(transportBase, transportBand);

  const quote = finalizeProjectQuote({
    formulaQuote,
    fixedExtrasRub: 0,
    transportSurchargeRub,
    adjustmentPercent: project.projectAdjustmentPercent ?? 0,
  });

  return {
    quote: toPublicQuoteResult(quote),
    meta: {
      projectSlug: project.slug,
      projectTitle: project.title,
      categoryId,
      area: project.area,
      pricingFloors,
      roofPitch,
    },
  };
}
