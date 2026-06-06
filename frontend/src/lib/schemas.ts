import { z } from "zod";

/** Нормализация телефона (неразрывные пробелы и т.п. из буфера обмена) */
function normalizePhoneInput(v: unknown): unknown {
  if (typeof v !== "string") return v;
  return v.replace(/[\u00a0\u202f\u2007]/g, " ").trim();
}

function jsonByteLength(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value) || "").length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export const leadFormSchema = z.object({
  name: z
    .string()
    .min(2, "Введите имя")
    .max(100, "Имя слишком длинное"),
  phone: z.preprocess(
    normalizePhoneInput,
    z
      .string()
      .min(10, "Введите корректный номер телефона")
      .max(30, "Номер слишком длинный")
      .regex(/^[\d\s\+\-\(\)]+$/, "Некорректный формат телефона")
  ),
  /** Пустая строка / отсутствие поля — без email (форма выезда, калькулятор) */
  email: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().email("Некорректный email").optional()
  ),
  service: z.string().max(160).optional(),
  message: z.string().max(1000).optional(),
  honeypot: z.string().max(0, "Bot detected").optional(),
  recaptchaToken: z.string().max(4096).optional(),
  source: z.string().trim().min(1).max(80).optional(),
  pageUrl: z.string().trim().max(1024).optional(),
  utmSource: z.string().trim().max(120).optional().nullable(),
  utmMedium: z.string().trim().max(120).optional().nullable(),
  utmCampaign: z.string().trim().max(160).optional().nullable(),
  utmTerm: z.string().trim().max(160).optional().nullable(),
  calcData: z.unknown().optional().refine((value) => jsonByteLength(value) <= 16_384, {
    message: "Данные расчёта слишком большие",
  }),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

/** Форма «Партнёрам» (поставщик / партнёр) — клиентская валидация перед POST /api/leads */
export const partnerFeedbackFormSchema = z.object({
  name: z.string().min(2, "Введите имя").max(100, "Имя слишком длинное"),
  phone: z.preprocess(
    normalizePhoneInput,
    z
      .string()
      .min(10, "Введите корректный номер телефона")
      .max(30, "Номер слишком длинный")
      .regex(/^[\d\s\+\-\(\)]+$/, "Некорректный формат телефона")
  ),
  email: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().email("Некорректный email").optional()
  ),
  message: z.string().min(10, "Кратко опишите запрос (от 10 символов)").max(1000, "Слишком длинное сообщение"),
  privacy: z.boolean().refine((v) => v === true, { message: "Необходимо согласие" }),
  honeypot: z.string().max(0).optional(),
});

export type PartnerFeedbackFormData = z.infer<typeof partnerFeedbackFormSchema>;

export const callbackFormSchema = z.object({
  name: z.string().min(2, "Введите имя").max(100),
  phone: z
    .string()
    .min(10, "Введите корректный номер")
    .max(20)
    .regex(/^[\d\s\+\-\(\)]+$/, "Некорректный формат"),
  preferredTime: z.enum(["now", "30min", "evening", "tomorrow"]).optional(),
  honeypot: z.string().max(0).optional(),
});

export type CallbackFormData = z.infer<typeof callbackFormSchema>;

export const calculatorSchema = z.object({
  area: z.number().min(1).max(10000),
  points: z.number().min(1).max(500).optional(),
  cameras: z.number().min(1).max(100).optional(),
  needRecording: z.boolean().optional(),
  name: z.string().min(2).max(100),
  phone: z
    .string()
    .min(10)
    .max(20)
    .regex(/^[\d\s\+\-\(\)]+$/),
  honeypot: z.string().max(0).optional(),
});

export type CalculatorData = z.infer<typeof calculatorSchema>;
