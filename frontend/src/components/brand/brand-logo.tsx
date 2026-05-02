"use client";

import type { CSSProperties } from "react";

const LOGO_ASSET_V = "6";

/** Пропорции исходного logo.png (ширина / высота). */
const LOGO_AR = 1024 / 442;

type Props = {
  height: number;
  className?: string;
  /** Светлый знак над тёмным баннером при светлой теме сайта */
  brightOnBackdrop?: boolean;
};

export function BrandLogo({ height, className, brightOnBackdrop }: Props) {
  const q = `v=${LOGO_ASSET_V}`;
  const logoUrl = `/images/brand/logo.png?${q}`;
  const w = Math.round(height * LOGO_AR);
  const mask: CSSProperties = {
    height,
    width: w,
    WebkitMaskImage: `url("${logoUrl}")`,
    maskImage: `url("${logoUrl}")`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };

  const lightThemeFill =
    brightOnBackdrop ? "rgba(245, 247, 246, 0.96)" : "var(--accent)";

  return (
    <span className={`inline-flex shrink-0 items-center ${className ?? ""}`}>
      <span
        role="presentation"
        className="dark:hidden shrink-0"
        style={{ ...mask, backgroundColor: lightThemeFill }}
      />
      <span
        role="presentation"
        className="hidden shrink-0 dark:block"
        style={{ ...mask, backgroundColor: "var(--header-bar-text)" }}
      />
    </span>
  );
}
