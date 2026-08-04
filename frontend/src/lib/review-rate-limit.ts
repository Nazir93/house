import { checkPublicRateLimitDb } from "@/lib/public-rate-limit-db";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/** Лимит отправок отзывов с одного IP (PostgreSQL + fallback memory). */
export async function checkReviewSubmitRateLimit(ip: string): Promise<boolean> {
  return checkPublicRateLimitDb({
    scope: "review-submit",
    key: ip,
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
}

/** Лимит загрузок фото к отзыву с одного IP. */
export async function checkReviewUploadRateLimit(ip: string): Promise<boolean> {
  return checkPublicRateLimitDb({
    scope: "review-upload",
    key: ip,
    max: 20,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
}
