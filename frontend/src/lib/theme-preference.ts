/** Выбор пользователя в переключателе темы. */
export type ThemePreference = "light" | "dark" | "system";

/** Фактически применённая тема на `<html data-theme>`. */
export type ResolvedSiteTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "house-theme";

const PREFERENCES: ThemePreference[] = ["light", "dark", "system"];

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** По умолчанию — системная (как в ОС/браузере). */
export function normalizeThemePreference(stored: string | null | undefined): ThemePreference {
  return isThemePreference(stored) ? stored : "system";
}

export function resolveSiteTheme(
  preference: ThemePreference,
  systemIsDark: boolean
): ResolvedSiteTheme {
  if (preference === "system") return systemIsDark ? "dark" : "light";
  return preference;
}

export function cycleThemePreference(current: ThemePreference): ThemePreference {
  const i = PREFERENCES.indexOf(current);
  return PREFERENCES[(i + 1) % PREFERENCES.length]!;
}

export function themePreferenceLabel(preference: ThemePreference): string {
  switch (preference) {
    case "light":
      return "Светлая тема";
    case "dark":
      return "Тёмная тема";
    case "system":
      return "Системная тема";
  }
}

export function themePreferenceShortLabel(preference: ThemePreference): string {
  switch (preference) {
    case "light":
      return "Светлая";
    case "dark":
      return "Тёмная";
    case "system":
      return "Системная";
  }
}
