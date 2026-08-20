import type { Prisma } from "@prisma/client";

/** Статусы заявки, которые можно выставить вручную (список и карточка). */
export const LEAD_EDITABLE_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
export type LeadEditableStatus = (typeof LEAD_EDITABLE_STATUSES)[number];

export const LEAD_EDITABLE_STATUS_OPTIONS = [
  { value: "NEW", label: "Новая" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Завершена" },
  { value: "CANCELLED", label: "Отменена" },
] as const;

/** Статусы заявки в админке (фильтр списка). */
export const LEAD_STATUS_OPTIONS = [
  { value: "ALL", label: "Все статусы" },
  { value: "NEW", label: "Новые" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Завершённые" },
  { value: "CANCELLED", label: "Отменённые" },
] as const;

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Завершена",
  CANCELLED: "Отменена",
};

/** Проверка статуса для PATCH из списка/карточки. */
export function parseLeadEditableStatus(value: unknown): LeadEditableStatus | null {
  if (typeof value !== "string") return null;
  return (LEAD_EDITABLE_STATUSES as readonly string[]).includes(value)
    ? (value as LeadEditableStatus)
    : null;
}

export const LEAD_STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-500/20 text-blue-400",
  IN_PROGRESS: "bg-[#0F3D2E]/25 text-emerald-300",
  DONE: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-red-500/20 text-red-400",
};

export const LEAD_STATUS_BUTTON_STYLES: Record<string, string> = {
  NEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  IN_PROGRESS: "bg-[#0F3D2E]/25 text-emerald-300 border-[#0F3D2E]/35",
  DONE: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

/** Компактные группы для фильтра на /admin/leads (вместо десятков кнопок по каждой форме). */
export const LEAD_SOURCE_FILTERS = [
  { value: "", label: "Все формы" },
  { value: "calculator", label: "Калькулятор и расчёт" },
  { value: "lp", label: "Рекламные LP" },
  { value: "design", label: "Проектирование" },
  { value: "mortgage", label: "Ипотека" },
  { value: "services", label: "Страницы услуг" },
  { value: "partners", label: "Партнёрам" },
  { value: "promo", label: "Промо QR" },
  { value: "about", label: "Связь с руководством" },
  { value: "portfolio", label: "Экскурсия / портфолио" },
] as const;

const CALCULATOR_SOURCES = [
  "calculator",
  "calculator-pizza",
  "price-smeta",
  "project-calculator",
  "house-project-design",
] as const;

/** Prisma-условие для фильтра источника в списке заявок. */
export function leadSourceFilterWhere(filterId: string): Prisma.LeadWhereInput | null {
  if (!filterId) return null;

  switch (filterId) {
    case "calculator":
      return { source: { in: [...CALCULATOR_SOURCES] } };
    case "lp":
      return { source: { startsWith: "lp-" } };
    case "design":
      return { source: { in: ["individual-design", "house-project-design"] } };
    case "mortgage":
      return { source: { in: ["mortgage", "house-project-mortgage"] } };
    case "services":
      return { source: { startsWith: "service-" } };
    case "partners":
      return { source: { startsWith: "partner-" } };
    case "promo":
      return { source: "promo-qr-banner" };
    case "about":
      return { source: "about-leadership-feedback" };
    case "portfolio":
      return { source: { in: ["portfolio-tour", "portfolio-case-cta"] } };
    default:
      return { source: filterId };
  }
}
