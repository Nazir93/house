import { isLowPerfFromSignals, isMobileUa, type PerfDeviceSignals } from "@/lib/perf-device";

export type ClientsChooseMediaSignals = PerfDeviceSignals & {
  prefersReducedMotion?: boolean;
  /** `standalone` в PWA с домашнего экрана. */
  displayMode?: string;
};

/** На mobile/PWA видео-скруб ненадёжен — показываем статичные картинки по услугам. */
export function shouldUseClientsChooseStaticMedia(signals: ClientsChooseMediaSignals): boolean {
  if (signals.prefersReducedMotion) return true;
  if (signals.displayMode === "standalone") return true;
  if (isMobileUa(signals.userAgent)) return true;
  return false;
}

/** Скролл-скруб ролика «Наши услуги»: на слабых телефонах/iOS режем частоту, но кадр показываем. */
export function shouldScrubClientsChooseVideoDense(signals: ClientsChooseMediaSignals): boolean {
  if (shouldUseClientsChooseStaticMedia(signals)) return false;
  if (signals.prefersReducedMotion) return false;
  if (isLowPerfFromSignals(signals)) return false;
  return true;
}

/** Минимальный интервал seek (мс): плотный на десктопе, редкий на weak/mobile. */
export function clientsChooseVideoSeekIntervalMs(denseScrub: boolean): number {
  return denseScrub ? 120 : 360;
}
