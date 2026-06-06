import { createSerwistRoute } from "@serwist/turbopack";

import {
  buildPwaPrecacheUrls,
  PWA_SERWIST_GLOB_IGNORES,
  PWA_SERWIST_GLOB_PATTERNS,
  PWA_SERWIST_MAX_FILE_BYTES,
  resolvePwaCacheRevision,
} from "@/lib/pwa-config";

const revision = resolvePwaCacheRevision();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: "src/app/sw.ts",
  globPatterns: [...PWA_SERWIST_GLOB_PATTERNS],
  globIgnores: [...PWA_SERWIST_GLOB_IGNORES],
  maximumFileSizeToCacheInBytes: PWA_SERWIST_MAX_FILE_BYTES,
  additionalPrecacheEntries: buildPwaPrecacheUrls().map((url) => ({
    url,
    revision,
  })),
  useNativeEsbuild: true,
});
