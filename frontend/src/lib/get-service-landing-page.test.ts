import { describe, expect, it } from "vitest";
import { SITE_NAME } from "@/lib/constants";
import { cmsServiceSlugFallbackRow, getServiceMetadataDefaults } from "@/lib/get-service-landing-page";

describe("cmsServiceSlugFallbackRow", () => {
  it("proektirovanie: опубликованный шаблон HOUSE_DESIGN", () => {
    const row = cmsServiceSlugFallbackRow("proektirovanie");
    expect(row).not.toBeNull();
    expect(row?.published).toBe(true);
    expect(row?.serviceType).toBe("HOUSE_DESIGN");
  });

  it("неизвестный slug → null", () => {
    expect(cmsServiceSlugFallbackRow("unknown-slug")).toBeNull();
  });
});

describe("getServiceMetadataDefaults", () => {
  it("для ключевой услуги берёт SEO из семантического ядра до обращения к БД", async () => {
    const meta = await getServiceMetadataDefaults("proektirovanie");

    expect(meta?.title).toBe(
      `Проектирование частных домов в СПб и Ленинградской области | ${SITE_NAME}`,
    );
    expect(meta?.description).toContain("Индивидуальное проектирование частных домов");
    expect(meta?.description).toContain("Санкт-Петербурге и Ленинградской области");
    expect(meta?.keywords).toEqual(
      expect.arrayContaining(["проект частного дома", "индивидуальный проект дома"]),
    );
  });
});
