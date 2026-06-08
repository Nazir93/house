import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG,
  mergeHouseProjectCalculatorConfig,
} from "@/lib/house-project-calculator-config";
import type {
  ConstructionOptionCode,
  EngineeringOptionCode,
  HouseCalculatorCategoryId,
  HouseProjectCalculatorConfig,
} from "@/lib/house-project-calculator-engine";
import type { PartOfSoulFacadeVariant, PartOfSoulRoofPitch } from "@/lib/part-of-soul-pricing";
import { isConstructionOptionAllowed } from "@/lib/house-project-calculator-engine";
import {
  resolveOptionDisplayDescription,
  resolveOptionDisplayImageUrl,
} from "@/lib/project-calculator-option-images";

const CATEGORY_LIMITED_CONSTRUCTION_SLUGS = new Set<string>([
  "monolithic_stairs",
  "monolithic_overlap",
]);

export type PublicCatalogFacade = {
  slug: PartOfSoulFacadeVariant;
  name: string;
};

export type PublicCatalogOption = {
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  groupSlug: "engineering" | "construction";
  allowed: boolean;
};

export type PublicCalculatorCatalog = {
  facades: PublicCatalogFacade[];
  engineering: PublicCatalogOption[];
  construction: PublicCatalogOption[];
};

type CategoryWithShellPrices = Prisma.CalculatorCategoryGetPayload<{
  include: { shellPrices: true };
}>;

function mapDbToConfig(rows: {
  categories: CategoryWithShellPrices[];
  facades: Awaited<ReturnType<typeof prisma.calculatorFacadeType.findMany>>;
  options: Awaited<ReturnType<typeof prisma.calculatorOption.findMany>>;
  settings: Awaited<ReturnType<typeof prisma.calculatorSettings.findUnique>>;
}): HouseProjectCalculatorConfig | null {
  if (rows.categories.length === 0) return null;

  const categories = { ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.categories };
  for (const c of rows.categories) {
    if (!categories[c.id as HouseCalculatorCategoryId]) continue;
    const shellPrices = { gas: 0, ceramic: 0, brick: 0 };
    for (const sp of c.shellPrices) {
      if (sp.wallMaterial === "gas" || sp.wallMaterial === "ceramic" || sp.wallMaterial === "brick") {
        shellPrices[sp.wallMaterial] = sp.pricePerM2;
      }
    }
    categories[c.id as HouseCalculatorCategoryId] = {
      id: c.id as HouseCalculatorCategoryId,
      label: c.labelRu,
      floors: c.floors as 1 | 1.5 | 2,
      roof: c.roofType as PartOfSoulRoofPitch,
      coefficients: {
        facade: c.facadeCoef,
        perimeter: c.perimeterCoef,
        roof: c.roofCoef,
        soffit: c.soffitCoef,
        gutter: c.gutterCoef,
        overlap: c.overlapCoef,
        insulation: c.insulationCoef,
        cross: c.crossCoef,
      },
      shellPrices,
    };
  }
  if (categories.f) {
    categories.g = {
      ...categories.g,
      coefficients: { ...categories.f.coefficients },
      shellPrices: { ...categories.f.shellPrices },
    };
    categories.h = {
      ...categories.h,
      coefficients: { ...categories.f.coefficients },
      shellPrices: { ...categories.f.shellPrices },
    };
  }

  const facades = { ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.facades };
  for (const f of rows.facades) {
    const slug = f.slug as PartOfSoulFacadeVariant;
    if (facades[slug]) {
      facades[slug] = { label: f.name, pricePerM2: f.pricePerM2 };
    }
  }

  const engineering = { ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.engineering };
  const construction = { ...DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG.construction };

  for (const o of rows.options) {
    if (!o.isActive) continue;
    const def = {
      label: o.name,
      pricingType: o.pricingType as import("@/lib/house-project-calculator-engine").PricingType,
      price: o.pricePerUnit,
      enabled: true,
      description: o.description,
      imageUrl: o.imageUrl,
    };
    if (o.groupSlug === "engineering") {
      engineering[o.slug] = def;
    }
    if (o.groupSlug === "construction") {
      construction[o.slug] = def;
    }
  }

  const s = rows.settings;
  const settings = {
    smallAreaThresholdM2: s?.smallAreaThresholdM2 ?? 100,
    smallAreaSurcharge: s?.smallAreaSurcharge ?? 0.15,
    blindAreaWidthM: s?.blindAreaWidthM ?? 0.8,
  };

  return { categories, facades, engineering, construction, settings };
}

async function loadConfigFromDb(): Promise<HouseProjectCalculatorConfig | null> {
  try {
    const [categories, facades, options, settings] = await Promise.all([
      prisma.calculatorCategory.findMany({
        where: { isActive: true },
        include: { shellPrices: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.calculatorFacadeType.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.calculatorOption.findMany({
        where: { isActive: true },
        orderBy: [{ groupSlug: "asc" }, { sortOrder: "asc" }],
      }),
      prisma.calculatorSettings.findUnique({ where: { id: "default" } }),
    ]);
    return mapDbToConfig({ categories, facades, options, settings });
  } catch {
    return null;
  }
}

const getConfigCached = unstable_cache(
  async (): Promise<HouseProjectCalculatorConfig> => {
    const fromDb = await loadConfigFromDb();
    if (fromDb) return fromDb;

    try {
      const { HOUSE_PROJECT_CALCULATOR_SETTINGS_KEY } = await import(
        "@/lib/house-project-calculator-config"
      );
      const row = await prisma.siteSettings.findUnique({
        where: { key: HOUSE_PROJECT_CALCULATOR_SETTINGS_KEY },
      });
      if (row?.value?.trim()) {
        return mergeHouseProjectCalculatorConfig(JSON.parse(row.value) as unknown);
      }
    } catch {
      // ignore
    }

    return structuredClone(DEFAULT_HOUSE_PROJECT_CALCULATOR_CONFIG);
  },
  ["calculator-catalog-config"],
  { revalidate: 30, tags: ["house-project-calculator-config", "calculator-catalog"] }
);

export async function getCalculatorConfig(): Promise<HouseProjectCalculatorConfig> {
  return getConfigCached();
}

export function buildPublicCatalog(
  config: HouseProjectCalculatorConfig,
  categoryId: HouseCalculatorCategoryId,
  disabledOptionIds: string[] = []
): PublicCalculatorCatalog {
  const disabled = new Set(disabledOptionIds);

  const facades = (Object.keys(config.facades) as PartOfSoulFacadeVariant[]).map((slug) => ({
    slug,
    name: config.facades[slug].label,
  }));

  const engineering = Object.keys(config.engineering)
    .filter((slug) => config.engineering[slug]?.enabled)
    .map((slug) => {
      const description = resolveOptionDisplayDescription({
        slug,
        groupSlug: "engineering",
        description: config.engineering[slug].description,
      });
      const imageUrl = resolveOptionDisplayImageUrl({
        slug,
        groupSlug: "engineering",
        imageUrl: config.engineering[slug].imageUrl,
      });
      return {
        slug,
        name: config.engineering[slug].label,
        ...(description ? { description } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        groupSlug: "engineering" as const,
        allowed: !disabled.has(slug),
      };
    });

  const construction = Object.keys(config.construction)
    .filter((slug) => config.construction[slug]?.enabled)
    .map((slug) => {
      const allowedByCategory =
        !CATEGORY_LIMITED_CONSTRUCTION_SLUGS.has(slug) ||
        isConstructionOptionAllowed(slug as ConstructionOptionCode, categoryId);
      const description = resolveOptionDisplayDescription({
        slug,
        groupSlug: "construction",
        description: config.construction[slug].description,
      });
      const imageUrl = resolveOptionDisplayImageUrl({
        slug,
        groupSlug: "construction",
        imageUrl: config.construction[slug].imageUrl,
      });
      return {
        slug,
        name: config.construction[slug].label,
        ...(description ? { description } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        groupSlug: "construction" as const,
        allowed: allowedByCategory && !disabled.has(slug),
      };
    });

  return { facades, engineering, construction };
}

const getPublicCatalogCached = unstable_cache(
  async (): Promise<HouseProjectCalculatorConfig> => getConfigCached(),
  ["calculator-catalog-public-base"],
  { revalidate: 30, tags: ["calculator-catalog"] }
);

export async function getPublicCatalogBase(): Promise<HouseProjectCalculatorConfig> {
  return getPublicCatalogCached();
}

export function revalidateCalculatorCatalog() {
  // called from admin after save — use revalidateTag from admin routes
}
