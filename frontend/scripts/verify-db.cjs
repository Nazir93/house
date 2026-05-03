/**
 * Проверка подключения к БД (DATABASE_URL из .env / .env.local — см. load-env-files).
 * Не выводит пароль.
 */
const { loadEnvFiles } = require("./load-env-files.cjs");
const { PrismaClient } = require("@prisma/client");

loadEnvFiles();
async function main() {
  const p = new PrismaClient();
  try {
    await p.$connect();
    const projects = await p.project.count();
    const leads = await p.lead.count();
    let clientCabinet = "?";
    try {
      clientCabinet = String(await p.clientConstructionProject.count());
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      if (msg.includes("does not exist") || msg.includes("Unknown table") || msg.includes("P2021")) {
        clientCabinet = "таблиц нет — выполните: npx prisma migrate deploy";
      } else {
        clientCabinet = `ошибка: ${msg}`;
      }
    }
    console.log("");
    console.log("  OK — подключение к базе работает.");
    console.log("  Project:", projects, "| Lead:", leads);
    console.log("  ClientConstructionProject (личный кабинет):", clientCabinet);
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
