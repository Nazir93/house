import { describe, expect, it } from "vitest";
import { resolveProjectPriceOffer, resolveSelectedHeroTierPriceOffer } from "./project-price-offer";

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

describe("resolveSelectedHeroTierPriceOffer", () => {
  it("крупная цена = цена выбранного материала стен", () => {
    expect(resolveSelectedHeroTierPriceOffer(5_522_583)).toEqual({
      currentRub: 5_522_583,
      standardRub: 5_522_583,
      discountRub: 0,
      hasDiscount: false,
    });
  });

  it("смена материала меняет currentRub (не залипает на газоблоке)", () => {
    const gas = resolveSelectedHeroTierPriceOffer(5_086_956);
    const brick = resolveSelectedHeroTierPriceOffer(5_522_583);
    expect(gas.currentRub).toBe(5_086_956);
    expect(brick.currentRub).toBe(5_522_583);
    expect(brick.currentRub).not.toBe(gas.currentRub);
  });
});
