import { z } from "zod";

/** Одна строка таблицы программ и пресет калькулятора */
export const mortgageProgramRowSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().min(1).max(120),
  ratePercent: z.number().min(0).max(50),
  rateLabel: z.string().max(200),
  maxLoanRub: z.number().min(0),
  minDownPaymentPercent: z.number().min(0).max(100),
  shortHint: z.string().max(500),
});

export type MortgageProgramRow = z.infer<typeof mortgageProgramRowSchema>;

export const mortgagePageSettingsSchema = z.object({
  programs: z.array(mortgageProgramRowSchema).min(1).max(20),
  maternityCapitalRub: z.number().min(0).max(5_000_000),
  trustBanks: z.array(z.string().min(1).max(80)).min(1).max(12),
  /** Текст под списком банков-партнёров */
  trustBanksNote: z
    .string()
    .max(1000)
    .default(
      "Перечень и условия аккредитации уточняйте у менеджера: списки банков обновляются."
    ),
  trustPoints: z.array(z.string().min(1).max(400)).min(1).max(12),
  trustDisclaimer: z.string().max(2000),
  programsFootnote: z.string().max(4000),
  calculatorDefaults: z.object({
    price: z.number().min(100_000),
    initialCash: z.number().min(0),
    years: z.number().min(1).max(40),
    rate: z.number().min(0).max(50),
  }),
});

export type MortgagePageSettings = z.infer<typeof mortgagePageSettingsSchema>;

export const DEFAULT_MORTGAGE_PAGE_SETTINGS: MortgagePageSettings = {
  programs: [
    {
      id: "family",
      title: "Семейная ипотека",
      ratePercent: 6,
      rateLabel: "льготная ставка*",
      maxLoanRub: 12_000_000,
      minDownPaymentPercent: 20.1,
      shortHint: "Для семей с детьми при соблюдении условий программы.",
    },
    {
      id: "it",
      title: "IT-ипотека",
      ratePercent: 6,
      rateLabel: "льготная ставка*",
      maxLoanRub: 9_000_000,
      minDownPaymentPercent: 20.1,
      shortHint: "Для работников аккредитованных IT-компаний.",
    },
    {
      id: "rural",
      title: "Сельская ипотека",
      ratePercent: 3,
      rateLabel: "субсидируемая ставка*",
      maxLoanRub: 6_000_000,
      minDownPaymentPercent: 20,
      shortHint: "Строительство в сельской зоне при выполнении условий программы.",
    },
    {
      id: "market",
      title: "Рыночная ипотека",
      ratePercent: 18,
      rateLabel: "от 17% годовых**",
      maxLoanRub: 100_000_000,
      minDownPaymentPercent: 25.1,
      shortHint: "Стандартные программы банков без льготной ставки.",
    },
  ],
  maternityCapitalRub: 632_490,
  trustBanks: ["ВТБ", "Сбербанк", "Дом.РФ"],
  trustBanksNote:
    "Перечень и условия аккредитации уточняйте у менеджера: списки банков обновляются.",
  trustPoints: [
    "Работаем с эскроу-счетами и безопасными схемами оплаты по этапам стройки",
    "Подбор программы и первичная консультация по ипотеке — бесплатно в рамках договора на строительство*",
    "Сопровождаем сделку: комплект документов для банка по объекту индивидуального жилищного строительства",
    "Учитываем материнский капитал и госпрограммы при проектировании графика платежей",
  ],
  trustDisclaimer:
    "* Бесплатная первичная консультация не заменяет услуги банка и не является размещением финансового продукта.",
  programsFootnote:
    "* Условия госпрограмм и лимиты суммы устанавливаются законодательством и банком; ставка по одобрению может отличаться.\n** Рыночная ставка зависит от банка и полной стоимости кредита — уточняйте в одобрении.",
  calculatorDefaults: {
    price: 8_500_000,
    initialCash: 1_800_000,
    years: 25,
    rate: 6,
  },
};

/** Безопасная загрузка из БД / API: при ошибке парсинга — дефолты. */
export function parseMortgagePageSettings(raw: unknown): MortgagePageSettings {
  const r = mortgagePageSettingsSchema.safeParse(raw);
  if (r.success) return r.data;
  return DEFAULT_MORTGAGE_PAGE_SETTINGS;
}
