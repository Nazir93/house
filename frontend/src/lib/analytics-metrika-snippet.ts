import {
  METRIKA_CLICKMAP_INLINE_EXPR,
  METRIKA_WEBVISOR_INLINE_EXPR,
  YM_COUNTER_WINDOW_KEY,
  pickYandexMetrikaId,
} from "@/lib/analytics-metrika-config";

/** Href скрипта счётчика — должен быть в исходном HTML (View Source / Яндекс Бизнес). */
export function buildYandexMetrikaTagScriptSrc(ymId: string): string {
  const id = pickYandexMetrikaId(ymId);
  if (!id) throw new Error("invalid_yandex_metrika_id");
  return `https://mc.yandex.ru/metrika/tag.js?id=${id}`;
}

/**
 * Классический bootstrap Метрики: stub ym + async tag.js + init.
 * Только после pickYandexMetrikaId (цифры) — безопасно для inline script.
 */
export function buildYandexMetrikaInlineBootstrap(ymId: string): string {
  const id = pickYandexMetrikaId(ymId);
  if (!id) throw new Error("invalid_yandex_metrika_id");
  const src = buildYandexMetrikaTagScriptSrc(id);
  return `(function(m,e,t,r,i,k,a){
m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window,document,"script",${JSON.stringify(src)},"ym");
window[${JSON.stringify(YM_COUNTER_WINDOW_KEY)}]=${id};
ym(${id},"init",{ssr:true,webvisor:${METRIKA_WEBVISOR_INLINE_EXPR},clickmap:${METRIKA_CLICKMAP_INLINE_EXPR},ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true,referrer:document.referrer,url:location.href});`;
}

export function buildYandexMetrikaNoscriptImgSrc(ymId: string): string {
  const id = pickYandexMetrikaId(ymId);
  if (!id) throw new Error("invalid_yandex_metrika_id");
  return `https://mc.yandex.ru/watch/${id}`;
}

/** Проверка приёмки: исходный HTML содержит счётчик, tag.js и init. */
export function metrikaSnippetMarkersPresent(html: string, ymId: string): {
  hasCounterId: boolean;
  hasTagJs: boolean;
  hasInit: boolean;
  hasNoscriptWatch: boolean;
} {
  const id = pickYandexMetrikaId(ymId);
  return {
    hasCounterId: Boolean(id && html.includes(id)),
    hasTagJs: html.includes("metrika/tag.js"),
    hasInit: /ym\s*\(\s*\d+\s*,\s*["']init["']/.test(html) || html.includes('"init"'),
    hasNoscriptWatch: html.includes("mc.yandex.ru/watch/"),
  };
}
