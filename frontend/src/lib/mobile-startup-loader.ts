export const MOBILE_STARTUP_LOADER_MIN_MS = 550;
export const MOBILE_STARTUP_LOADER_FADE_MS = 260;

export function isStandaloneDisplayMode(
  matchesDisplayMode: boolean,
  legacyNavigatorStandalone: boolean | undefined,
): boolean {
  return matchesDisplayMode || legacyNavigatorStandalone === true;
}

export function shouldShowMobileStartupLoader(params: {
  isMobileViewport: boolean;
  isStandaloneMode: boolean;
}): boolean {
  return params.isMobileViewport && params.isStandaloneMode;
}

export function getRemainingLoaderDelay(startedAtMs: number, minVisibleMs: number, nowMs: number): number {
  return Math.max(0, minVisibleMs - Math.max(0, nowMs - startedAtMs));
}
