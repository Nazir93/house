import { SOCIAL_LINKS } from "@/lib/constants";

/**
 * Ссылки на мессенджеры по номеру телефона (международный формат, поле contact.phoneRaw).
 */
export function telegramChatUrlFromRawPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://t.me/+${digits}`;
}

function normalizeMaxHttpUrl(raw: string): string | null {
  const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(href);
    const hostOk =
      parsed.hostname === "max.ru" ||
      parsed.hostname.endsWith(".max.ru") ||
      parsed.hostname === "web.max.ru";
    if (!hostOk) return null;

    // С лендинга max.ru/id…_biz в браузер ведёт web.max.ru/id…_biz
    if (parsed.hostname === "max.ru" && parsed.pathname.length > 1) {
      return `https://web.max.ru${parsed.pathname}${parsed.search}`;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Публичная ссылка Max для кнопок «Написать» на сайте.
 * Дефолт: web.max.ru/id5300018030_biz — «Открыть в браузере» с официальной страницы бизнеса в Max.
 */
export function maxMessengerChatUrl(configuredUrl?: string | null): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_MAX_CHAT_URL?.trim(),
    configuredUrl?.trim(),
    SOCIAL_LINKS.max?.trim(),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const normalized = normalizeMaxHttpUrl(candidate);
    if (normalized) return normalized;
  }

  return null;
}
