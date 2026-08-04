"use client";

import type { CSSProperties } from "react";

import { BRAND_LOGO_AR, BRAND_LOGO_SRC } from "@/lib/brand-logo";

type Props = {
  height: number;
  className?: string;
  /** Светлый знак над тёмным баннером при светлой теме сайта (только variant="header") */
  brightOnBackdrop?: boolean;
  /**
   * header — шапка сайта (день: зелёный, ночь: цвет текста шапки).
   * app — админка и ЛК (день: --accent, ночь: --text через --app-logo-fill).
   */
  variant?: "header" | "app";
};

export function BrandLogo({ height, className, brightOnBackdrop, variant = "header" }: Props) {
  const logoUrl = BRAND_LOGO_SRC;
  const w = Math.round(height * BRAND_LOGO_AR);
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

  if (variant === "app") {
    return (
      <span className={`inline-flex shrink-0 items-center ${className ?? ""}`}>
        <span
          role="presentation"
          className="shrink-0"
          style={{ ...mask, backgroundColor: "var(--app-logo-fill, var(--accent))" }}
        />
      </span>
    );
  }

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
