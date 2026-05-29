import type { ClientPaymentStatus, ClientStageStatus } from "@prisma/client";

export function formatDateRu(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Дата и время — для переписки в обращениях. */
export function formatDateTimeRu(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function kopeksToRubles(k: number): number {
  return Math.round(k / 100);
}

export function paymentStatusLabel(s: ClientPaymentStatus): string {
  switch (s) {
    case "PAID":
      return "Оплачен";
    case "EXPECTED":
      return "Ожидает оплаты";
    case "NOT_ISSUED":
      return "Не выставлен";
    default:
      return s;
  }
}

export function stageStatusLabel(s: ClientStageStatus): string {
  switch (s) {
    case "DONE":
      return "Сдан клиенту";
    case "IN_PROGRESS":
      return "В работе";
    case "NOT_STARTED":
      return "Ожидает старта";
    default:
      return s;
  }
}

export function ticketStatusLabel(s: string): string {
  switch (s) {
    case "OPEN":
      return "Открыт";
    case "IN_PROGRESS":
      return "В работе";
    case "CLOSED":
      return "Закрыт";
    default:
      return "Неизвестный статус";
  }
}
