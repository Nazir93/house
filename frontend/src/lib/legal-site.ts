/** Публичный домен сайта в юридических документах (не IP и не localhost). */
export const CANONICAL_PUBLIC_SITE_URL = "https://chastdushi.ru";

function hostnameFromSiteUrl(raw: string): string | null {
  try {
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withScheme).hostname;
  } catch {
    return null;
  }
}

/** IP, localhost и прочие непубличные адреса не подставляем в политику и согласие. */
export function isNonPublicSiteHost(hostname: string): boolean {
  if (!hostname) return true;
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".local")) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return true;
  return false;
}

/** Канонический адрес для политики, согласия и публичных юридических ссылок. */
export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return CANONICAL_PUBLIC_SITE_URL;

  const host = hostnameFromSiteUrl(raw);
  if (!host || isNonPublicSiteHost(host)) return CANONICAL_PUBLIC_SITE_URL;

  return raw.replace(/\/$/, "");
}
