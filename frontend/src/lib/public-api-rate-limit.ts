type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastCleanup = Date.now();

export function rateLimitKeyFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkPublicApiRateLimit(
  key: string,
  options: { namespace: string; max: number; windowMs: number }
): boolean {
  const now = Date.now();
  if (now - lastCleanup > 5 * 60 * 1000) {
    lastCleanup = now;
    buckets.forEach((bucket, bucketKey) => {
      if (now > bucket.resetAt) buckets.delete(bucketKey);
    });
  }

  const scopedKey = `${options.namespace}:${key}`;
  const bucket = buckets.get(scopedKey);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(scopedKey, { count: 1, resetAt: now + options.windowMs });
    return true;
  }

  if (bucket.count >= options.max) return false;
  bucket.count++;
  return true;
}
