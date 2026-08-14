import { describe, expect, it } from "vitest";

import {
  assertGeneralContractorHasNoFakes,
  buildGeneralContractorJsonLd,
  PUBLIC_CONTACT_EMAIL_FALLBACK,
  resolvePublicContactEmail,
  splitOfficeStreetAddress,
} from "@/lib/seo/general-contractor-json-ld";

describe("general-contractor-json-ld (ТЗ SEO §17)", () => {
  it("собирает GeneralContractor с контактами как в примере ТЗ", () => {
    const schema = buildGeneralContractorJsonLd({
      phone: "+7 (812) 989-99-01",
      email: "info@chastdushi.ru",
      address: "г. Санкт-Петербург, ул. Ординарная, д. 18",
      includeDescription: false,
      includeOpeningHours: false,
      includeAreaServed: false,
      sameAs: [],
    });

    expect(schema["@type"]).toBe("GeneralContractor");
    expect(schema.name).toBe("Часть души");
    expect(schema.url).toBe("https://chastdushi.ru/");
    expect(schema.telephone).toBe("+7 (812) 989-99-01");
    expect(schema.email).toBe("info@chastdushi.ru");
    expect(schema.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "ул. Ординарная, д. 18",
      addressLocality: "Санкт-Петербург",
      addressCountry: "RU",
    });
    expect(assertGeneralContractorHasNoFakes(schema as unknown as Record<string, unknown>)).toEqual(
      [],
    );
  });

  it("не добавляет фиктивные рейтинги, отзывы, цены и офферы", () => {
    const schema = buildGeneralContractorJsonLd({
      phone: "+7 (812) 989-99-01",
      email: "info@chastdushi.ru",
      address: "ул. Ординарная, д. 18",
    }) as unknown as Record<string, unknown>;

    expect(schema.aggregateRating).toBeUndefined();
    expect(schema.review).toBeUndefined();
    expect(schema.hasOfferCatalog).toBeUndefined();
    expect(schema.offers).toBeUndefined();
    expect(JSON.stringify(schema)).not.toMatch(/AggregateRating|"price"|OfferCatalog/);
  });

  it("areaServed только из реальных регионов сайта, не выдуманный список", () => {
    const schema = buildGeneralContractorJsonLd({
      includeAreaServed: true,
      includeDescription: false,
      includeOpeningHours: false,
    });
    expect(schema.areaServed?.some((a) => a.name === "Санкт-Петербург")).toBe(true);
    expect(schema.areaServed?.every((a) => a.name.trim().length > 0)).toBe(true);
  });

  it("splitOfficeStreetAddress и email fallback", () => {
    expect(splitOfficeStreetAddress("г. Санкт-Петербург, ул. Ординарная, д. 18")).toEqual({
      streetAddress: "ул. Ординарная, д. 18",
      addressLocality: "Санкт-Петербург",
    });
    expect(resolvePublicContactEmail("")).toBe(PUBLIC_CONTACT_EMAIL_FALLBACK);
    expect(resolvePublicContactEmail("  a@b.ru ")).toBe("a@b.ru");
  });
});
