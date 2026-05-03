import { describe, expect, it } from "vitest";
import {
  formatDateRu,
  kopeksToRubles,
  paymentStatusLabel,
  stageStatusLabel,
  ticketStatusLabel,
} from "./client-portal-labels";

describe("client-portal-labels", () => {
  it("formatDateRu для ISO и null", () => {
    expect(formatDateRu(null)).toBe("—");
    const s = formatDateRu(new Date(2025, 2, 12));
    expect(s).not.toBe("—");
    expect(s).toMatch(/2025/);
  });

  it("kopeksToRubles", () => {
    expect(kopeksToRubles(85_000_000)).toBe(850_000);
    expect(kopeksToRubles(99)).toBe(1);
  });

  it("paymentStatusLabel", () => {
    expect(paymentStatusLabel("PAID")).toBe("Оплачен");
    expect(paymentStatusLabel("EXPECTED")).toBe("Ожидается");
    expect(paymentStatusLabel("NOT_ISSUED")).toBe("Не выставлен");
  });

  it("stageStatusLabel", () => {
    expect(stageStatusLabel("DONE")).toBe("Завершён");
    expect(stageStatusLabel("IN_PROGRESS")).toBe("В работе");
    expect(stageStatusLabel("NOT_STARTED")).toBe("Не начат");
  });

  it("ticketStatusLabel", () => {
    expect(ticketStatusLabel("OPEN")).toBe("Открыт");
    expect(ticketStatusLabel("CLOSED")).toBe("Закрыт");
    expect(ticketStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});
