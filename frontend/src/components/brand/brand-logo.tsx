"use client";

import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";
import { useTheme } from "@/lib/theme-context";

const SRC_LIGHT = "/images/brand/logo-light.png";
const SRC_DARK = "/images/brand/logo-dark.png";

/** Логотип «Часть Души»: зелёный вариант для светлой темы, на чёрном — для тёмной. */
export function BrandLogo({
  className,
  height = 44,
}: {
  className?: string;
  /** Высота в px; ширина подстраивается под пропорции PNG */
  height?: number;
}) {
  const { theme } = useTheme();
  const src = theme === "dark" ? SRC_DARK : SRC_LIGHT;
  const w = Math.round(height * 3.2);

  return (
    <span className={`inline-flex shrink-0 items-center ${className ?? ""}`} suppressHydrationWarning>
      <Image
        src={src}
        alt={SITE_NAME}
        width={w}
        height={height}
        priority
        className="w-auto object-contain object-left"
        style={{ height, maxWidth: "min(100%, 260px)" }}
      />
    </span>
  );
}
