import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";
import {
  DEFAULT_MORTGAGE_PAGE_SETTINGS,
  parseMortgagePageSettings,
  type MortgagePageSettings,
} from "@/lib/mortgage-settings-schema";

/** Ключ в SiteSettings: JSON страницы /mortgage */
export const MORTGAGE_PAGE_SETTINGS_KEY = "mortgage_page_json";

const getCachedMortgageSettings = unstable_cache(
  async (): Promise<MortgagePageSettings> => {
    try {
      const row = await prisma.siteSettings.findUnique({
        where: { key: MORTGAGE_PAGE_SETTINGS_KEY },
      });
      if (row?.value?.trim()) {
        try {
          const parsed = JSON.parse(row.value) as unknown;
          return parseMortgagePageSettings(parsed);
        } catch {
          return DEFAULT_MORTGAGE_PAGE_SETTINGS;
        }
      }
    } catch {
      // БД недоступна
    }
    return DEFAULT_MORTGAGE_PAGE_SETTINGS;
  },
  ["mortgage-page-settings"],
  { revalidate: 30, tags: ["mortgage-page-settings"] }
);

export async function getMortgagePageSettings(): Promise<MortgagePageSettings> {
  return getCachedMortgageSettings();
}
