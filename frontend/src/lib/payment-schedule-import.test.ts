import { describe, expect, it } from "vitest";
import {
  parsePaymentScheduleFromPlainText,
  parseRussianAmountToRubles,
  withSequentialOrder,
} from "./payment-schedule-import";

describe("parseRussianAmountToRubles", () => {
  it("группы пробелов — целые рубли", () => {
    expect(parseRussianAmountToRubles("1 500 000")).toBe(1_500_000);
    expect(parseRussianAmountToRubles("750 000")).toBe(750_000);
  });

  it("EU-стиль 1.500.000,50", () => {
    expect(parseRussianAmountToRubles("1.500.000,50")).toBe(1_500_000.5);
  });

  it("плоская запись", () => {
    expect(parseRussianAmountToRubles("450000")).toBe(450_000);
  });
});

describe("parsePaymentScheduleFromPlainText", () => {
  it("сохраняет порядок строк как в документе", () => {
    const text = `
График платежей
Аванс 500000
2) Коробка 1 500 000 руб.
Фундамент — 750 000
`;
    const rows = parsePaymentScheduleFromPlainText(text);
    expect(rows.map((r) => r.label)).toEqual(["Аванс", "Коробка", "Фундамент"]);
    expect(rows.map((r) => r.amountRubles)).toEqual([500_000, 1_500_000, 750_000]);
  });

  it("на строке с несколькими числами берётся последняя сумма (справа)", () => {
    const rows = parsePaymentScheduleFromPlainText(
      "Частичная оплата 500 000 из общей 5 400 000 ₽"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.amountRubles).toBe(5_400_000);
  });

  it("игнорирует строку только с процентом без рублей", () => {
    const rows = parsePaymentScheduleFromPlainText("Предоплата 30% от суммы");
    expect(rows).toHaveLength(0);
  });

  it("не путает год в дате с суммой", () => {
    const rows = parsePaymentScheduleFromPlainText("Договор от 15.03.2024 года");
    expect(rows).toHaveLength(0);
  });

  it("заголовок таблицы без суммы не даёт строки", () => {
    const rows = parsePaymentScheduleFromPlainText("Наименование этапа\nФундамент 400 000 руб.");
    expect(rows).toHaveLength(1);
    expect(rows[0]!.label).toBe("Фундамент");
  });
});

describe("withSequentialOrder", () => {
  it("проставляет order подряд", () => {
    const r = withSequentialOrder([{ order: 99, a: 1 } as { order: number; a: number }]);
    expect(r[0]!.order).toBe(0);
  });
});
