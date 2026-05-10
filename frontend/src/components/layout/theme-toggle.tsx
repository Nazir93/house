"use client";

import { useTheme } from "@/lib/theme-context";

export function ThemeToggle({
  className = "",
  variant = "ghost",
  compact = false,
}: {
  className?: string;
  variant?: "ghost" | "outline";
  /** Только иконка (например, свёрнутая боковая панель админки). */
  compact?: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const base =
    variant === "outline"
      ? "border border-[color-mix(in_srgb,var(--text)_14%,transparent)] bg-[color-mix(in_srgb,var(--bg)_88%,var(--text)_12%)] hover:bg-[color-mix(in_srgb,var(--bg)_82%,var(--text)_18%)]"
      : "bg-[color-mix(in_srgb,var(--text)_6%,transparent)] hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)]";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium tracking-wide text-[var(--text)] transition-colors ${base} ${className}`}
      aria-label={isDark ? "Включить дневную тему" : "Включить ночную тему"}
      title={isDark ? "Переключить на день" : "Переключить на ночь"}
    >
      <span className="relative h-4 w-4 shrink-0" aria-hidden>
        {isDark ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </span>
      {!compact && <span className="hidden sm:inline">{isDark ? "День" : "Ночь"}</span>}
    </button>
  );
}
