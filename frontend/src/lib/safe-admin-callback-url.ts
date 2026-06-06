import { safeInternalCallbackUrl } from "@/lib/safe-internal-callback-url";

const DEFAULT = "/admin";

/** Безопасный redirect после входа администратора — только внутренние пути админки. */
export function safeAdminCallbackUrl(raw: string | null | undefined): string {
  return safeInternalCallbackUrl(raw, { defaultPath: DEFAULT, allowedPrefix: "/admin" });
}
