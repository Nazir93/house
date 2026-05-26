import { prisma } from "@/lib/db";
import { DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG } from "@/lib/house-project-calculator-config";
import type { HouseCalculatorCategoryId } from "@/lib/house-project-calculator-engine";

/** Заполняет таблицы калькулятора значениями из ТЗ (идемпотентно). */
export async function seedCalculatorCatalog(): Promise<{ categories: number; options: number }> {
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
      await prisma.calculatorShellPrice.upsert({
        where: {
          categoryId_wallMaterial: { categoryId: id, wallMaterial: wall },
        },
        create: {
          categoryId: id,
          wallMaterial: wall,
          pricePerM2: cat.shellPrices[wall],
        },
        update: { pricePerM2: cat.shellPrices[wall] },
      });
    }
  }

  let fi = 0;
  for (const slug of Object.keys(C.facades) as (keyof typeof C.facades)[]) {
    const f = C.facades[slug];
    await prisma.calculatorFacadeType.upsert({
      where: { slug },
      create: {
        id: slug,
        slug,
        name: f.label,
        pricePerM2: f.pricePerM2,
        sortOrder: fi++,
        isActive: true,
      },
      update: { name: f.label, pricePerM2: f.pricePerM2 },
    });
  }

  let optCount = 0;
  let oi = 0;
  for (const slug of Object.keys(C.engineering) as (keyof typeof C.engineering)[]) {
    const o = C.engineering[slug];
    await prisma.calculatorOption.upsert({
      where: { slug },
      create: {
        id: slug,
        slug,
        name: o.label,
        groupSlug: "engineering",
        pricingType: o.pricingType,
        pricePerUnit: o.price,
        allowedCategories: [],
        sortOrder: oi++,
        isActive: o.enabled,
      },
      update: {
        name: o.label,
        pricingType: o.pricingType,
        pricePerUnit: o.price,
        isActive: o.enabled,
      },
    });
    optCount++;
  }

  for (const slug of Object.keys(C.construction) as (keyof typeof C.construction)[]) {
    const o = C.construction[slug];
    const allowed: string[] =
      slug === "monolithic_stairs" || slug === "monolithic_overlap" ? ["d", "e", "f"] : [];
    await prisma.calculatorOption.upsert({
      where: { slug },
      create: {
        id: slug,
        slug,
        name: o.label,
        groupSlug: "construction",
        pricingType: o.pricingType,
        pricePerUnit: o.price,
        allowedCategories: allowed,
        sortOrder: oi++,
        isActive: o.enabled,
      },
      update: {
        name: o.label,
        pricingType: o.pricingType,
        pricePerUnit: o.price,
        allowedCategories: allowed,
        isActive: o.enabled,
      },
    });
    optCount++;
  }

  return { categories: catCount, options: optCount };
}
