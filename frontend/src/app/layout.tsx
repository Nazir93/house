import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import "./globals.css";

import type { Metadata } from "next";
import Script from "next/script";

import { SiteShell } from "@/components/layout/site-shell";
import { SessionProvider } from "@/components/admin/session-provider";
import { ThemeProvider } from "@/lib/theme-context";
import { ModalProvider } from "@/lib/modal-context";
import { SITE_NAME, CITY, SITE_URL, getDefaultSiteGeoDescription } from "@/lib/constants";
import { AnalyticsScripts } from "@/components/seo/analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactConfigProvider } from "@/lib/contact-config-context";
import { loadContactConfig } from "@/lib/load-contact-config";

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
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5" />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#F6F6F4" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <JsonLd />
      </head>
      <body className="font-body antialiased theme-bg theme-text transition-colors duration-500">
        <Script id="house-theme-init" strategy="beforeInteractive">
          {`(function(){try{var k="house-theme";var t=localStorage.getItem(k);if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);return;}if(window.matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.setAttribute("data-theme","dark");else document.documentElement.setAttribute("data-theme","light");}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`}
        </Script>
        <ThemeProvider>
          <SessionProvider>
            <ContactConfigProvider value={contactConfig}>
              <ModalProvider>
                <SiteShell>{children}</SiteShell>
              </ModalProvider>
            </ContactConfigProvider>
          </SessionProvider>
        </ThemeProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
