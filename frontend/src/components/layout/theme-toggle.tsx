"use client";

import type { CSSProperties } from "react";
import { useTheme, themePreferenceLabel } from "@/lib/theme-context";
import type { ThemePreference } from "@/lib/theme-preference";
import { cn } from "@/lib/utils";

function ThemeToggleIcon({
  preference,
  strokeWidth,
  className,
}: {
  preference: ThemePreference;
  strokeWidth: number;
  className?: string;
}) {
  const common = {
    className,
    fill: "none" as const,
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (preference === "light") {
    return (
      <svg {...common}>
        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  }

  if (preference === "dark") {
    return (
      <svg {...common}>
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function ThemeToggle({
  className,
  variant = "ghost",
}: {
  className?: string;
  /** `header` — как кнопки поиска/кабинета в шапке сайта (круг, бордер, те же переменные). */
  variant?: "ghost" | "outline" | "header";
}) {
  const { themePreference, toggleTheme } = useTheme();

  const base =
    variant === "outline"
      ? "border border-[color-mix(in_srgb,var(--text)_14%,transparent)] bg-[color-mix(in_srgb,var(--bg)_88%,var(--text)_12%)] hover:bg-[color-mix(in_srgb,var(--bg)_82%,var(--text)_18%)]"
      : variant === "header"
        ? "rounded-full border text-[var(--header-bar-text)] transition hover:bg-black/[0.04] dark:hover:bg-white/10 h-8 w-8 lg:h-7 lg:w-7 active:scale-[0.98] lg:active:scale-100"
        : "bg-[color-mix(in_srgb,var(--text)_6%,transparent)] hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)]";

  const headerBarStyle: CSSProperties | undefined =
    variant === "header"
      ? { borderColor: "var(--header-bar-border)", color: "var(--header-bar-text)" }
      : undefined;

  const iconClass =
    variant === "header" ? "h-3.5 w-3.5 lg:h-3 lg:w-3" : "h-4 w-4";
  const strokeWidth = variant === "header" ? 2 : 1.75;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      style={headerBarStyle}
      className={cn(
        variant === "header"
          ? "inline-flex shrink-0 items-center justify-center p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35"
          : "inline-flex h-10 min-h-[40px] w-10 min-w-[40px] shrink-0 items-center justify-center rounded-xl p-0 text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35",
        base,
        className,
      )}
      aria-label={themePreferenceLabel(themePreference)}
    >
      <ThemeToggleIcon
        preference={themePreference}
        strokeWidth={strokeWidth}
        className={iconClass}
      />
    </button>
  );
}
