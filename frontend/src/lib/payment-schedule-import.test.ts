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
});

/** Раскладка как на скрине пользователя (5 колонок, суммы 100 000,00). */
const TEMPLATE_FROM_SCREEN = `
График платежей
Оплата работ производится Заказчиком по этапам согласно следующему графику:
№ этапа
Содержание работы по этапу
Дата оплаты (примерные)
Сумма платежа (Рублей)
Роспись Подрядчика за получение
1 этап
При подписании Договора
100 000,00
2 этап
Материалы фундамент
1 500 000,00
3 этап
В день заливки фундамента
1 000 000,00
4 этап
Закупка материалов на стены
1 000 000,00
5 этап
По готовности стен
800 000,00
7 этап
Закупка пиломатериалов и кровли
2 000 000,00
8 этап
По готовности кровли
1 200 000,00
9 этап
При подписании актов выполненных работ
265 056,00
Итого:
7 865 056,00
`;

describe("parsePaymentScheduleFromPlainText — шаблон таблицы", () => {
  const verticalWordLayout = `
Приложение № 3 к договору
График платежей
№ п/п
Содержание работы по этапу
Сумма платежа (Рубли)
1
Аванс
1 500 000
2
Фундамент
750 000
3
Коробка
2 400 000
Итого
4 650 000
`;

  it("вертикальная таблица Word: название и сумма из нужных столбцов", () => {
    const rows = parsePaymentScheduleFromPlainText(verticalWordLayout);
    expect(rows.map((r) => r.label)).toEqual(["Аванс", "Фундамент", "Коробка"]);
    expect(rows.map((r) => r.amountRubles)).toEqual([1_500_000, 750_000, 2_400_000]);
  });

  it("не добавляет шапку документа и строку «Итого»", () => {
    const rows = parsePaymentScheduleFromPlainText(verticalWordLayout);
    expect(rows.some((r) => /приложение|договор|итого/i.test(r.label))).toBe(false);
    expect(rows.some((r) => r.label === "Платёж")).toBe(false);
  });

  it("таблица с табуляцией", () => {
    const text = `№\tСодержание работы по этапу\tСумма платежа (Рубли)
1\tАванс\t1 500 000
2\tФундамент\t750 000
Итого\t\t2 250 000`;
    const rows = parsePaymentScheduleFromPlainText(text);
    expect(rows.map((r) => r.label)).toEqual(["Аванс", "Фундамент"]);
    expect(rows.map((r) => r.amountRubles)).toEqual([1_500_000, 750_000]);
  });

  it("не путает номер этапа с суммой", () => {
    const rows = parsePaymentScheduleFromPlainText(verticalWordLayout);
    expect(rows.every((r) => r.amountRubles >= 1000)).toBe(true);
  });

  it("сохраняет порядок строк", () => {
    const rows = parsePaymentScheduleFromPlainText(verticalWordLayout);
    expect(rows[0]!.label).toBe("Аванс");
    expect(rows[2]!.label).toBe("Коробка");
  });

  it("шаблон со скрина: 5 колонок, № этапа, суммы с копейками", () => {
    const rows = parsePaymentScheduleFromPlainText(TEMPLATE_FROM_SCREEN);
    expect(rows.map((r) => r.label)).toEqual([
      "При подписании Договора",
      "Материалы фундамент",
      "В день заливки фундамента",
      "Закупка материалов на стены",
      "По готовности стен",
      "Закупка пиломатериалов и кровли",
      "По готовности кровли",
      "При подписании актов выполненных работ",
    ]);
    expect(rows.map((r) => r.amountRubles)).toEqual([
      100_000,
      1_500_000,
      1_000_000,
      1_000_000,
      800_000,
      2_000_000,
      1_200_000,
      265_056,
    ]);
    expect(rows.some((r) => /этап$/i.test(r.label) && /^\d/.test(r.label))).toBe(false);
  });

  it("шаблон со скрина — горизонтальная таблица (таб)", () => {
    const text = `№ этапа\tСодержание работы по этапу\tДата оплаты (примерные)\tСумма платежа (Рублей)\tРоспись
1 этап\tПри подписании Договора\t\t100 000,00\t
2 этап\tМатериалы фундамент\t\t1 500 000,00\t
Итого:\t\t\t7 865 056,00\t`;
    const rows = parsePaymentScheduleFromPlainText(text);
    expect(rows).toHaveLength(2);
    expect(rows[0]!.label).toBe("При подписании Договора");
    expect(rows[0]!.amountRubles).toBe(100_000);
  });
});

describe("withSequentialOrder", () => {
  it("проставляет order подряд", () => {
    const r = withSequentialOrder([{ order: 99, a: 1 } as { order: number; a: number }]);
    expect(r[0]!.order).toBe(0);
  });
});
