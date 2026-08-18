export const MOBILE_STARTUP_LOADER_MIN_MS = 550;
export const MOBILE_STARTUP_LOADER_FADE_MS = 260;
/** На desktop/PWA лоадер не должен висеть вечно, если load застрял. */
export const STARTUP_LOADER_MAX_MS = 2800;
/** Короткая пауза после load/fonts, чтобы успел отрисоваться первый кадр. */
export const STARTUP_LOADER_SETTLE_MS = 120;

export function isStandaloneDisplayMode(
  matchesDisplayMode: boolean,
  legacyNavigatorStandalone: boolean | undefined,
): boolean {
  return matchesDisplayMode || legacyNavigatorStandalone === true;
}

/**
 * Desktop — всегда (маскирует jank первого открытия).
 * Mobile — только установленное PWA (standalone), как раньше.
 */
export function shouldShowMobileStartupLoader(params: {
  isMobileViewport: boolean;
  isStandaloneMode: boolean;
}): boolean {
  if (!params.isMobileViewport) return true;
  return params.isStandaloneMode;
}

export function getRemainingLoaderDelay(startedAtMs: number, minVisibleMs: number, nowMs: number): number {
  return Math.max(0, minVisibleMs - Math.max(0, nowMs - startedAtMs));
}

/** Сколько ждать до скрытия с учётом min и жёсткого max. */
export function getStartupLoaderHideDelay(params: {
  startedAtMs: number;
  nowMs: number;
  minVisibleMs: number;
  maxVisibleMs: number;
}): number {
  const elapsed = Math.max(0, params.nowMs - params.startedAtMs);
  const minRemaining = Math.max(0, params.minVisibleMs - elapsed);
  const maxRemaining = Math.max(0, params.maxVisibleMs - elapsed);
  return Math.min(minRemaining, maxRemaining);
}
