import { describe, expect, it } from "vitest";
import { PROMO_QR_OFFER_SLUGS, PROMO_QR_OFFERS } from "./promo-qr-offers";

describe("promo-qr-offers", () => {
  it("ровно шесть позиций по ТЗ QR-акции", () => {
    expect(PROMO_QR_OFFERS.length).toBe(6);
    expect(PROMO_QR_OFFER_SLUGS.length).toBe(6);
  });

  it("уникальные slug", () => {
    const slugs = PROMO_QR_OFFERS.map((o) => o.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
