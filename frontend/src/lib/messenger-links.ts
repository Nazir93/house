import { SOCIAL_LINKS } from "@/lib/constants";

/**
 * Ссылки на мессенджеры по номеру телефона (международный формат, поле contact.phoneRaw).
 */
export function telegramChatUrlFromRawPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://t.me/+${digits}`;
}

export function normalizeMaxHttpUrl(raw: string): string | null {
  const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(href);
    const hostOk =
      parsed.hostname === "max.ru" ||
      parsed.hostname.endsWith(".max.ru") ||
      parsed.hostname === "web.max.ru";
    if (!hostOk) return null;

    // Бизнес-канал _biz: в браузере открывается через web.max.ru
    if (parsed.hostname === "max.ru" && /_biz/i.test(parsed.pathname)) {
      return `https://web.max.ru${parsed.pathname}${parsed.search}`;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

/** Канал Max (подвал сайта). */
export function maxMessengerChannelUrl(configuredUrl?: string | null): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_MAX_CHANNEL_URL?.trim(),
    configuredUrl?.trim(),
    SOCIAL_LINKS.maxChannel?.trim(),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const normalized = normalizeMaxHttpUrl(candidate);
    if (normalized) return normalized;
  }

  return null;
}

/** Личный чат Max (иконки «написать» в шапке, сайдбаре, контактах). */
export function maxMessengerChatUrl(configuredUrl?: string | null): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_MAX_CHAT_URL?.trim(),
    configuredUrl?.trim(),
    SOCIAL_LINKS.maxChat?.trim(),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const normalized = normalizeMaxHttpUrl(candidate);
    if (normalized) return normalized;
  }

  return null;
}
