import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const SALT_LEN = 16;
const KEY_LEN = 64;
const PREFIX = "scrypt:";

/** Детерминированное хеширование без внешних зависимостей (Node crypto). */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LEN).toString("hex");
  const derived = (await scryptAsync(plain, salt, KEY_LEN)) as Buffer;
  return `${PREFIX}${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (!stored?.startsWith(PREFIX)) return false;
  const rest = stored.slice(PREFIX.length);
  const colon = rest.indexOf(":");
  if (colon < 0) return false;
  const salt = rest.slice(0, colon);
  const hashHex = rest.slice(colon + 1);
  if (!salt || !hashHex) return false;
  try {
    const derived = (await scryptAsync(plain, salt, KEY_LEN)) as Buffer;
    const expected = Buffer.from(hashHex, "hex");
    if (expected.length !== derived.length) return false;
    return timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}
