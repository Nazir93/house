import { describe, expect, it } from "vitest";
import { resolveProjectPriceOffer } from "./project-price-offer";

describe("resolveProjectPriceOffer", () => {
  it("показывает скидку, когда ручная цена ниже стандартной", () => {
    expect(
      resolveProjectPriceOffer({
        manualPriceRub: 12_000_000,
        standardPricesRub: [14_200_000, 15_000_000],
      })
    ).toEqual({
      currentRub: 12_000_000,
      standardRub: 14_200_000,
      discountRub: 2_200_000,
      hasDiscount: true,
    });
  });

  it("не показывает скидку, если ручная цена не ниже стандарта", () => {
    expect(
      resolveProjectPriceOffer({
        manualPriceRub: 14_200_000,
        standardPricesRub: [14_200_000],
      }).hasDiscount
    ).toBe(false);
  });
});
