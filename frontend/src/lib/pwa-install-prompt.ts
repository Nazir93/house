export const PWA_INSTALL_DISMISS_KEY = "pwa-install-banner-dismissed" as const;

export type PwaInstallPlatform = "android" | "ios" | "desktop" | "unknown";

export function isStandaloneDisplayMode(
  matchMedia: (query: string) => MediaQueryList,
  navigatorStandalone?: boolean
): boolean {
  if (navigatorStandalone === true) return true;
  return matchMedia("(display-mode: standalone)").matches;
}

export function detectIosUserAgent(userAgent: string): boolean {
  return /iphone|ipad|ipod/i.test(userAgent);
}

export function resolvePwaInstallPlatform(userAgent: string, canInstall: boolean): PwaInstallPlatform {
  if (canInstall) return "android";
  if (detectIosUserAgent(userAgent)) return "ios";
  if (/android/i.test(userAgent)) return "android";
  if (/windows|macintosh|linux/i.test(userAgent)) return "desktop";
  return "unknown";
}

export function shouldShowPwaInstallBanner(input: {
  dismissed: boolean;
  standalone: boolean;
  isMobileViewport: boolean;
  platform: PwaInstallPlatform;
}): boolean {
  if (input.dismissed || input.standalone) return false;
  if (input.platform === "ios" && input.isMobileViewport) return true;
  if (input.platform === "android" && input.isMobileViewport) return true;
  return false;
}

export function pwaInstallBannerMessage(platform: PwaInstallPlatform): string {
  if (platform === "ios") {
    return "Это PWA-приложение. Нажмите «Поделиться» в Safari и выберите «На экран Домой», чтобы открывать сайт как приложение.";
  }
  return "Сайт работает как PWA-приложение. Добавьте на главный экран — быстрый доступ без браузерной строки.";
}
