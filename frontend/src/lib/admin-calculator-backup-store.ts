import { prisma } from "@/lib/db";
import {
  CALCULATOR_CATALOG_BACKUP_KEY,
  buildCalculatorCatalogSnapshot,
  parseCalculatorCatalogSnapshot,
  type CalculatorCatalogBackupMeta,
  type CalculatorCatalogSnapshot,
  calculatorBackupMetaFromSnapshot,
} from "@/lib/admin-calculator-backup";

async function readLiveCatalogRows() {
  const [categories, facades, options, settings] = await Promise.all([
    prisma.calculatorCategory.findMany({
      include: { shellPrices: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.calculatorFacadeType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.calculatorOption.findMany({ orderBy: [{ groupSlug: "asc" }, { sortOrder: "asc" }] }),
    prisma.calculatorSettings.findUnique({ where: { id: "default" } }),
  ]);
  return { categories, facades, options, settings };
}

export async function captureCalculatorCatalogSnapshot(
  savedAt = new Date().toISOString(),
): Promise<CalculatorCatalogSnapshot> {
  const { categories, facades, options, settings } = await readLiveCatalogRows();
  return buildCalculatorCatalogSnapshot({
    savedAt,
    settings: settings
      ? {
          smallAreaThresholdM2: settings.smallAreaThresholdM2,
          smallAreaSurcharge: settings.smallAreaSurcharge,
          addonsSurchargeUnderThreshold: settings.addonsSurchargeUnderThreshold,
          blindAreaWidthM: settings.blindAreaWidthM,
        }
      : null,
    categories: categories.map((c) => ({
      id: c.id,
      labelRu: c.labelRu,
      floors: c.floors,
      roofType: c.roofType,
      facadeCoef: c.facadeCoef,
      perimeterCoef: c.perimeterCoef,
      roofCoef: c.roofCoef,
      insulationCoef: c.insulationCoef,
      gutterCoef: c.gutterCoef,
      soffitCoef: c.soffitCoef,
      overlapCoef: c.overlapCoef,
      crossCoef: c.crossCoef,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      shellPrices: c.shellPrices.map((p) => ({
        wallMaterial: p.wallMaterial,
        pricePerM2: p.pricePerM2,
      })),
    })),
    facades: facades.map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      pricePerM2: f.pricePerM2,
      sortOrder: f.sortOrder,
      isActive: f.isActive,
    })),
    options: options.map((o) => ({
      id: o.id,
      slug: o.slug,
      name: o.name,
      groupSlug: o.groupSlug,
      pricingType: o.pricingType,
      pricePerUnit: o.pricePerUnit,
      description: o.description,
      imageUrl: o.imageUrl,
      allowedCategories: o.allowedCategories,
      sortOrder: o.sortOrder,
      isActive: o.isActive,
    })),
  });
}

export async function saveCalculatorCatalogBackup(
  snapshot?: CalculatorCatalogSnapshot,
): Promise<CalculatorCatalogSnapshot> {
  const data = snapshot ?? (await captureCalculatorCatalogSnapshot());
  await prisma.siteSettings.upsert({
    where: { key: CALCULATOR_CATALOG_BACKUP_KEY },
    create: { key: CALCULATOR_CATALOG_BACKUP_KEY, value: JSON.stringify(data) },
    update: { value: JSON.stringify(data) },
  });
  return data;
}

export async function readCalculatorCatalogBackup(): Promise<CalculatorCatalogSnapshot | null> {
  const row = await prisma.siteSettings.findUnique({
    where: { key: CALCULATOR_CATALOG_BACKUP_KEY },
  });
  if (!row?.value?.trim()) return null;
  try {
    return parseCalculatorCatalogSnapshot(JSON.parse(row.value) as unknown);
  } catch {
    return null;
  }
}

export async function getCalculatorCatalogBackupMeta(): Promise<CalculatorCatalogBackupMeta> {
  return calculatorBackupMetaFromSnapshot(await readCalculatorCatalogBackup());
}

/** Восстанавливает справочник из снимка (категории/фасады/опции/настройки). */
export async function restoreCalculatorCatalogFromSnapshot(
  snapshot: CalculatorCatalogSnapshot,
): Promise<{ categories: number; facades: number; options: number }> {
  if (snapshot.settings) {
    const s = snapshot.settings;
    await prisma.calculatorSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        smallAreaThresholdM2: s.smallAreaThresholdM2,
        smallAreaSurcharge: s.smallAreaSurcharge,
        addonsSurchargeUnderThreshold: s.addonsSurchargeUnderThreshold,
        blindAreaWidthM: s.blindAreaWidthM,
      },
      update: {
        smallAreaThresholdM2: s.smallAreaThresholdM2,
        smallAreaSurcharge: s.smallAreaSurcharge,
        addonsSurchargeUnderThreshold: s.addonsSurchargeUnderThreshold,
        blindAreaWidthM: s.blindAreaWidthM,
      },
    });
  }

  for (const c of snapshot.categories) {
    await prisma.calculatorCategory.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        labelRu: c.labelRu,
        floors: c.floors,
        roofType: c.roofType,
        facadeCoef: c.facadeCoef,
        perimeterCoef: c.perimeterCoef,
        roofCoef: c.roofCoef,
        soffitCoef: c.soffitCoef,
        gutterCoef: c.gutterCoef,
        overlapCoef: c.overlapCoef,
        insulationCoef: c.insulationCoef,
        crossCoef: c.crossCoef,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      },
      update: {
        labelRu: c.labelRu,
        floors: c.floors,
        roofType: c.roofType,
        facadeCoef: c.facadeCoef,
        perimeterCoef: c.perimeterCoef,
        roofCoef: c.roofCoef,
        soffitCoef: c.soffitCoef,
        gutterCoef: c.gutterCoef,
        overlapCoef: c.overlapCoef,
        insulationCoef: c.insulationCoef,
        crossCoef: c.crossCoef,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      },
    });

    for (const shell of c.shellPrices) {
      await prisma.calculatorShellPrice.upsert({
        where: {
          categoryId_wallMaterial: {
            categoryId: c.id,
            wallMaterial: shell.wallMaterial,
          },
        },
        create: {
          categoryId: c.id,
          wallMaterial: shell.wallMaterial,
          pricePerM2: shell.pricePerM2,
        },
        update: { pricePerM2: shell.pricePerM2 },
      });
    }
  }

  for (const f of snapshot.facades) {
    await prisma.calculatorFacadeType.upsert({
      where: { id: f.id },
      create: {
        id: f.id,
        slug: f.slug,
        name: f.name,
        pricePerM2: f.pricePerM2,
        sortOrder: f.sortOrder,
        isActive: f.isActive,
      },
      update: {
        slug: f.slug,
        name: f.name,
        pricePerM2: f.pricePerM2,
        sortOrder: f.sortOrder,
        isActive: f.isActive,
      },
    });
  }

  for (const o of snapshot.options) {
    await prisma.calculatorOption.upsert({
      where: { id: o.id },
      create: {
        id: o.id,
        slug: o.slug,
        name: o.name,
        groupSlug: o.groupSlug,
        pricingType: o.pricingType,
        pricePerUnit: o.pricePerUnit,
        description: o.description,
        imageUrl: o.imageUrl,
        allowedCategories: o.allowedCategories,
        sortOrder: o.sortOrder,
        isActive: o.isActive,
      },
      update: {
        slug: o.slug,
        name: o.name,
        groupSlug: o.groupSlug,
        pricingType: o.pricingType,
        pricePerUnit: o.pricePerUnit,
        description: o.description,
        imageUrl: o.imageUrl,
        allowedCategories: o.allowedCategories,
        sortOrder: o.sortOrder,
        isActive: o.isActive,
      },
    });
  }

  return {
    categories: snapshot.categories.length,
    facades: snapshot.facades.length,
    options: snapshot.options.length,
  };
}
