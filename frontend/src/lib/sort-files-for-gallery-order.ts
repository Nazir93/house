/**
 * Порядок файлов из `<input type="file" multiple>` часто совпадает с сортировкой
 * в диалоге ОС (на Windows — часто «сначала новые»). Для таймлайна стройки нужен
 * хронологический порядок: от ранних кадров к поздним.
 */
export function sortFilesForGalleryOrder(files: readonly File[]): File[] {
  return [...files].sort((a, b) => {
    const byTime = a.lastModified - b.lastModified;
    if (byTime !== 0) return byTime;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
  });
}

/** Переворачивает порядок URL в галерее этапа (начало ↔ конец). */
export function reverseGalleryUrls(urls: readonly string[]): string[] {
  return [...urls].reverse();
}
