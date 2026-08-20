import Script from "next/script";

import {
  buildYandexMetrikaInlineBootstrap,
  buildYandexMetrikaNoscriptImgSrc,
} from "@/lib/analytics-metrika-snippet";

/**
 * Счётчик в исходном HTML до гидратации: noscript + init + tag.js.
 * Не использовать DeferredYandexMetrika — иначе Яндекс Бизнес не видит счётчик.
 */
export function YandexMetrikaSnippet({ ymId }: { ymId: string }) {
  const noscriptSrc = buildYandexMetrikaNoscriptImgSrc(ymId);
  const bootstrap = buildYandexMetrikaInlineBootstrap(ymId);

  return (
    <>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- пиксель Метрики в noscript */}
          <img src={noscriptSrc} style={{ position: "absolute", left: "-9999px" }} alt="" />
        </div>
      </noscript>
      <Script id="yandex-metrika" strategy="beforeInteractive">
        {bootstrap}
      </Script>
    </>
  );
}
