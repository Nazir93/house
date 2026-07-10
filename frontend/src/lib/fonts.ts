import { Montserrat } from "next/font/google";

/** Self-host через next/font — без отдельного CSS-чанка @fontsource и лишних preload в Chrome. */
export const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-montserrat",
});
