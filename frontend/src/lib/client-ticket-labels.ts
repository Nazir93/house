/** Подписи и тексты для обращений (личный кабинет ↔ админка). */

export type TicketAuthorPerspective = "cabinet" | "admin";

/** Кто написал сообщение — без английских CLIENT / STAFF. */
export function ticketAuthorLabel(
  authorType: string,
  perspective: TicketAuthorPerspective
): string {
  if (authorType === "STAFF") return "Компания";
  return perspective === "cabinet" ? "Вы" : "Клиент";
}

const TICKET_API_ERROR_RU: Record<string, string> = {
  Unauthorized: "Требуется вход в личный кабинет",
  "Invalid JSON": "Некорректный запрос",
  "subject and message required": "Укажите тему и текст сообщения",
  "message required": "Введите текст сообщения",
  "Not found": "Обращение не найдено",
  "Ticket closed": "Обращение закрыто — новые сообщения не принимаются",
  "body required": "Введите текст ответа",
  "DB error": "Не удалось сохранить. Попробуйте позже",
};

/** Сообщение об ошибке API для форм обращений (на случай старых английских ключей). */
export function localizeTicketApiError(error: string | undefined, fallback: string): string {
  if (!error) return fallback;
  return TICKET_API_ERROR_RU[error] ?? fallback;
}
