/**
 * Ссылки на мессенджеры по номеру телефона (международный формат, поле contact.phoneRaw).
 */
export function telegramChatUrlFromRawPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://t.me/+${digits}`;
}

/**
 * Max: открыть диалог с номером в приложении / на web.max.ru (если номер привязан к аккаунту).
 * Формат протестирован для российских мобильных номеров.
 */
export function maxChatUrlFromRawPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const e164 = `+${digits}`;
  return `https://web.max.ru/add?phone=${encodeURIComponent(e164)}`;
}
