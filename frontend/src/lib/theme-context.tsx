"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type SiteTheme = "light" | "dark";

const STORAGE_KEY = "house-theme";

function readThemeFromDom(): SiteTheme {
  if (typeof window === "undefined") return "light";
  const a = document.documentElement.getAttribute("data-theme");
  return a === "dark" ? "dark" : "light";
}

function applyDomTheme(theme: SiteTheme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#121816" : "#F6F6F4");
  }
}

interface ThemeContextType {
  theme: SiteTheme;
  toggleTheme: () => void;
  setTheme: (t: SiteTheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  /** До клиента совпадает с SSR («light»); после mount подтягивается DOM/localStorage из inline-скрипта. */
  const [theme, setThemeState] = useState<SiteTheme>("light");
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      const t = readThemeFromDom();
      setThemeState(t);
      applyDomTheme(t);
      return;
    }
    applyDomTheme(theme);
  }, [theme]);

  const setTheme = useCallback((t: SiteTheme) => {
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      isDark: theme === "dark",
    }),
    [theme, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
