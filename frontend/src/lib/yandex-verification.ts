/** Коды подтверждения Яндекс.Вебмастера (meta yandex-verification). */
export function collectYandexVerificationCodes(
  ...sources: Array<string | undefined>
): string[] {
  const codes = new Set<string>();
  for (const raw of sources) {
    const value = raw?.trim() ?? "";
    if (!value) continue;
    for (const part of value.split(/[,;\s]+/)) {
      const code = part.trim();
      if (code) codes.add(code);
    }
  }
  return [...codes];
}

export function buildYandexVerificationMetadata(
  ...sources: Array<string | undefined>
): string | string[] | undefined {
  const codes = collectYandexVerificationCodes(...sources);
  if (codes.length === 0) return undefined;
  if (codes.length === 1) return codes[0];
  return codes;
}
