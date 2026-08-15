/** Просмотры новостей блога (админка + публичный счётчик). */

export function formatPostViewCount(n: number): string {
  const v = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  if (v < 1000) return String(v);
  if (v < 10_000) return `${(v / 1000).toFixed(1).replace(/\.0$/, "")} тыс.`;
  return `${Math.round(v / 1000)} тыс.`;
}

export function postViewSessionKey(slug: string): string {
  return `blog-viewed:${slug.trim()}`;
}

/** Один просмотр на вкладку/сессию — чтобы F5 не накручивал счётчик. */
export function shouldRecordPostView(params: {
  slug: string;
  alreadyRecordedInSession: boolean;
}): boolean {
  const slug = params.slug.trim();
  if (!slug) return false;
  return !params.alreadyRecordedInSession;
}
