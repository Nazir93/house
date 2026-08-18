import { isAppleMobileUa } from "@/lib/perf-device";

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
  userAgent?: string;
}): boolean {
  const cores = input.hardwareConcurrency ?? 4;
  if (cores <= 2) return false;
  const memory =
    typeof input.deviceMemory === "number" && input.deviceMemory > 0 ? input.deviceMemory : null;
  if (memory != null && memory <= 4) return false;
  // Safari/iOS: нет deviceMemory — раньше подставляли 8 и включали webvisor зря.
  if (memory == null && isAppleMobileUa(input.userAgent)) return false;
  return true;
}

export function buildMetrikaInitOptions(input: {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  userAgent?: string;
}): MetrikaInitOptions {
  const heavyUi = shouldEnableMetrikaWebvisor(input);
  return {
    ssr: true,
    webvisor: heavyUi,
    /** Clickmap тоже дорого на слабых телефонах — та же эвристика, что у webvisor. */
    clickmap: heavyUi,
    ecommerce: "dataLayer",
    accurateTrackBounce: true,
    trackLinks: true,
  };
}

/** Inline-выражение для init в браузере (эвристика железа на клиенте). */
export const METRIKA_WEBVISOR_INLINE_EXPR =
  "(function(){var n=navigator,c=n.hardwareConcurrency||4,m=n.deviceMemory,ua=n.userAgent||'';if(c<=2)return false;if(m>0&&m<=4)return false;if(/iPhone|iPad|iPod/i.test(ua)&&!(m>0))return false;return true;})()";

/** Тот же gate для clickmap в inline-init AnalyticsScripts. */
export const METRIKA_CLICKMAP_INLINE_EXPR = METRIKA_WEBVISOR_INLINE_EXPR;