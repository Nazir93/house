import { describe, expect, it } from "vitest";

import {
  ACCOUNT_LOGIN_SHOWCASE_SLIDES,
  accountLoginShowcaseImages,
} from "@/lib/account-login-showcase";

describe("account-login-showcase", () => {
  it("использует скрины ЛК с главной (/images/account/showcase-*)", () => {
    const images = accountLoginShowcaseImages();
    expect(images).toHaveLength(4);
    for (const src of images) {
      expect(src.startsWith("/images/account/showcase-")).toBe(true);
      expect(src.endsWith("-light.png")).toBe(true);
    }
  });

  it("первый слайд — этапы со скрином stages", () => {
    expect(ACCOUNT_LOGIN_SHOWCASE_SLIDES[0]?.title).toBe("Этапы и сроки");
    expect(ACCOUNT_LOGIN_SHOWCASE_SLIDES[0]?.image).toBe("/images/account/showcase-stages-light.png");
  });

  it("у каждого слайда три пункта фич для чипов", () => {
    for (const slide of ACCOUNT_LOGIN_SHOWCASE_SLIDES) {
      expect(slide.features).toHaveLength(3);
    }
  });
});
