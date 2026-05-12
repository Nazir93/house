/** Убирает HTML из контента админки для безопасного вывода и schema.org. */
export function htmlToPlainText(html: string): string {
  if (!html || typeof html !== "string") return "";
  let s = html.replace(/<\/p>\s*<p[^>]*>/gi, "\n\n").replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  return s
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
