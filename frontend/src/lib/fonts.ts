import { Montserrat } from "next/font/google";

/**
 * Self-host через next/font.
 * Важно: аргументы loader — только литералы (Turbopack/next/font).
 * Веса/display продублированы в fonts-config.ts для тестов LCP.
 */
export const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "optional",
  variable: "--font-montserrat",
  adjustFontFallback: true,
});
