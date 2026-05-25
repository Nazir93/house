import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";
import {
  DEFAULT_HOME_HERO_BANNER,
  parseHomeHeroBanner,
  type HomeHeroBanner,
} from "@/lib/home-hero-banner-schema";

export const HOME_HERO_BANNER_SETTINGS_KEY = "home_hero_banner_v1";

const getCachedHomeHeroBanner = unstable_cache(
  async (): Promise<HomeHeroBanner> => {
    try {
      const row = await prisma.siteSettings.findUnique({
        where: { key: HOME_HERO_BANNER_SETTINGS_KEY },
      });
      if (row?.value?.trim()) {
        try {
          return parseHomeHeroBanner(JSON.parse(row.value) as unknown);
        } catch {
          return DEFAULT_HOME_HERO_BANNER;
        }
      }
    } catch {
      // БД недоступна
    }
    return DEFAULT_HOME_HERO_BANNER;
  },
  ["home-hero-banner"],
  { revalidate: 30, tags: ["home-hero-banner"] }
);

export async function getHomeHeroBannerConfig(): Promise<HomeHeroBanner> {
  return getCachedHomeHeroBanner();
}
