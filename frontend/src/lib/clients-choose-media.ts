import { isLowPerfFromSignals, type PerfDeviceSignals } from "@/lib/perf-device";

/** Скролл-скруб ролика «Наши услуги»: на слабых телефонах/iOS режем частоту, но кадр показываем. */
export function shouldScrubClientsChooseVideoDense(signals: PerfDeviceSignals & {
  prefersReducedMotion?: boolean;
}): boolean {
  if (signals.prefersReducedMotion) return false;
  if (isLowPerfFromSignals(signals)) return false;
  return true;
}

/** Минимальный интервал seek (мс): плотный на десктопе, редкий на weak/mobile. */
export function clientsChooseVideoSeekIntervalMs(denseScrub: boolean): number {
  return denseScrub ? 120 : 360;
}
