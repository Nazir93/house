import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import Script from "next/script";

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
  { revalidate: 60 }
);

function pickYandexMetrikaId(raw: string | undefined): string {
  const s = raw?.trim() ?? "";
  return /^\d{5,20}$/.test(s) ? s : "";
}

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
    "";
  const gaId =
    pickGaId(ids.google_analytics_id) ||
    pickGaId(process.env.NEXT_PUBLIC_GA_ID) ||
    "";

  return (
    <>
      {ymId && (
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
ym(${ymId},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
        </Script>
      )}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
    </>
  );
}
