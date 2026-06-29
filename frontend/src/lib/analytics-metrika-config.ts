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
