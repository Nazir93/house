/** Лимиты сжатия при загрузке в CMS — чтобы /_next/image на VPS не гонял лишние мегабайты. */

export type UploadImageProfile = "default" | "hero";

export type UploadImageOptimizeLimits = {
  maxEdgePx: number;
  webpQuality: number;
};

export function getUploadImageOptimizeLimits(
  profile: UploadImageProfile = "default",
): UploadImageOptimizeLimits {
  // Главный баннер не трогаем: как раньше — до 3840, качество 88.
  if (profile === "hero") {
    return { maxEdgePx: 3840, webpQuality: 88 };
  }
  return { maxEdgePx: 1280, webpQuality: 75 };
}
