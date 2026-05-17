/** Пока ЭП не подключена — дату вводит администратор; после подключения — автоматически дата и время. */
export const CLIENT_DOCUMENT_ES_SIGNING_ENABLED = false;

/** Дата подписания из поля type="date" (YYYY-MM-DD) в админке. */
export function parseAdminSignedDateInput(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Дата и время подписания при ЭП (автоматически). */
export function electronicSignTimestamp(now: Date = new Date()): Date {
  return now;
}

export function formatAdminSignedDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultAdminSignedDateInput(now: Date = new Date()): string {
  return formatAdminSignedDateInput(now);
}

/** Отображение «Дата подписания» в админке и ЛК. */
export function formatDocumentSignedAtRu(
  d: Date | string | null | undefined,
  options?: { withTime?: boolean }
): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  const withTime = options?.withTime ?? CLIENT_DOCUMENT_ES_SIGNING_ENABLED;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}
