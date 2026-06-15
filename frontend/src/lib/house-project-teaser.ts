import { formatArticleBody } from "@/lib/html-content";
import { htmlToPlainText } from "@/lib/html-to-plain-text";

/** Текст под заголовком: короткое описание или начало полного. */
export function houseProjectHeroTeaser(shortDescription: string, description: string): string {
  const short = shortDescription.trim();
  if (short) return short;
  const plain = htmlToPlainText(description);
  if (!plain) return "";
  if (plain.length <= 320) return plain;
  return `${plain.slice(0, 317).trimEnd()}…`;
}

/** Санitized HTML для блока «О проекте». */
export function houseProjectDescriptionHtml(description: string): string {
  return formatArticleBody(description).trim();
}

/** Текст для карточки в каталоге. */
export function houseProjectCatalogTeaser(shortDescription: string, description: string): string {
  return houseProjectHeroTeaser(shortDescription, description);
}
