import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import Script from "next/script";
import { Suspense } from "react";

import { MetrikaSpaHit } from "@/components/seo/metrika-spa-hit";
import { YandexMetrikaSnippet } from "@/components/seo/yandex-metrika-snippet";
import { pickYandexMetrikaId, DEFAULT_YANDEX_METRIKA_ID } from "@/lib/analytics-metrika-config";

export { DEFAULT_YANDEX_METRIKA_ID } from "@/lib/analytics-metrika-config";

const getAnalyticsIds = unstable_cache(
  async () => {
    try {
      const settings = await prisma.siteSettings.findMany({
        where: { key: { in: ["yandex_metrika_id", "google_analytics_id"] } },
      });
      const map: Record<string, string> = {};
      for (const s of settings) map[s.key] = s.value;
      return map;
    } catch {
      return {};
    }
  },
  ["analytics-ids"],
  { revalidate: 60 },
);

function pickGaId(raw: string | undefined): string {
  const s = raw?.trim() ?? "";
  if (/^G-[A-Z0-9]+$/.test(s)) return s;
  if (/^UA-\d+-\d+$/.test(s)) return s;
  return "";
}

export async function AnalyticsScripts() {
  const ids = await getAnalyticsIds();
  const ymId =
    pickYandexMetrikaId(ids.yandex_metrika_id) ||
    pickYandexMetrikaId(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID) ||
    DEFAULT_YANDEX_METRIKA_ID;
  const gaId =
    pickGaId(ids.google_analytics_id) ||
    pickGaId(process.env.NEXT_PUBLIC_GA_ID) ||
    "";

  return (
    <>
      {ymId ? <YandexMetrikaSnippet ymId={ymId} /> : null}
      {ymId ? (
        <Suspense fallback={null}>
          <MetrikaSpaHit />
        </Suspense>
      ) : null}
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="lazyOnload"
          />
          <Script id="google-analytics" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      ) : null}
    </>
  );
}
