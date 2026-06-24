import { prisma } from "@/lib/db";

const MEMORY_BUCKETS = new Map<string, { count: number; resetAt: number }>();
let lastMemoryCleanup = Date.now();
let lastDbCleanup = 0;
const DB_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

export type PublicRateLimitOptions = {
  scope: string;
  key: string;
  max: number;
  windowMs: number;
};

function memoryKey(scope: string, key: string): string {
  return `${scope}:${key}`;
}

function checkMemoryRateLimit(scopeKey: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastMemoryCleanup > DB_CLEANUP_INTERVAL_MS) {
    lastMemoryCleanup = now;
    MEMORY_BUCKETS.forEach((bucket, bucketKey) => {
      if (now > bucket.resetAt) MEMORY_BUCKETS.delete(bucketKey);
    });
  }

  const bucket = MEMORY_BUCKETS.get(scopeKey);
  if (!bucket || now > bucket.resetAt) {
    MEMORY_BUCKETS.set(scopeKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count++;
  return true;
}

async function maybeCleanupStaleBuckets(nowMs: number, windowMs: number): Promise<void> {
  if (nowMs - lastDbCleanup < DB_CLEANUP_INTERVAL_MS) return;
  lastDbCleanup = nowMs;
  const cutoff = new Date(nowMs - 3 * windowMs);
  try {
    await prisma.publicRateBucket.deleteMany({ where: { bucketStart: { lt: cutoff } } });
  } catch {
    /* ignore */
  }
}

/** Текущий счётчик без инкремента (для auth backoff). */
export async function peekPublicRateLimitCount(options: PublicRateLimitOptions): Promise<number> {
  const scopedKey = memoryKey(options.scope, options.key);
  const nowMs = Date.now();
  const bucketStart = new Date(Math.floor(nowMs / options.windowMs) * options.windowMs);
  try {
    const row = await prisma.publicRateBucket.findUnique({
      where: { scopeKey_bucketStart: { scopeKey: scopedKey, bucketStart } },
    });
    return row?.count ?? 0;
  } catch {
    const bucket = MEMORY_BUCKETS.get(scopedKey);
    if (!bucket || nowMs > bucket.resetAt) return 0;
    return bucket.count;
  }
}

/** PostgreSQL rate limit — общий для всех PM2-инстансов; при ошибке БД — память процесса. */
export async function checkPublicRateLimitDb(options: PublicRateLimitOptions): Promise<boolean> {
  const { scope, key, max, windowMs } = options;
  const scopedKey = memoryKey(scope, key);
  const nowMs = Date.now();
  await maybeCleanupStaleBuckets(nowMs, windowMs);
  const bucketStart = new Date(Math.floor(nowMs / windowMs) * windowMs);

  try {
    const row = await prisma.publicRateBucket.upsert({
      where: {
        scopeKey_bucketStart: { scopeKey: scopedKey, bucketStart },
      },
      create: { scopeKey: scopedKey, bucketStart, count: 1 },
      update: { count: { increment: 1 } },
    });
    return row.count <= max;
  } catch (e) {
    console.error("[rate-limit] DB unavailable, fallback memory:", e);
    return checkMemoryRateLimit(scopedKey, max, windowMs);
  }
}
