/**
 * Правила «деплой готов» — единый контракт для assert-скрипта и тестов.
 * Деплой нельзя считать успешным без полной Next-сборки и зелёного health.
 */

export type DeployReadyCheck =
  | { ok: true }
  | { ok: false; reason: string };

/** После `next build` обязателен непустой `.next/BUILD_ID` и каталог server. */
export function assertNextBuildArtifacts(params: {
  buildId: string | null | undefined;
  hasServerDir: boolean;
}): DeployReadyCheck {
  const id = typeof params.buildId === "string" ? params.buildId.trim() : "";
  if (!id) {
    return {
      ok: false,
      reason: "нет .next/BUILD_ID — сборка неполная, next start уйдёт в crash-loop",
    };
  }
  if (!params.hasServerDir) {
    return {
      ok: false,
      reason: "нет .next/server — сборка неполная",
    };
  }
  return { ok: true };
}

/**
 * Серия HTTP-кодов с ретраев: успех, если есть хотя бы один 200.
 * Пустая серия / только ошибки — провал.
 */
export function assertHealthProbeResults(httpCodes: number[]): DeployReadyCheck {
  if (!httpCodes.length) {
    return { ok: false, reason: "health: нет ни одной попытки" };
  }
  if (httpCodes.some((code) => code === 200)) {
    return { ok: true };
  }
  return {
    ok: false,
    reason: `health: ни одна попытка не вернула 200 (коды: ${httpCodes.join(", ")})`,
  };
}

/** Сколько ретраев и пауза — для скрипта и документации. */
export const DEPLOY_HEALTH_RETRY = {
  attempts: 12,
  delayMs: 3000,
} as const;
