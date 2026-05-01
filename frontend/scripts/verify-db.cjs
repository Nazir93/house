/**
 * Проверка DATABASE_URL из .env.local (через npm run db:verify).
 * Не выводит пароль.
 */
const { PrismaClient } = require("@prisma/client");

async function main() {
  const p = new PrismaClient();
  try {
    await p.$connect();
    const projects = await p.project.count();
    const leads = await p.lead.count();
    console.log("");
    console.log("  OK — подключение к базе работает.");
    console.log("  Project:", projects, "| Lead:", leads);
    console.log("");
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    console.error("");
    console.error("  Ошибка:", msg);
    console.error("");
    if (msg.includes("P1001") || msg.includes("Can't reach")) {
      console.error("  Подсказка:");
      console.error("    • Порт 5433 в DATABASE_URL — сначала туннель к VPS:");
      console.error('      npm run db:tunnel -- -VpsHost "IP_СЕРВЕРА"');
      console.error("    • Порт 5432 — нужен локальный PostgreSQL на этом ПК.");
      console.error("");
    }
    process.exit(1);
  } finally {
    await p.$disconnect();
  }
}

main();
