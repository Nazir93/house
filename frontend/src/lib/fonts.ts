import { Montserrat } from "next/font/google";

import { MONTSERRAT_DISPLAY, MONTSERRAT_WEIGHTS } from "@/lib/fonts-config";

export { MONTSERRAT_DISPLAY, MONTSERRAT_WEIGHTS } from "@/lib/fonts-config";

/** Self-host через next/font — без отдельного CSS-чанка @fontsource. */
export const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: [...MONTSERRAT_WEIGHTS],
  display: MONTSERRAT_DISPLAY,
  variable: "--font-montserrat",
  adjustFontFallback: true,
});
