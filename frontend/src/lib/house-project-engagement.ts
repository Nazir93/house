/** Просмотры и «огоньки» на карточках проектов домов. */

export type HouseProjectEngagementSeed = {
  slug?: string;
  area: number;
  order: number;
  isNew: boolean;
};

/** Базовые просмотры на карточке (стабильный «рандом» по проекту). */
export const ENGAGEMENT_VIEW_BASE_MIN = 92;
export const ENGAGEMENT_VIEW_BASE_MAX = 105;

/** Базовые огоньки на карточке (стабильный «рандом» по проекту). */
export const ENGAGEMENT_LIKE_BASE_MIN = 30;
export const ENGAGEMENT_LIKE_BASE_MAX = 55;

const ENGAGEMENT_VIEW_BASE_SPAN =
  ENGAGEMENT_VIEW_BASE_MAX - ENGAGEMENT_VIEW_BASE_MIN + 1;
const ENGAGEMENT_LIKE_BASE_SPAN =
  ENGAGEMENT_LIKE_BASE_MAX - ENGAGEMENT_LIKE_BASE_MIN + 1;

function hashEngagementSeed(p: HouseProjectEngagementSeed, salt: number): number {
  let mixed =
    (Math.imul(p.area, 0x45d9f3b) ^
      Math.imul(p.order, 0x27d4eb2d) ^
      (p.isNew ? 0x165667b1 : 0)) >>>
    0;
  const slug = p.slug?.trim() ?? "";
  for (let i = 0; i < slug.length; i++) {
    mixed = (Math.imul(mixed ^ slug.charCodeAt(i), 0x45d9f3b) >>> 0);
  }
  return (mixed ^ salt) >>> 0;
}

/** Стабильная база для отображения: просмотры 92…105, огоньки 30…55. */
export function engagementDisplayBase(
  p: HouseProjectEngagementSeed,
  kind: "view" | "like",
): number {
  const salt = kind === "view" ? 0x9e3779b9 : 0x85ebca6b;
  const mixed = hashEngagementSeed(p, salt);
  if (kind === "view") {
    return ENGAGEMENT_VIEW_BASE_MIN + (mixed % ENGAGEMENT_VIEW_BASE_SPAN);
  }
  return ENGAGEMENT_LIKE_BASE_MIN + (mixed % ENGAGEMENT_LIKE_BASE_SPAN);
}

/** Показ на сайте: база + органические счётчики из БД (просмотры страницы, клики «огонёк»). */
export function resolveHouseProjectEngagement(
  row: HouseProjectEngagementSeed & { viewCount?: number | null; likeCount?: number | null },
): { viewCount: number; likeCount: number } {
  const organicViews = Math.max(0, Math.round(Number(row.viewCount) || 0));
  const organicLikes = clampLikeCount(Number(row.likeCount) || 0);
  return {
    viewCount: engagementDisplayBase(row, "view") + organicViews,
    likeCount: engagementDisplayBase(row, "like") + organicLikes,
  };
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
