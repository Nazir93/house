import { safeInternalCallbackUrl } from "@/lib/safe-internal-callback-url";

const DEFAULT = "/account/dashboard";

/** Безопасный redirect после входа клиента — только внутренние пути ЛК. */
export function safeAccountCallbackUrl(raw: string | null | undefined): string {
  return safeInternalCallbackUrl(raw, { defaultPath: DEFAULT, allowedPrefix: "/account" });
}
