import type { BuiltObjectItem } from "@/lib/construction-shared";

export function hasBuiltObjectClientReview(object: Pick<BuiltObjectItem, "clientReviewText" | "clientReviewVideoUrl">): boolean {
  return Boolean(object.clientReviewText?.trim() || object.clientReviewVideoUrl?.trim());
}

/** Встроенный плеер — только для прямых ссылок на файл (без нагрузки на SSR). */
export function isBuiltObjectClientReviewVideoInline(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (u.startsWith("/uploads/")) return true;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(u);
}

export function formatClientReviewText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length <= 1) {
    return `<p>${escapeHtml(trimmed.replace(/\n/g, "<br />"))}</p>`;
  }
  return paragraphs.map((p) => `<p>${escapeHtml(p.replace(/\n/g, "<br />"))}</p>`).join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
