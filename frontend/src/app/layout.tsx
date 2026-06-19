import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { PwaSerwistProvider } from "@/components/pwa/serwist-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { SessionProvider } from "@/components/admin/session-provider";
import { ThemeProvider } from "@/lib/theme-context";
import { ModalProvider } from "@/lib/modal-context";
import { ProjectCompareProvider } from "@/lib/project-compare-context";
import { SITE_NAME, CITY, SITE_URL, getDefaultSiteGeoDescription } from "@/lib/constants";
import { toAbsoluteSiteUrl } from "@/lib/absolute-site-url";
import { AnalyticsScripts } from "@/components/seo/analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactConfigProvider } from "@/lib/contact-config-context";
import { loadContactConfig } from "@/lib/load-contact-config";
import { PWA_ICON_PATHS, PWA_THEME_COLORS, SITE_DEFAULT_ICON_PATH } from "@/lib/pwa-config";

function buildSiteVerification(): Metadata["verification"] | undefined {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const yandex = process.env.YANDEX_VERIFICATION?.trim();
  const fb = process.env.FACEBOOK_DOMAIN_VERIFICATION?.trim();
  const out: Metadata["verification"] = {};
  if (google) out.google = google;
  if (yandex) out.yandex = yandex;
  if (fb) out.other = { "facebook-domain-verification": fb };
  return google || yandex || fb ? out : undefined;
}

const defaultOgImageUrl = toAbsoluteSiteUrl(
  process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE?.trim() || SITE_DEFAULT_ICON_PATH
);
const siteVerification = buildSiteVerification();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  icons: {
    icon: [
      { url: PWA_ICON_PATHS.svg, type: "image/svg+xml" },
      { url: PWA_ICON_PATHS.png32, sizes: "32x32", type: "image/png" },
      { url: PWA_ICON_PATHS.png192, sizes: "192x192", type: "image/png" },
    ],
    shortcut: PWA_ICON_PATHS.favicon,
    apple: [{ url: PWA_ICON_PATHS.appleTouch, sizes: "180x180", type: "image/png" }],
  },
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
    ...(defaultOgImageUrl ? { images: [{ url: defaultOgImageUrl, alt: SITE_NAME }] } : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
  ...(siteVerification ? { verification: siteVerification } : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: PWA_THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: PWA_THEME_COLORS.dark },
  ],
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
        <meta name="theme-color" content={PWA_THEME_COLORS.light} />
        <meta name="format-detection" content="telephone=no" />
        {process.env.NEXT_PUBLIC_BUILD_ID ? (
          <meta name="build-id" content={process.env.NEXT_PUBLIC_BUILD_ID} />
        ) : null}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <JsonLd />
      </head>
      <body className="font-body antialiased theme-bg theme-text transition-colors duration-500">
        <Script id="house-theme-init" strategy="beforeInteractive">
          {`(function(){try{var k="house-theme";var t=localStorage.getItem(k);var pref=(t==="light"||t==="dark"||t==="system")?t:"system";var sys=window.matchMedia("(prefers-color-scheme: dark)").matches;var resolved=pref==="system"?(sys?"dark":"light"):pref;document.documentElement.setAttribute("data-theme",resolved);document.documentElement.style.colorScheme=resolved;}catch(e){var sys=window.matchMedia("(prefers-color-scheme: dark)").matches;var resolved=sys?"dark":"light";document.documentElement.setAttribute("data-theme",resolved);document.documentElement.style.colorScheme=resolved;}})();`}
        </Script>
        <PwaSerwistProvider>
          <ThemeProvider>
            <SessionProvider>
              <ContactConfigProvider value={contactConfig}>
                <ModalProvider>
                  <ProjectCompareProvider>
                    <SiteShell>{children}</SiteShell>
                  </ProjectCompareProvider>
                </ModalProvider>
              </ContactConfigProvider>
            </SessionProvider>
          </ThemeProvider>
        </PwaSerwistProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
