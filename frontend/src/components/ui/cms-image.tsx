"use client";

import Image, { type ImageProps } from "next/image";

import { shouldUseBrowserImageDirectly } from "@/lib/image-loading";
import { cn } from "@/lib/utils";

export type CmsImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
};

/** Картинки из CMS/загрузок: uploads и /images/* отдаём напрямую, remote — через next/image. */
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
      quality={quality ?? 78}
      decoding={decoding ?? "async"}
      className={cn(className)}
      {...rest}
    />
  );
}
