import { checkPublicRateLimitDb } from "@/lib/public-rate-limit-db";

export function rateLimitKeyFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/** @deprecated Используйте checkPublicApiRateLimitAsync — лимит в PostgreSQL для PM2 cluster. */
export function checkPublicApiRateLimit(
  key: string,
  options: { namespace: string; max: number; windowMs: number }
): boolean {
  void key;
  void options;
  return true;
}

export async function checkPublicApiRateLimitAsync(
  key: string,
  options: { namespace: string; max: number; windowMs: number }
): Promise<boolean> {
  return checkPublicRateLimitDb({
    scope: options.namespace,
    key,
    max: options.max,
    windowMs: options.windowMs,
  });
}
