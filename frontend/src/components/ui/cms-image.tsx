"use client";

import Image, { type ImageProps } from "next/image";

import { shouldUseBrowserImageDirectly } from "@/lib/image-loading";
import { cn } from "@/lib/utils";

export type CmsImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
};

/** Картинки CMS/public: растры через next/image (avif/webp + ресайз), SVG/GIF — как есть. */
export function CmsImage({
  src,
  alt,
  unoptimized,
  quality,
  decoding,
  className,
  ...rest
}: CmsImageProps) {
  const cleanSrc = src?.trim() ?? "";
  if (!cleanSrc) return null;

  const uo = unoptimized ?? shouldUseBrowserImageDirectly(cleanSrc);

  return (
    <Image
      src={cleanSrc}
      alt={alt}
      unoptimized={uo}
      quality={quality ?? 72}
      decoding={decoding ?? "async"}
      className={cn(className)}
      {...rest}
    />
  );
}
