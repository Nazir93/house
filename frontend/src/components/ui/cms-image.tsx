"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { shouldUseBrowserImageDirectly } from "@/lib/image-loading";
import { cn } from "@/lib/utils";

export type CmsImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
};

/** Картинки из CMS/загрузок: уже сжатые uploads отдаём напрямую, остальное через next/image. */
export function CmsImage({ src, alt, unoptimized, quality, decoding, className, onLoad, ...rest }: CmsImageProps) {
  const [loaded, setLoaded] = useState(false);

  if (!src?.trim()) return null;
  const uo = unoptimized ?? shouldUseBrowserImageDirectly(src);
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={uo}
      quality={quality ?? 78}
      decoding={decoding ?? "async"}
      className={cn(
        "transition-[opacity,filter,transform] duration-700 ease-out",
        loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
        className
      )}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      {...rest}
    />
  );
}
