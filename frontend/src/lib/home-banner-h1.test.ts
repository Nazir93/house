import { describe, expect, it } from "vitest";

import { resolveHomeBannerH1 } from "@/lib/home-banner-h1";
import { getCommercialPageSeo } from "@/lib/seo/commercial-page-seo";

describe("resolveHomeBannerH1 (SEO §1.3)", () => {
  it("берёт SEO H1, а не marketing-строки баннера", () => {
    const seo = getCommercialPageSeo("home");
    expect(
      resolveHomeBannerH1(seo.h1, ["Строим дома,", "в которые хочется", "возвращаться"]),
    ).toBe("Строительство домов под ключ в Санкт-Петербурге и Ленинградской области");
  });

  it("если SEO пустой — склеивает строки баннера через пробел", () => {
    expect(resolveHomeBannerH1("  ", ["Строим дома,", "в которые хочется"])).toBe(
      "Строим дома, в которые хочется",
    );
  });
});
