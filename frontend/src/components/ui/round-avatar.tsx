import Image from "next/image";
import { cn } from "@/lib/utils";

/** Аватар с оптимизацией для локальных путей (`/…`, `/uploads/…`) и безопасным fallback для внешних URL. */
export function RoundAvatar({
  src,
  alt,
  size = 56,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  const local = src.startsWith("/") && !src.startsWith("//");
  const ring = "rounded-full object-cover ring-1 ring-[var(--border)] shrink-0 bg-[var(--bg-secondary)]";

  if (local) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn(ring, className)}
        sizes={`${size}px`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- произвольные URL из админки
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn(ring, className)}
    />
  );
}
