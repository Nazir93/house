/** Канонический адрес сайта для юридических документов и мета. */
export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && !raw.includes("localhost") && !raw.includes("127.0.0.1")) {
    return raw.replace(/\/$/, "");
  }
  return "https://chastdushi.ru";
}

/** Дата актуальной редакции политики и согласия (отображение на сайте). */
export const LEGAL_DOCUMENT_EFFECTIVE_DATE = "14 июня 2026 г.";
