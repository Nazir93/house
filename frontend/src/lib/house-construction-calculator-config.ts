import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import {
  DEFAULT_HOUSE_CONSTRUCTION_CONFIG,
  mergeHouseConstructionConfig,
  type HouseConstructionCalculatorConfig,
} from "@/lib/house-construction-calculator";

/** Ключ в таблице SiteSettings: JSON с переопределениями прайса калькулятора */
export const HOUSE_CONSTRUCTION_CALCULATOR_SETTINGS_KEY = "house_construction_calculator_json";

const getCached = unstable_cache(
  async (): Promise<HouseConstructionCalculatorConfig> => {
    try {
      const row = await prisma.siteSettings.findUnique({
        where: { key: HOUSE_CONSTRUCTION_CALCULATOR_SETTINGS_KEY },
      });
      if (row?.value?.trim()) {
        try {
          const parsed = JSON.parse(row.value) as unknown;
          return mergeHouseConstructionConfig(parsed);
        } catch {
          return DEFAULT_HOUSE_CONSTRUCTION_CONFIG;
        }
      }
    } catch {
      // DB недоступна (локально без миграций)
    }
    return DEFAULT_HOUSE_CONSTRUCTION_CONFIG;
  },
  ["house-construction-calculator-config"],
  { revalidate: 30, tags: ["house-construction-calculator-config"] }
);

/** Сервер: актуальный прайс (дефолт + БД). Кэш ~30 с. */
export async function getHouseConstructionCalculatorConfig(): Promise<HouseConstructionCalculatorConfig> {
  return getCached();
}
