"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition hover:bg-black/[0.04] dark:hover:bg-white/10 " +
        (className ?? "")
      }
      style={{
        borderColor: "var(--header-bar-border)",
        color: "var(--header-bar-text)",
      }}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      {theme === "dark" ? (
        <Sun className="h-3 w-3" strokeWidth={2} aria-hidden />
      ) : (
        <Moon className="h-3 w-3" strokeWidth={2} aria-hidden />
      )}
    </button>
  );
}
