export function safeInternalCallbackUrl(
  raw: string | null | undefined,
  options: { defaultPath: string; allowedPrefix: string }
): string {
  if (!raw) return options.defaultPath;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return options.defaultPath;
  if (!trimmed.startsWith(options.allowedPrefix)) return options.defaultPath;
  return trimmed;
}
