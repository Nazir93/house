/** Отложенная загрузка аналитики: idle / жест / таймаут. */
export const ANALYTICS_DEFER_IDLE_TIMEOUT_MS = 3500;
export const ANALYTICS_DEFER_FALLBACK_MS = 4000;

export type AnalyticsDeferTrigger = "idle" | "interaction" | "timeout";

/**
 * Когда грузить Метрику/GA после гидрации.
 * idle — requestIdleCallback; interaction — scroll/pointer/keydown; timeout — запасной лимит.
 */
export function shouldLoadDeferredAnalytics(trigger: AnalyticsDeferTrigger): boolean {
  return trigger === "idle" || trigger === "interaction" || trigger === "timeout";
}
