import { z } from "zod";
import type { ServiceType } from "@prisma/client";

import { FULL_SERVICE_TYPE_DROPDOWN_OPTIONS } from "@/lib/service-type-admin-options";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const TAG_RE = /<[^>]*>/g;

/** Убираем HTML/скрипты и управляющие символы из пользовательского текста. */
export function sanitizeReviewPlainText(raw: string, maxLen: number): string {
  const stripped = raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(TAG_RE, " ")
    .replace(CONTROL_CHARS, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped) return "";
  return stripped.length > maxLen ? `${stripped.slice(0, maxLen - 1)}…` : stripped;
}

export const reviewSubmitSchema = z.object({
  authorName: z
    .string()
    .min(2, "Укажите имя")
    .max(80, "Слишком длинное имя")
    .transform((v) => sanitizeReviewPlainText(v, 80)),
  objectName: z
    .string()
    .max(120)
    .optional()
    .transform((v) => (v ? sanitizeReviewPlainText(v, 120) : "")),
  rating: z.coerce.number().int().min(1).max(5),
  text: z
    .string()
    .min(20, "Минимум 20 символов")
    .max(2000, "Слишком длинный текст")
    .transform((v) => sanitizeReviewPlainText(v, 2000)),
  honeypot: z.string().optional().default(""),
  recaptchaToken: z.string().optional(),
});

export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>;

export function isReviewSubmitValid(input: ReviewSubmitInput): boolean {
  return input.authorName.length >= 2 && input.text.length >= 20;
}

/** Санитизация полей отзыва из админки (те же правила, что у публичной формы). */
export function sanitizeReviewAdminFields(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...body };
  if (typeof body.authorName === "string") {
    out.authorName = sanitizeReviewPlainText(body.authorName, 80);
  }
  if (typeof body.objectName === "string") {
    out.objectName = sanitizeReviewPlainText(body.objectName, 120) || null;
  }
  if (typeof body.text === "string") {
    out.text = sanitizeReviewPlainText(body.text, 5000);
  }
  if (body.service !== undefined) {
    out.service = parseReviewServiceType(body.service);
  }
  return out;
}

const SERVICE_TYPE_VALUES = new Set(
  FULL_SERVICE_TYPE_DROPDOWN_OPTIONS.map((o) => o.value),
);

/** Приводит строку из админки к Prisma ServiceType или null. */
export function parseReviewServiceType(raw: unknown): ServiceType | null {
  if (raw == null || raw === "") return null;
  const value = String(raw).trim();
  if (!SERVICE_TYPE_VALUES.has(value)) return null;
  return value as ServiceType;
}
