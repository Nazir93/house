import { describe, expect, it } from "vitest";
import {
  buildUpcomingPaymentSummary,
  isAwaitingPayment,
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
  it("isAwaitingPayment — только EXPECTED", () => {
    expect(isAwaitingPayment("EXPECTED")).toBe(true);
    expect(isAwaitingPayment("NOT_ISSUED")).toBe(false);
    expect(isAwaitingPayment("PAID")).toBe(false);
    expect(isUnpaidPayment("NOT_ISSUED")).toBe(false);
  });

  it("buildUpcomingPaymentSummary — один платёж EXPECTED", () => {
    const summary = buildUpcomingPaymentSummary(base);
    expect(summary?.payments.map((p) => p.label)).toEqual(["Заливка фундамента"]);
    expect(summary?.totalAmountKopeks).toBe(420_000_00);
  });

  it("buildUpcomingPaymentSummary — NOT_ISSUED не входит", () => {
    const summary = buildUpcomingPaymentSummary(base);
    expect(summary?.payments.some((p) => p.status === "NOT_ISSUED")).toBe(false);
  });

  it("buildUpcomingPaymentSummary — суммирует несколько EXPECTED", () => {
    const rows = [
      { ...base[1]!, id: "a", label: "Аванс", amountKopeks: 100_00, order: 0 },
      { ...base[1]!, id: "b", label: "Коробка", amountKopeks: 200_00, order: 1 },
      base[2]!,
    ];
    const summary = buildUpcomingPaymentSummary(rows);
    expect(summary?.payments.map((p) => p.label)).toEqual(["Аванс", "Коробка"]);
    expect(summary?.totalAmountKopeks).toBe(300_00);
  });

  it("buildUpcomingPaymentSummary — пусто без EXPECTED", () => {
    expect(buildUpcomingPaymentSummary([{ ...base[0]!, status: "PAID" }])).toBeNull();
    expect(
      buildUpcomingPaymentSummary([{ ...base[2]!, status: "NOT_ISSUED" }])
    ).toBeNull();
  });

  it("pickNextUnpaidPayment — первый из EXPECTED (совместимость)", () => {
    expect(pickNextUnpaidPayment(base)?.label).toBe("Заливка фундамента");
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
