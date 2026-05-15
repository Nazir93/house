import Image, { type ImageProps } from "next/image";

export type CmsImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
};

function shouldUnoptimize(src: string): boolean {
  const t = src.trim();
  /** SVG не гоняем через `/_next/image` — быстрее и без сюрпризов с вектором. */
  return t.startsWith("data:") || /\.(gif|svg)($|\?)/i.test(t);
}

/** Картинки из CMS/загрузок: локальные пути и разрешённые remote; GIF и data URI без оптимизации. */
export function CmsImage({ src, alt, unoptimized, ...rest }: CmsImageProps) {
  if (!src?.trim()) return null;
  const uo = unoptimized ?? shouldUnoptimize(src);
  return <Image src={src} alt={alt} unoptimized={uo} {...rest} />;
}
