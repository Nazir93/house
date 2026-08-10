import { describe, expect, it } from "vitest";

import {
  isAdvertisingLandingPath,
  siteShellNeedsContactModal,
} from "@/lib/site-shell-routes";

describe("siteShellNeedsContactModal", () => {
  it("на /lp модалка обязательна — иначе CTA «Получить расчёт» молчит", () => {
    expect(isAdvertisingLandingPath("/lp/kirpich")).toBe(true);
    expect(siteShellNeedsContactModal("/lp/kirpich")).toBe(true);
    expect(siteShellNeedsContactModal("/lp/gazobeton")).toBe(true);
  });

  it("на основном сайте модалка есть", () => {
    expect(siteShellNeedsContactModal("/")).toBe(true);
    expect(siteShellNeedsContactModal("/projects")).toBe(true);
  });

  it("в админке и ЛК модалки нет", () => {
    expect(siteShellNeedsContactModal("/admin")).toBe(false);
    expect(siteShellNeedsContactModal("/account/login")).toBe(false);
  });
});
