import { prisma } from "@/lib/db";
import { DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG } from "@/lib/house-project-calculator-config";
import type {
  ConstructionOptionCode,
  EngineeringOptionCode,
  HouseCalculatorCategoryId,
} from "@/lib/house-project-calculator-engine";
import type { PartOfSoulFacadeVariant, PartOfSoulWallMaterial } from "@/lib/part-of-soul-pricing";

type SeedCalculatorCatalogOptions = {
  resetPrices?: boolean;
};

const TZ_SHELL_PRICES: Record<HouseCalculatorCategoryId, Record<PartOfSoulWallMaterial, number>> = {
  a: { gas: 65_825, ceramic: 68_054, brick: 71_462 },
  b: { gas: 66_123, ceramic: 70_161, brick: 73_527 },
  c: { gas: 65_126, ceramic: 68_680, brick: 72_480 },
  d: { gas: 50_890, ceramic: 53_078, brick: 55_409 },
  e: { gas: 51_894, ceramic: 54_259, brick: 56_781 },
  f: { gas: 55_446, ceramic: 56_725, brick: 60_299 },
  g: { gas: 55_446, ceramic: 56_725, brick: 60_299 },
  h: { gas: 55_446, ceramic: 56_725, brick: 60_299 },
};

const TZ_FACADE_PRICES: Record<PartOfSoulFacadeVariant, number> = {
  brick: 19_478,
  plaster: 7_643,
  thermo: 12_309,
  brick_insulated: 22_400,
};

const TZ_ENGINEERING_PRICES: Record<EngineeringOptionCode, number> = {
  electric: 3_839,
  radiators: 4_698,
  water: 667,
  heatedFloor: 7_418,
  sewer: 556,
  boiler: 295_495,
  bio: 351_458,
};

const TZ_CONSTRUCTION_PRICES: Partial<Record<ConstructionOptionCode, number>> = {
  interior_plaster: 0,
  blind_area: 7_428,
  drainage: 6_063,
  soffits: 3_750,
  gutter: 4_143,
  roof_folding: 12_976,
  roof_soft: 12_242,
  roof_insulation_200: 3_823,
  roof_insulation_250: 5_622,
  monolithic_stairs: 228_000,
};

function knownEngineeringPrice(slug: string, fallback: number): number {
  return slug in TZ_ENGINEERING_PRICES ?
      TZ_ENGINEERING_PRICES[slug as EngineeringOptionCode]
    : fallback;
}

function knownConstructionPrice(slug: string, fallback: number): number {
  return slug in TZ_CONSTRUCTION_PRICES ?
      TZ_CONSTRUCTION_PRICES[slug as ConstructionOptionCode] ?? fallback
    : fallback;
}

/** Заполняет справочник калькулятора стартовыми значениями ТЗ для дальнейшего редактирования в админке. */
export async function seedCalculatorCatalog(
  options: SeedCalculatorCatalogOptions = {}
): Promise<{ categories: number; options: number }> {
  const C = DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG;

  await prisma.calculatorSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      smallAreaThresholdM2: C.settings.smallAreaThresholdM2,
      smallAreaSurcharge: C.settings.smallAreaSurcharge,
      addonsSurchargeUnderThreshold: 0.1,
      blindAreaWidthM: C.settings.blindAreaWidthM,
    },
    update: {
      smallAreaThresholdM2: C.settings.smallAreaThresholdM2,
      smallAreaSurcharge: C.settings.smallAreaSurcharge,
      blindAreaWidthM: C.settings.blindAreaWidthM,
    },
  });

  let catCount = 0;
  const ids = Object.keys(C.categories) as HouseCalculatorCategoryId[];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const cat = C.categories[id];
    await prisma.calculatorCategory.upsert({
      where: { id },
      create: {
        id,
        labelRu: cat.label,
        floors: cat.floors,
        roofType: cat.roof,
        facadeCoef: cat.coefficients.facade,
        perimeterCoef: cat.coefficients.perimeter,
        roofCoef: cat.coefficients.roof,
        soffitCoef: cat.coefficients.soffit,
        gutterCoef: cat.coefficients.gutter,
        overlapCoef: cat.coefficients.overlap,
        insulationCoef: cat.coefficients.insulation,
        crossCoef: cat.coefficients.cross,
        sortOrder: i,
        isActive: true,
      },
      update: {
        labelRu: cat.label,
        floors: cat.floors,
        roofType: cat.roof,
        facadeCoef: cat.coefficients.facade,
        perimeterCoef: cat.coefficients.perimeter,
        roofCoef: cat.coefficients.roof,
        soffitCoef: cat.coefficients.soffit,
        gutterCoef: cat.coefficients.gutter,
        overlapCoef: cat.coefficients.overlap,
        insulationCoef: cat.coefficients.insulation,
        crossCoef: cat.coefficients.cross,
        sortOrder: i,
      },
    });
    catCount++;

    for (const wall of ["gas", "ceramic", "brick"] as const) {
      const pricePerM2 = TZ_SHELL_PRICES[id][wall];
      await prisma.calculatorShellPrice.upsert({
        where: {
          categoryId_wallMaterial: { categoryId: id, wallMaterial: wall },
        },
        create: {
          categoryId: id,
          wallMaterial: wall,
          pricePerM2,
        },
        update: options.resetPrices ? { pricePerM2 } : {},
      });
    }
  }

  let fi = 0;
  for (const slug of Object.keys(C.facades) as (keyof typeof C.facades)[]) {
    const f = C.facades[slug];
    const pricePerM2 = TZ_FACADE_PRICES[slug];
    await prisma.calculatorFacadeType.upsert({
      where: { slug },
      create: {
        id: slug,
        slug,
        name: f.label,
        pricePerM2,
        sortOrder: fi++,
        isActive: true,
      },
      update: options.resetPrices ? { name: f.label, pricePerM2 } : { name: f.label },
    });
  }

  let optCount = 0;
  let oi = 0;
  for (const slug of Object.keys(C.engineering) as (keyof typeof C.engineering)[]) {
    const o = C.engineering[slug];
    const pricePerUnit = knownEngineeringPrice(slug, o.price);
    await prisma.calculatorOption.upsert({
      where: { slug },
      create: {
        id: slug,
        slug,
        name: o.label,
        groupSlug: "engineering",
        pricingType: o.pricingType,
        pricePerUnit,
        allowedCategories: [],
        sortOrder: oi++,
        isActive: o.enabled,
      },
      update:
        options.resetPrices ?
          {
            name: o.label,
            pricingType: o.pricingType,
            pricePerUnit,
            isActive: o.enabled,
          }
        : {
            name: o.label,
            pricingType: o.pricingType,
            isActive: o.enabled,
          },
    });
    optCount++;
  }

  for (const slug of Object.keys(C.construction) as (keyof typeof C.construction)[]) {
    const o = C.construction[slug];
    const pricePerUnit = knownConstructionPrice(slug, o.price);
    const allowed: string[] =
      slug === "monolithic_stairs" || slug === "monolithic_overlap" ? ["d", "e", "f", "g", "h"] : [];
    await prisma.calculatorOption.upsert({
      where: { slug },
      create: {
        id: slug,
        slug,
        name: o.label,
        groupSlug: "construction",
        pricingType: o.pricingType,
        pricePerUnit,
        allowedCategories: allowed,
        sortOrder: oi++,
        isActive: o.enabled,
      },
      update:
        options.resetPrices ?
          {
            name: o.label,
            pricingType: o.pricingType,
            pricePerUnit,
            allowedCategories: allowed,
            isActive: o.enabled,
          }
        : {
            name: o.label,
            pricingType: o.pricingType,
            allowedCategories: allowed,
            isActive: o.enabled,
          },
    });
    optCount++;
  }

  return { categories: catCount, options: optCount };
}
