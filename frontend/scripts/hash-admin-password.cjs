/**
 * Генерация ADMIN_PASSWORD_HASH для frontend/.env
 * Usage: node scripts/hash-admin-password.cjs "your-password"
 */
const { randomBytes, scryptSync } = require("crypto");

function hashPassword(plain) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

const plain = process.argv[2];
if (!plain) {
  console.error("Usage: node scripts/hash-admin-password.cjs <password>");
  process.exit(1);
}

const hash = hashPassword(plain);
console.log("");
console.log("Добавьте в frontend/.env:");
console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
console.log("");
console.log("После проверки входа можно удалить ADMIN_SECRET (plaintext).");
console.log("");
