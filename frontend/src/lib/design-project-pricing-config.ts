import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import {
  DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS,
  normalizeDesignProjectPricingSettings,
  type DesignProjectPricingSettings,
} from "@/lib/design-project-pricing";

export const DESIGN_PROJECT_PRICING_SETTINGS_KEY = "design_project_pricing_json";
export const DESIGN_PROJECT_PRICING_CACHE_TAG = "design-project-pricing";

const getCachedDesignProjectPricingSettings = unstable_cache(
  async (): Promise<DesignProjectPricingSettings> => {
    try {
      const row = await prisma.siteSettings.findUnique({
        where: { key: DESIGN_PROJECT_PRICING_SETTINGS_KEY },
      });
      if (row?.value?.trim()) {
        return normalizeDesignProjectPricingSettings(JSON.parse(row.value) as unknown);
      }
    } catch {
      // БД или JSON недоступны — используем безопасные дефолты.
    }
    return DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS;
  },
  ["design-project-pricing"],
  { revalidate: 30, tags: [DESIGN_PROJECT_PRICING_CACHE_TAG] }
);

export async function getDesignProjectPricingSettings(): Promise<DesignProjectPricingSettings> {
  return getCachedDesignProjectPricingSettings();
}
