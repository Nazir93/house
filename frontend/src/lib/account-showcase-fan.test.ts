import { describe, expect, it } from "vitest";

import {
  accountShowcaseFanCssTransform,
  accountShowcaseFanStyle,
  accountShowcaseStackOverlapMarginPx,
} from "@/lib/account-showcase-fan";

describe("accountShowcaseFanStyle", () => {
  it("центр веера без сдвига и нулевой угол", () => {
    const mid = accountShowcaseFanStyle(3, 7);
    expect(mid.rotateDeg).toBe(0);
    expect(mid.translateXPx).toBe(0);
    expect(mid.topOffsetPx).toBe(36);
  });

  it("крайние карточки зеркальны влево/вправо", () => {
    const left = accountShowcaseFanStyle(0, 7);
    const right = accountShowcaseFanStyle(6, 7);
    expect(left.rotateDeg).toBe(-right.rotateDeg);
    expect(left.translateXPx).toBe(-right.translateXPx);
    expect(left.topOffsetPx).toBe(0);
    expect(right.topOffsetPx).toBeGreaterThan(left.topOffsetPx);
  });

  it("не ломается на пустом/одном элементе", () => {
    expect(accountShowcaseFanStyle(0, 1)).toEqual({
      rotateDeg: 0,
      translateXPx: 0,
      topOffsetPx: 0,
    });
    expect(accountShowcaseFanStyle(-2, 3).topOffsetPx).toBe(0);
  });
});

describe("accountShowcaseFanCssTransform", () => {
  it("собирает CSS transform", () => {
    expect(
      accountShowcaseFanCssTransform({ rotateDeg: -1.65, translateXPx: -16, topOffsetPx: 0 }),
    ).toBe("rotate(-1.65deg) translate3d(-16px, 0, 0)");
  });
});

describe("accountShowcaseStackOverlapMarginPx", () => {
  it("между карточками — сильный отрицательный margin для наложения", () => {
    expect(accountShowcaseStackOverlapMarginPx(false)).toBeLessThan(-200);
  });

  it("у последней карточки margin 0 — не схлопывает футер", () => {
    expect(accountShowcaseStackOverlapMarginPx(true)).toBe(0);
  });
});
