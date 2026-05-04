/** Разбор тела ошибки POST /api/leads для показа пользователю */
export async function readLeadError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; details?: unknown };
    if (data.error) return data.error;
  } catch {
    /* not json */
  }
  if (response.status === 429) return "Слишком много отправок. Подождите несколько минут.";
  if (response.status >= 500) return "Сервер временно недоступен. Позвоните нам.";
  return "Не удалось отправить заявку. Проверьте поля или позвоните нам.";
}
