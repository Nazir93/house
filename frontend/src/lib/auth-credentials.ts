import { verifyPassword } from "@/lib/password";
import { checkPublicRateLimitDb, peekPublicRateLimitCount } from "@/lib/public-rate-limit-db";

const AUTH_FAIL_WINDOW_MS = 15 * 60 * 1000;
const AUTH_FAIL_MAX = 8;

function authKey(provider: string, id: string): string {
  return `${provider}:${id.trim().toLowerCase() || "empty"}`;
}

async function verifyAdminPassword(inputPassword: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hash) {
    return verifyPassword(inputPassword, hash);
  }
  const adminSecret = process.env.ADMIN_SECRET?.trim();
  if (!adminSecret) return false;
  return inputPassword === adminSecret;
}

async function applyAuthBackoff(key: string): Promise<boolean> {
  const fails = await peekPublicRateLimitCount({
    scope: "auth-fail",
    key,
    max: AUTH_FAIL_MAX,
    windowMs: AUTH_FAIL_WINDOW_MS,
  });
  return fails < AUTH_FAIL_MAX;
}

async function recordAuthFailure(key: string): Promise<void> {
  await checkPublicRateLimitDb({
    scope: "auth-fail",
    key,
    max: AUTH_FAIL_MAX + 1,
    windowMs: AUTH_FAIL_WINDOW_MS,
  });
}

export async function authorizeAdminCredentials(
  email: string | undefined,
  password: string | undefined
): Promise<{ id: string; email: string; name: string; role: "admin" } | null> {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@dom.ru").trim();
  const adminSecret = process.env.ADMIN_SECRET?.trim();
  const adminHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!adminSecret && !adminHash) {
    console.error("[AUTH] ADMIN_SECRET or ADMIN_PASSWORD_HASH is not set");
    return null;
  }

  const inputEmail = email?.trim() ?? "";
  const inputPassword = password ?? "";
  const key = authKey("admin", inputEmail);
  if (!(await applyAuthBackoff(key))) return null;

  if (
    inputEmail.toLowerCase() === adminEmail.toLowerCase() &&
    (await verifyAdminPassword(inputPassword))
  ) {
    return {
      id: "admin",
      email: adminEmail,
      name: "Администратор",
      role: "admin" as const,
    };
  }

  await recordAuthFailure(key);
  return null;
}

export async function authorizeClientCredentials(
  contractNumber: string | undefined,
  password: string | undefined
) {
  const { prisma } = await import("@/lib/db");
  const cn = contractNumber?.trim() ?? "";
  const pwd = password ?? "";
  if (!cn || !pwd) return null;
  const key = authKey("client", cn);
  if (!(await applyAuthBackoff(key))) return null;

  const project = await prisma.clientConstructionProject.findUnique({
    where: { contractNumber: cn },
  });
  if (!project?.passwordHash) {
    await recordAuthFailure(key);
    return null;
  }

  const ok = await verifyPassword(pwd, project.passwordHash);
  if (!ok) {
    await recordAuthFailure(key);
    return null;
  }

  return {
    id: project.id,
    email: project.clientEmail ?? `${project.contractNumber}@client.local`,
    name: project.clientName?.trim() || "Клиент",
    role: "client" as const,
    clientProjectId: project.id,
  };
}

/** @internal — для unit-тестов auth backoff */
export { authKey, AUTH_FAIL_MAX };
