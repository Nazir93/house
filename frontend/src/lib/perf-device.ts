export type PerfDeviceSignals = {
  hardwareConcurrency?: number;
  /** Chrome/Android; на Safari обычно отсутствует. */
  deviceMemory?: number;
  userAgent?: string;
};

const APPLE_MOBILE_RE = /iPhone|iPad|iPod/i;
const MOBILE_RE = /Android|iPhone|iPad|iPod/i;

export function isAppleMobileUa(userAgent: string | undefined): boolean {
  return APPLE_MOBILE_RE.test(userAgent ?? "");
}

export function isMobileUa(userAgent: string | undefined): boolean {
  return MOBILE_RE.test(userAgent ?? "");
}

/**
 * Оценка «слабого» устройства. Порог low-perf: score >= 3.
 * Важно: отсутствие deviceMemory на iOS больше не считается как 8 ГБ.
 */
export function scoreLowPerfDevice(signals: PerfDeviceSignals): number {
  const cores = signals.hardwareConcurrency || 4;
  const memory =
    typeof signals.deviceMemory === "number" && signals.deviceMemory > 0
      ? signals.deviceMemory
      : null;
  const mobile = isMobileUa(signals.userAgent);
  const appleMobile = isAppleMobileUa(signals.userAgent);

  let score = 0;
  if (cores <= 2) score += 3;
  else if (cores <= 4) score += 1;

  if (memory != null) {
    if (memory <= 2) score += 3;
    else if (memory <= 4) score += 2;
  } else if (appleMobile) {
    // Safari не отдаёт deviceMemory — раньше ошибочно считали 8 ГБ.
    score += 2;
  } else if (mobile) {
    score += 1;
  }

  if (mobile) score += 1;

  return score;
}

export function isLowPerfFromSignals(signals: PerfDeviceSignals): boolean {
  return scoreLowPerfDevice(signals) >= 3;
}
