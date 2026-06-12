import { MESSENGER_CHAT_PHONE_RAW, SOCIAL_LINKS } from "@/lib/constants";

/**
 * Ссылки на мессенджеры по номеру телефона (международный формат, поле contact.phoneRaw).
 */
export function telegramChatUrlFromRawPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://t.me/+${digits}`;
}

/** Открыть чат в Max по номеру (web.max.ru). */
export function maxChatUrlFromRawPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const e164 = `+${digits}`;
  return `https://web.max.ru/add?phone=${encodeURIComponent(e164)}`;
}

function isMaxChannelUrl(href: string): boolean {
  try {
    const { pathname } = new URL(href);
    const path = pathname.replace(/\/$/, "");
    return /_biz$/i.test(path) || /\/channel/i.test(pathname);
  } catch {
    return false;
  }
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
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Ссылка на личный чат в Max (не канал/группа _biz).
 * Приоритет: NEXT_PUBLIC_MAX_CHAT_URL → social_max из админки → SOCIAL_LINKS.max → номер чата.
 */
export function maxMessengerChatUrl(configuredUrl?: string | null): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_MAX_CHAT_URL?.trim(),
    configuredUrl?.trim(),
    SOCIAL_LINKS.max?.trim(),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const normalized = normalizeMaxHttpUrl(candidate);
    if (normalized && !isMaxChannelUrl(normalized)) {
      return normalized;
    }
  }

  const phone =
    process.env.NEXT_PUBLIC_MAX_CHAT_PHONE?.trim() || MESSENGER_CHAT_PHONE_RAW;
  return maxChatUrlFromRawPhone(phone);
}
