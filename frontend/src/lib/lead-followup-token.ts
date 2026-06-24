import crypto from "crypto";

const TOKEN_TTL_MS = 30 * 60 * 1000;

function secret(): string {
  const s =
    process.env.LEAD_FOLLOWUP_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("LEAD_FOLLOWUP_SECRET or NEXTAUTH_SECRET required in production");
  }
  return "dev-lead-followup-secret";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createLeadFollowupToken(leadId: string, now = Date.now()): string {
  const exp = now + TOKEN_TTL_MS;
  const payload = `${leadId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyLeadFollowupToken(token: string, now = Date.now()): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [leadId, expRaw, signature] = parts;
  if (!leadId || !expRaw || !signature) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < now) return null;

  const payload = `${leadId}.${expRaw}`;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return leadId;
}
