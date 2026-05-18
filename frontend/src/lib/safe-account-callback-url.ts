const DEFAULT = "/account/dashboard";

/** Безопасный redirect после входа клиента — только внутренние пути ЛК. */
export function safeAccountCallbackUrl(raw: string | null | undefined): string {
  if (!raw) return DEFAULT;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return DEFAULT;
  if (!trimmed.startsWith("/account")) return DEFAULT;
  return trimmed;
}
