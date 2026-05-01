"use client";

import { createContext, useContext, useEffect } from "react";

interface ThemeContextType {
  theme: "light";
  /** Оставлено для совместимости; переключения темы нет */
  toggleTheme: () => void;
  isDark: false;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.colorScheme = "light";
  }, []);

  const noop = () => {};

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme: noop, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
