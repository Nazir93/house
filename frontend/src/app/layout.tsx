import "./globals.css";

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { SiteShell } from "@/components/layout/site-shell";
import { ThemeProvider } from "@/lib/theme-context";
import { ModalProvider } from "@/lib/modal-context";
import { SITE_NAME, CITY, SITE_URL, getDefaultSiteGeoDescription } from "@/lib/constants";
import { AnalyticsScripts } from "@/components/seo/analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactConfigProvider } from "@/lib/contact-config-context";
import { loadContactConfig } from "@/lib/load-contact-config";

/** Self-hosted файлы в /public/fonts остаются резервом; в dev/production Next подтягивает subset при сборке. */
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-main",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — строительство загородных домов под ключ в ${CITY}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: getDefaultSiteGeoDescription(),
  keywords: [
    "строительство домов",
    "коттедж под ключ",
    CITY,
    "типовые проекты домов",
    "загородный дом",
    SITE_NAME,
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — загородные дома под ключ в ${CITY}`,
    description: getDefaultSiteGeoDescription(),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contactConfig = await loadContactConfig();
  return (
    <html lang="ru" className={montserrat.variable} data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#F6F6F4" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <JsonLd />
      </head>
      <body className="font-body antialiased theme-bg theme-text transition-colors duration-500">
        <ThemeProvider>
          <ContactConfigProvider value={contactConfig}>
            <ModalProvider>
              <SiteShell>{children}</SiteShell>
            </ModalProvider>
          </ContactConfigProvider>
        </ThemeProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
