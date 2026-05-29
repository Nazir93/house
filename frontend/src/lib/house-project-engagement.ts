/** Просмотры и «огоньки» на карточках проектов домов. */

export type HouseProjectEngagementSeed = {
  area: number;
  order: number;
  isNew: boolean;
};

/** Стартовые значения (как в старой вёрстке), если в БД ещё нули. */
export function seedHouseProjectEngagement(p: HouseProjectEngagementSeed): {
  viewCount: number;
  likeCount: number;
} {
  return {
    viewCount: 180 + p.area + p.order * 7,
    likeCount: 12 + (p.isNew ? 28 : 0) + p.order * 3,
  };
}

export function resolveHouseProjectEngagement(
  row: HouseProjectEngagementSeed & { viewCount?: number | null; likeCount?: number | null },
): { viewCount: number; likeCount: number } {
  const seed = seedHouseProjectEngagement(row);
  const views = typeof row.viewCount === "number" && row.viewCount > 0 ? row.viewCount : seed.viewCount;
  const likes = typeof row.likeCount === "number" && row.likeCount > 0 ? row.likeCount : seed.likeCount;
  return { viewCount: views, likeCount: likes };
}

export function engagementCookieKey(kind: "view" | "like", slug: string): string {
  const safe = slug.replace(/[^a-z0-9-]/gi, "").slice(0, 64);
  return kind === "view" ? `hp_v_${safe}` : `hp_l_${safe}`;
}

export const ENGAGEMENT_VIEW_COOKIE_MAX_AGE = 60 * 60 * 24;
export const ENGAGEMENT_LIKE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function formatEngagementCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
}

export function clampLikeCount(n: number): number {
  return Math.max(0, Math.round(n));
}
