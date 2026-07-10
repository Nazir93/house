/** Сбрасывает ожидание токена при ошибке/таймауте SmartCaptcha. */
export function resolveSmartCaptchaWaiter(
  resolveRef: { current: ((token: string) => void) | undefined },
  timeoutRef: { current: ReturnType<typeof setTimeout> | undefined },
  token = "",
): void {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
  }
  if (resolveRef.current) {
    resolveRef.current(token);
    resolveRef.current = undefined;
  }
}

/** Ошибки ключа/домена — не бесконечно перезапускать виджет. */
export function isSmartCaptchaHostOrKeyError(message: string | undefined): boolean {
  const m = message?.toLowerCase() ?? "";
  return m.includes("cannot be used in the host") || m.includes("allowed hosts");
}
