const UNOPTIMIZED_IMAGE_RE = /\.(gif|svg)($|\?)/i;

function cleanImageSrc(src: string): string {
  return src.trim();
}

export function isUploadImageSrc(src: string): boolean {
  return cleanImageSrc(src).startsWith("/uploads/");
}

export function isPublicStaticImageSrc(src: string): boolean {
  return cleanImageSrc(src).startsWith("/images/");
}

/**
 * Когда true — next/image не ресайзит файл (отдаём как есть).
 * SVG/GIF/data всегда напрямую. Растры /images и /uploads идут через оптимизатор —
 * иначе на мобильном 4G LCP раздувается до десятков секунд (полноразмерные webp/png).
 */
export function shouldUseBrowserImageDirectly(src: string): boolean {
  const value = cleanImageSrc(src);
  if (!value) return false;
  if (value.startsWith("data:") || UNOPTIMIZED_IMAGE_RE.test(value)) return true;
  return false;
}

export function buildNextImagePrefetchHref(src: string, width: number, quality: number): string {
  return `/_next/image?url=${encodeURIComponent(cleanImageSrc(src))}&w=${width}&q=${quality}`;
}

export function buildImagePrefetchSrc(src: string, width: number, quality: number): string {
  return shouldUseBrowserImageDirectly(src) ? cleanImageSrc(src) : buildNextImagePrefetchHref(src, width, quality);
}
