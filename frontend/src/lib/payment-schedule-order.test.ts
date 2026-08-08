import { describe, expect, it } from "vitest";
import { movePaymentScheduleRow, reindexPaymentScheduleRows } from "@/lib/payment-schedule-order";

describe("reindexPaymentScheduleRows", () => {
  it("выставляет order по позиции, даже если в строках старые номера", () => {
    const rows = [
      { order: 5, label: "A" },
      { order: 0, label: "B" },
      { order: 2, label: "C" },
    ];
    expect(reindexPaymentScheduleRows(rows)).toEqual([
      { order: 0, label: "A" },
      { order: 1, label: "B" },
      { order: 2, label: "C" },
    ]);
  });
});

describe("movePaymentScheduleRow", () => {
  it("поднимает строку и пересчитывает order", () => {
    const rows = [
      { order: 0, label: "A" },
      { order: 1, label: "B" },
      { order: 2, label: "C" },
    ];
    expect(movePaymentScheduleRow(rows, 2, -1)).toEqual([
      { order: 0, label: "A" },
      { order: 1, label: "C" },
      { order: 2, label: "B" },
    ]);
  });

  it("не меняет список на краю", () => {
    const rows = [
      { order: 0, label: "A" },
      { order: 1, label: "B" },
    ];
    expect(movePaymentScheduleRow(rows, 0, -1)).toEqual(rows);
    expect(movePaymentScheduleRow(rows, 1, 1)).toEqual(rows);
  });
});
