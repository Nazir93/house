"use client";

import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  variant = "ghost",
}: {
  className?: string;
  variant?: "ghost" | "outline";
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
      className={cn(
        "inline-flex h-10 min-h-[40px] w-10 min-w-[40px] shrink-0 items-center justify-center rounded-xl p-0 text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35",
        base,
        className,
      )}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title="Тема оформления"
    >
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
