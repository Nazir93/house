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

/** ID счётчика по умолчанию (Яндекс.Метрика). Переопределяется через админку или NEXT_PUBLIC_YANDEX_METRIKA_ID. */
export const DEFAULT_YANDEX_METRIKA_ID = "110112800";

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
      {ymId ? (
        <>
          <Script id="yandex-metrika" strategy="beforeInteractive">
            {`(function(m,e,t,r,i,k,a){
m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=${ymId}","ym");
ym(${ymId},"init",{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`}
          </Script>
          <noscript>
            <div>
              <img
                src={`https://mc.yandex.ru/watch/${ymId}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        </>
      ) : null}
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
