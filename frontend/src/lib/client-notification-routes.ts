import type { ClientNotificationType } from "@prisma/client";

/** Куда ведёт уведомление при переходе из центра уведомлений (п. 10 ТЗ). */
export const CLIENT_NOTIFICATION_ROUTES: Record<ClientNotificationType, string> = {
  PAYMENT_EXPECTED: "/account/payments",
  STAGE_IN_PROGRESS: "/account/stages",
  STAGE_DONE: "/account/stages",
  DOCUMENT_NEW: "/account/documents",
  PHOTO_NEW: "/account/photos",
  TICKET_REPLY: "/account/support",
};

export function clientNotificationTargetHref(type: ClientNotificationType): string {
  return CLIENT_NOTIFICATION_ROUTES[type] ?? "/account/dashboard";
}

export function clientNotificationReadLabel(readAt: string | Date | null | undefined): string {
  return readAt ? "Прочитано" : "Не прочитано";
}

export function isClientNotificationUnread(readAt: string | Date | null | undefined): boolean {
  return !readAt;
}

export function clientNotificationTypeLabel(type: ClientNotificationType): string {
  switch (type) {
    case "PAYMENT_EXPECTED":
      return "Платёж";
    case "STAGE_IN_PROGRESS":
    case "STAGE_DONE":
      return "Этап строительства";
    case "DOCUMENT_NEW":
      return "Документ";
    case "PHOTO_NEW":
      return "Фотоотчёт";
    case "TICKET_REPLY":
      return "Обращение";
    default:
      return "Событие";
  }
}
