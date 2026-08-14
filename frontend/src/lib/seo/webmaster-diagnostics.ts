/**
 * Диагностика Яндекс.Вебмастера (Description / mobile).
 * Проверки робота могут отставать от прода на недели — этот модуль фиксирует
 * инварианты, которые должны держаться на каноне.
 */

export const WEBMASTER_DIAGNOSTICS = {
  missingDescription: {
    id: "missing_description",
    lastWebmasterCheckNote: "В Вебмастере часто висит старая дата (напр. июль), пока не нажмут «Я всё исправил».",
    livePolicy: "Каждая индексируемая страница отдаёт meta description ≥ 40 символов через getPageMeta / buildMetaDescription.",
  },
  notMobileFriendly: {
    id: "not_mobile_friendly",
    lastWebmasterCheckNote: "Проверка мобильности смотрит viewport, горизонтальный скролл, читаемость текста.",
    livePolicy:
      "viewport=device-width, userScalable=true; html/body overflow-x:clip; основной текст на мобиле ≥12px где это контент, не декоративный label.",
  },
} as const;

/** Минимальная полезная длина description для сниппета / Вебмастера. */
export const WEBMASTER_MIN_DESCRIPTION_LENGTH = 40;

export function descriptionSatisfiesWebmaster(description: string | null | undefined): boolean {
  const text = (description ?? "").replace(/\s+/g, " ").trim();
  return text.length >= WEBMASTER_MIN_DESCRIPTION_LENGTH;
}

export function viewportLooksMobileFriendly(content: string | null | undefined): boolean {
  const v = (content ?? "").toLowerCase();
  if (!v.includes("width=device-width") && !v.includes("width = device-width")) return false;
  if (v.includes("user-scalable=no") || v.includes("user-scalable = no")) return false;
  if (/maximum-scale\s*=\s*1(\.0)?\b/.test(v) && /user-scalable\s*=\s*0/.test(v)) return false;
  return true;
}
