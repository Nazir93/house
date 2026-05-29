"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  cycleThemePreference,
  normalizeThemePreference,
  resolveSiteTheme,
  THEME_STORAGE_KEY,
  themePreferenceLabel,
  type ResolvedSiteTheme,
  type ThemePreference,
} from "@/lib/theme-preference";

/** @deprecated Используйте ResolvedSiteTheme — фактическая тема на странице. */
export type SiteTheme = ResolvedSiteTheme;

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    return normalizeThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

function readSystemIsDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyDomTheme(resolved: ResolvedSiteTheme) {
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved === "dark" ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#121816" : "#F6F6F4");
  }
}

interface ThemeContextType {
  /** Фактическая тема на странице (light/dark). */
  theme: ResolvedSiteTheme;
  resolvedTheme: ResolvedSiteTheme;
  /** Выбор в переключателе: светлая / тёмная / как в браузере. */
  themePreference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (preference: ThemePreference) => void;
  setThemePreference: (preference: ThemePreference) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  resolvedTheme: "light",
  themePreference: "system",
  toggleTheme: () => {},
  setTheme: () => {},
  setThemePreference: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("system");
  const [systemIsDark, setSystemIsDark] = useState(false);
  const hydratedRef = useRef(false);

  const resolvedTheme = useMemo(
    () => resolveSiteTheme(themePreference, systemIsDark),
    [themePreference, systemIsDark]
  );

  useLayoutEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      const pref = readStoredPreference();
      const sysDark = readSystemIsDark();
      setThemePreferenceState(pref);
      setSystemIsDark(sysDark);
      applyDomTheme(resolveSiteTheme(pref, sysDark));
      return;
    }
    applyDomTheme(resolvedTheme);
  }, [resolvedTheme]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    setSystemIsDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      /* ignore */
    }
    setThemePreferenceState(preference);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference(cycleThemePreference(themePreference));
  }, [themePreference, setThemePreference]);

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      resolvedTheme,
      themePreference,
      toggleTheme,
      setTheme: setThemePreference,
      setThemePreference,
      isDark: resolvedTheme === "dark",
    }),
    [resolvedTheme, themePreference, toggleTheme, setThemePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

export { themePreferenceLabel };
