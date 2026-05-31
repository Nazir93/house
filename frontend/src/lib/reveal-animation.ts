import type { CSSProperties } from "react";

export const DEFAULT_REVEAL_STEP_MS = 70;
export const DEFAULT_REVEAL_MAX_MS = 420;

export function revealDelay(index: number, stepMs = DEFAULT_REVEAL_STEP_MS, maxMs = DEFAULT_REVEAL_MAX_MS): number {
  if (!Number.isFinite(index) || index <= 0) return 0;
  const step = Math.max(0, Math.floor(stepMs));
  const max = Math.max(0, Math.floor(maxMs));
  return Math.min(Math.floor(index) * step, max);
}

export function revealDelayStyle(index: number, stepMs?: number, maxMs?: number): CSSProperties {
  return { "--reveal-delay": `${revealDelay(index, stepMs, maxMs)}ms` } as CSSProperties;
}
