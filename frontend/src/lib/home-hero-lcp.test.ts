import { describe, expect, it } from "vitest";

import { buildNextImagePrefetchHref } from "@/lib/image-loading";
import {
  HOME_HERO_LCP_QUALITY,
  HOME_HERO_LCP_WIDTH,
  buildHomeHeroLcpPreloadHref,
} from "@/lib/home-hero-lcp";

describe("home-hero-lcp", () => {
  it("preload: компактный w/q под мобильный LCP (PSI Moto G)", () => {
    expect(HOME_HERO_LCP_WIDTH).toBe(750);
    expect(HOME_HERO_LCP_QUALITY).toBe(60);
    expect(buildHomeHeroLcpPreloadHref("/uploads/1_Post-mplljowr.webp")).toBe(
      buildNextImagePrefetchHref("/uploads/1_Post-mplljowr.webp", HOME_HERO_LCP_WIDTH, HOME_HERO_LCP_QUALITY),
    );
  });
});
