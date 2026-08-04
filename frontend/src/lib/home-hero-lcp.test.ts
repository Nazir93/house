import { describe, expect, it } from "vitest";

import { buildNextImagePrefetchHref } from "@/lib/image-loading";
import {
  HOME_HERO_LCP_QUALITY,
  HOME_HERO_LCP_WIDTH,
  buildHomeHeroLcpPreloadHref,
} from "@/lib/home-hero-lcp";

describe("home-hero-lcp", () => {
  it("preload указывает на оптимизированный /_next/image под мобильный LCP", () => {
    expect(buildHomeHeroLcpPreloadHref("/uploads/1_Post-mplljowr.webp")).toBe(
      buildNextImagePrefetchHref("/uploads/1_Post-mplljowr.webp", HOME_HERO_LCP_WIDTH, HOME_HERO_LCP_QUALITY),
    );
  });
});
