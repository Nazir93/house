/** ID счётчика по умолчанию. Переопределяется через админку или NEXT_PUBLIC_YANDEX_METRIKA_ID. */
export const DEFAULT_YANDEX_METRIKA_ID = "110112800";

/** Глобал, который выставляет AnalyticsScripts до init — client goals читают тот же ID. */
export const YM_COUNTER_WINDOW_KEY = "__HOUSE_YM_COUNTER_ID__" as const;

export function pickYandexMetrikaId(raw: string | undefined): string {
  const s = raw?.trim() ?? "";
  return /^\d{5,20}$/.test(s) ? s : "";
}

export function parseYandexMetrikaCounterId(raw: string | undefined): number | null {
  const id = pickYandexMetrikaId(raw);
  if (!id) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}

export function resolveClientYandexMetrikaCounterId(): number {
  if (typeof window !== "undefined") {
    const fromWindow = (window as Window & { [YM_COUNTER_WINDOW_KEY]?: number })[YM_COUNTER_WINDOW_KEY];
    if (typeof fromWindow === "number" && Number.isFinite(fromWindow)) return fromWindow;
  }
  return parseYandexMetrikaCounterId(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID) ?? Number(DEFAULT_YANDEX_METRIKA_ID);
}

type MetrikaInitOptions = {
  ssr: boolean;
  webvisor: boolean;
  clickmap: boolean;
  ecommerce: string;
  accurateTrackBounce: boolean;
  trackLinks: boolean;
};

/** Вебвизор сильно нагружает слабые ПК — отключаем по эвристике железа. */
export function shouldEnableMetrikaWebvisor(input: {
  hardwareConcurrency?: number;
  deviceMemory?: number;
}): boolean {
  const cores = input.hardwareConcurrency ?? 4;
  const memory = input.deviceMemory ?? 8;
  if (cores <= 2) return false;
  if (memory > 0 && memory <= 4) return false;
  return true;
}

export function buildMetrikaInitOptions(input: {
  hardwareConcurrency?: number;
  deviceMemory?: number;
}): MetrikaInitOptions {
  return {
    ssr: true,
    webvisor: shouldEnableMetrikaWebvisor(input),
    clickmap: true,
    ecommerce: "dataLayer",
    accurateTrackBounce: true,
    trackLinks: true,
  };
}

/** Inline-выражение для init в браузере (эвристика железа на клиенте). */
export const METRIKA_WEBVISOR_INLINE_EXPR =
  "(function(){var n=navigator,c=n.hardwareConcurrency||4,m=n.deviceMemory||8;return c>2&&(!m||m>4);})()";
