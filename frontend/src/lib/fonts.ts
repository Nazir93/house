/**
 * Локальный Montserrat (@fontsource) — билд на VPS не ходит в fonts.googleapis.com.
 * Только 400/700 + latin/cyrillic (как раньше через next/font).
 */
import "@fontsource/montserrat/cyrillic-400.css";
import "@fontsource/montserrat/cyrillic-700.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-700.css";

export const montserrat = {
  className: "font-montserrat",
  variable: "font-montserrat-var",
} as const;
