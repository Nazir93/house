/** Общая разметка для статей блога и HTML-блоков страниц (SEO-админка). */

/**
 * Если HTML в БД сохранён с экранированием (&lt;strong&gt; вместо <strong>),
 * при выводе через innerHTML теги видны буквально. Несколько проходов — на случай &amp;lt;
 */
function decodeHtmlEntities(input: string): string {
  let s = input;
  for (let i = 0; i < 12; i++) {
    const next = s
      .replace(/&#x([\da-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&#(\d{1,7});/g, (_, d) => {
        const code = parseInt(d, 10);
        return code >= 0 && code < 0x110000 ? String.fromCharCode(code) : _;
      })
      .replace(/&nbsp;/gi, "\u00a0")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&amp;/g, "&");
    if (next === s) break;
    s = next;
  }
  return s;
}

/** Классы для вводного текста на листингах (портфолио, блог): переносы, длина строки ~65ch, ru-типографика. */
export const PAGE_INTRO_PROSE_CLASS =
  "w-full max-w-[min(100%,65ch)] text-sm sm:text-base md:text-[1.0625rem] leading-[1.65] sm:leading-relaxed text-pretty break-words hyphens-auto [overflow-wrap:anywhere] [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-[var(--accent)]/60 [&_strong]:font-semibold [&_strong]:text-[var(--text)] [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg";

export function sanitizeArticleHtml(html: string): string {
  return html
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s>][\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript\s*:/gi, "blocked:")
    .replace(/data\s*:\s*text\/html/gi, "blocked:")
    .replace(/<\/?(iframe|object|embed|form|input|textarea|button|select|meta|link|base|applet)[\s>][^>]*>/gi, "")
    /** Переносы из Word/редактора внутри абзаца — в пробел, иначе «одно слово на строку» и отступы после точки */
    .replace(/<br\s*\/?>/gi, " ")
    /** Убираем лишние пробелы в начале/конце абзацев после вставки из документов */
    .replace(/<p(\s[^>]*)?>\s+/gi, "<p$1>")
    .replace(/\s+<\/p>/gi, "</p>");
}

/** Текст статьи или блока: HTML как есть (после sanitize) или абзацы через пустую строку. */
export function formatArticleBody(raw: string): string {
  let t = raw.trim();
  if (!t) return "";
  if (t.includes("&lt;") || t.includes("&gt;") || /&amp;(?:[a-z]+|#)/i.test(t)) {
    t = decodeHtmlEntities(t);
  }
  if (t.startsWith("<")) {
    return sanitizeArticleHtml(t);
  }
  /** Пустая строка = новый абзац; одиночный Enter внутри абзаца не даём — склеиваем в нормальный текст */
  return t
    .split(/\n\s*\n+/)
    .filter(Boolean)
    .map((block) => {
      const oneLine = block.replace(/[\s\n\r]+/g, " ").trim();
      return `<p>${oneLine}</p>`;
    })
    .join("");
}
