/** Доля скролл-сегмента: сначала уход текущей услуги, затем появление следующей. */
export const CLIENTS_CHOOSE_EXIT_FRACTION = 0.42;

export type ClientsChooseScrollState = {
  scaled: number;
  baseIndex: number;
  localProgress: number;
  /** Номер услуги для счётчика (1-based). */
  displayNumber: number;
};

export function getClientsChooseScrollState(
  progress: number,
  serviceCount: number,
  exitFraction = CLIENTS_CHOOSE_EXIT_FRACTION,
): ClientsChooseScrollState {
  const scaled = progress * serviceCount;
  const baseIndex = Math.min(Math.floor(scaled), serviceCount - 1);
  const localProgress = scaled - baseIndex;
  const enteringNext = localProgress > exitFraction && baseIndex < serviceCount - 1;
  const displayNumber = enteringNext ? baseIndex + 2 : baseIndex + 1;

  return { scaled, baseIndex, localProgress, displayNumber };
}

/** Нормализованная позиция видео (0..1), синхронная с видимой услугой слева. */
export function resolveClientsChooseVideoProgress(
  progress: number,
  serviceCount: number,
  exitFraction = CLIENTS_CHOOSE_EXIT_FRACTION,
): number {
  const { baseIndex, localProgress } = getClientsChooseScrollState(progress, serviceCount, exitFraction);

  if (baseIndex >= serviceCount - 1) {
    return Math.min((baseIndex + localProgress) / serviceCount, 1);
  }

  if (localProgress <= exitFraction) {
    const holdT = localProgress / exitFraction;
    return (baseIndex + holdT * 0.35 + 0.08) / serviceCount;
  }

  const enterT = (localProgress - exitFraction) / (1 - exitFraction);
  return (baseIndex + 1 + enterT * 0.6) / serviceCount;
}

export function resolveClientsChooseSlideVisual(
  idx: number,
  baseIndex: number,
  localProgress: number,
  total: number,
  exitFraction = CLIENTS_CHOOSE_EXIT_FRACTION,
): { opacity: number; translateY: number; visible: boolean; zIndex: number } {
  const hidden = { opacity: 0, translateY: 28, visible: false, zIndex: 0 };

  if (idx === baseIndex) {
    if (baseIndex >= total - 1) {
      return { opacity: 1, translateY: 0, visible: true, zIndex: 2 };
    }
    if (localProgress <= exitFraction) {
      const t = localProgress / exitFraction;
      return {
        opacity: 1 - t,
        translateY: -28 * t,
        visible: 1 - t > 0.02,
        zIndex: 2,
      };
    }
    return { opacity: 0, translateY: -28, visible: false, zIndex: 0 };
  }

  if (idx === baseIndex + 1) {
    if (localProgress <= exitFraction) {
      return hidden;
    }
    const t = (localProgress - exitFraction) / (1 - exitFraction);
    return {
      opacity: t,
      translateY: 28 * (1 - t),
      visible: t > 0.02,
      zIndex: 2,
    };
  }

  return hidden;
}
