const DEFAULT_ALLOWED_HOSTS = [
  "rtsp.me",
  "ivideon.com",
  "maps.yandex.ru",
  "yandex.ru",
  "yandex.com",
  "google.com",
  "google.ru",
] as const;

function allowedHosts(): string[] {
  const fromEnv = process.env.CAMERA_IFRAME_ALLOWED_HOSTS?.split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : [...DEFAULT_ALLOWED_HOSTS];
}

export function safeIframeUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    const ok = allowedHosts().some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
    return ok ? url.toString() : null;
  } catch {
    return null;
  }
}
