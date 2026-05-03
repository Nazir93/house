import { describe, expect, it } from "vitest";
import { paymentAmountKopeksFromAdminPayload } from "./client-payment-amount";

describe("paymentAmountKopeksFromAdminPayload", () => {
  it("приоритет amountKopeks", () => {
    expect(
      paymentAmountKopeksFromAdminPayload({
        amountKopeks: 85000000,
        amountRubles: 1,
      })
    ).toBe(85_000_000);
  });

  it("рубли в копейки", () => {
    expect(paymentAmountKopeksFromAdminPayload({ amountRubles: 850_000 })).toBe(85_000_000);
    expect(paymentAmountKopeksFromAdminPayload({ amountRubles: "850000.50" })).toBe(85_000_050);
  });

  it("отсутствие суммы — 0", () => {
    expect(paymentAmountKopeksFromAdminPayload({})).toBe(0);
    expect(paymentAmountKopeksFromAdminPayload({ amountKopeks: "", amountRubles: "" })).toBe(0);
  });

  it("не уходит в минус", () => {
    expect(paymentAmountKopeksFromAdminPayload({ amountKopeks: -100 })).toBe(0);
  });
});
