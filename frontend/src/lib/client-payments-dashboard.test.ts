import { describe, expect, it } from "vitest";
import {
  isUnpaidPayment,
  pickDashboardPaymentPreview,
  pickNextUnpaidPayment,
} from "./client-payments-dashboard";

const base = [
  {
    id: "1",
    label: "Подписание договора",
    amountKopeks: 1_050_000_00,
    dueDate: new Date("2026-04-01"),
    status: "PAID" as const,
    paidAt: new Date("2026-04-01"),
    order: 0,
  },
  {
    id: "2",
    label: "Заливка фундамента",
    amountKopeks: 420_000_00,
    dueDate: new Date("2026-04-10"),
    status: "EXPECTED" as const,
    paidAt: null,
    order: 1,
  },
  {
    id: "3",
    label: "Стены",
    amountKopeks: 800_000_00,
    dueDate: new Date("2026-05-01"),
    status: "NOT_ISSUED" as const,
    paidAt: null,
    order: 2,
  },
];

describe("client-payments-dashboard (п. 10 ТЗ)", () => {
  it("isUnpaidPayment", () => {
    expect(isUnpaidPayment("EXPECTED")).toBe(true);
    expect(isUnpaidPayment("NOT_ISSUED")).toBe(true);
    expect(isUnpaidPayment("PAID")).toBe(false);
  });

  it("pickNextUnpaidPayment — ближайший по сроку", () => {
    expect(pickNextUnpaidPayment(base)?.label).toBe("Заливка фундамента");
  });

  it("pickNextUnpaidPayment — без неоплаченных", () => {
    expect(
      pickNextUnpaidPayment([{ ...base[0]!, status: "PAID" }])
    ).toBeNull();
  });

  it("pickDashboardPaymentPreview — только первые две позиции", () => {
    const preview = pickDashboardPaymentPreview(base, 2);
    expect(preview).toHaveLength(2);
    expect(preview.map((p) => p.label)).toEqual([
      "Подписание договора",
      "Заливка фундамента",
    ]);
  });

  it("pickDashboardPaymentPreview — меньше двух строк", () => {
    expect(pickDashboardPaymentPreview([base[0]!], 2)).toHaveLength(1);
  });
});
