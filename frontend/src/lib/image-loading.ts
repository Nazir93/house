const UNOPTIMIZED_IMAGE_RE = /\.(gif|svg)($|\?)/i;
const BROWSER_READY_UPLOAD_RE = /\.(avif|webp|jpe?g|png)($|\?)/i;

function cleanImageSrc(src: string): string {
  return src.trim();
}

export function isUploadImageSrc(src: string): boolean {
  return cleanImageSrc(src).startsWith("/uploads/");
}

export function shouldUseBrowserImageDirectly(src: string): boolean {
  const value = cleanImageSrc(src);
  if (!value) return false;
  if (value.startsWith("data:") || UNOPTIMIZED_IMAGE_RE.test(value)) return true;
  return isUploadImageSrc(value) && BROWSER_READY_UPLOAD_RE.test(value);
}

export function buildNextImagePrefetchHref(src: string, width: number, quality: number): string {
  return `/_next/image?url=${encodeURIComponent(cleanImageSrc(src))}&w=${width}&q=${quality}`;
}

export function buildImagePrefetchSrc(src: string, width: number, quality: number): string {
  return shouldUseBrowserImageDirectly(src) ? cleanImageSrc(src) : buildNextImagePrefetchHref(src, width, quality);
}
