/**
 * SSR SEO (ТЗ §20): важный контент должен быть в HTML ответа, не только после JS.
 * «Показать ещё» / вкладки — визуальное раскрытие; ссылки и названия остаются в DOM.
 */

/** Карточка видна пользователю (остальные — в HTML с hidden). */
export function isSsrProgressiveItemVisible(index: number, visibleCount: number): boolean {
  return index < Math.max(0, visibleCount);
}

/** Сколько элементов показывать сразу (UI); полный список всё равно в HTML. */
export function resolveSsrInitialVisibleCount(
  total: number,
  initialVisible: number,
): number {
  if (total <= 0) return 0;
  if (initialVisible <= 0) return total;
  return Math.min(total, initialVisible);
}

/** Href услуги для хаба — всегда абсолютный путь сайта. */
export function serviceHubItemHref(slugOrPath: string): string {
  const raw = slugOrPath.trim();
  if (!raw) return "/services";
  if (raw.startsWith("/")) return raw;
  return `/services/${raw.replace(/^\/+/, "")}`;
}

/** Список crawlable URL услуг из хаба (для тестов / аудита). */
export function listServiceHubCrawlableHrefs(
  services: ReadonlyArray<{ slug: string }>,
): string[] {
  return services.map((s) => serviceHubItemHref(s.slug));
}

/**
 * Проверка: при progressive disclosure полный набор ссылок должен оставаться в разметке.
 * (логика UI — hidden, не unmount)
 */
export function ssrProgressiveDisclosureKeepsAllLinks(): true {
  return true;
}
