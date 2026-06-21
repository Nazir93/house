/**
 * Проверка Telegram-уведомлений о заявках (env + SiteSettings).
 * Запуск на VPS: cd frontend && node scripts/verify-telegram-notify.cjs
 * Тестовое сообщение: node scripts/verify-telegram-notify.cjs --send
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

function maskToken(token) {
  if (!token) return "empty";
  const t = String(token);
  if (t.length <= 10) return `set (${t.length} chars)`;
  return `set (${t.length} chars, ${t.slice(0, 6)}…${t.slice(-4)})`;
}

async function resolveConfig() {
  let botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
  let chatIds = [];
  const multi = process.env.TELEGRAM_CHAT_IDS?.trim();
  if (multi) chatIds = multi.split(",").map((s) => s.trim()).filter(Boolean);
  else if (process.env.TELEGRAM_CHAT_ID?.trim()) chatIds = [process.env.TELEGRAM_CHAT_ID.trim()];

  let threadId = process.env.TELEGRAM_MESSAGE_THREAD_ID?.trim() || null;
  const dbRows = await new PrismaClient().siteSettings.findMany({
    where: { key: { startsWith: "telegram_" } },
  });
  const db = Object.fromEntries(dbRows.map((r) => [r.key, r.value]));

  const envHasToken = Boolean(botToken);
  const envHasChat = chatIds.length > 0;

  if (!botToken && db.telegram_bot_token?.trim()) botToken = db.telegram_bot_token.trim();
  if (chatIds.length === 0) {
    if (db.telegram_chat_ids?.trim()) {
      chatIds = db.telegram_chat_ids.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (db.telegram_chat_id?.trim()) {
      chatIds = [db.telegram_chat_id.trim()];
    }
  }
  if (!threadId && db.telegram_message_thread_id?.trim()) threadId = db.telegram_message_thread_id.trim();

  return { botToken, chatIds, threadId, db, envHasToken, envHasChat };
}

async function sendTest(botToken, chatId, threadId) {
  const payload = {
    chat_id: chatId,
    text: "✅ Тест уведомлений chastdushi.ru\nЗаявки из сайта должны приходить в этот чат.",
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (threadId && Number.isFinite(Number(threadId))) payload.message_thread_id = Number(threadId);

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ok: Boolean(data.ok), description: data.description || `HTTP ${res.status}` };
}

async function main() {
  const send = process.argv.includes("--send");
  const cfg = await resolveConfig();

  console.log("=== Telegram config (effective) ===");
  console.log("bot token:", maskToken(cfg.botToken));
  console.log("chat ids:", cfg.chatIds.length ? cfg.chatIds.join(", ") : "empty");
  console.log("thread id:", cfg.threadId || "(none)");
  console.log("");
  console.log("=== Source ===");
  console.log("TELEGRAM_* in .env:", cfg.envHasToken ? "token yes" : "token no", "|", cfg.envHasChat ? "chat yes" : "chat no");
  console.log("(env имеет приоритет над админкой → Настройки → Telegram)");
  console.log("");
  console.log("=== DB admin keys ===");
  for (const key of ["telegram_bot_token", "telegram_chat_id", "telegram_chat_ids", "telegram_message_thread_id"]) {
    const v = cfg.db[key];
    if (key.includes("token")) console.log(key + ":", v?.trim() ? maskToken(v.trim()) : "empty");
    else console.log(key + ":", v?.trim() || "empty");
  }

  if (!cfg.botToken || cfg.chatIds.length === 0) {
    console.error("\nFAIL: нет токена или chat id — уведомления не отправляются.");
    process.exit(1);
  }

  if (!send) {
    console.log("\nOK: конфигурация найдена. Для тестового сообщения: node scripts/verify-telegram-notify.cjs --send");
    return;
  }

  for (const chatId of cfg.chatIds) {
    const r = await sendTest(cfg.botToken, chatId, cfg.threadId);
    if (r.ok) console.log(`\nOK: тест отправлен в chat_id=${chatId}`);
    else {
      console.error(`\nFAIL chat_id=${chatId}: ${r.description}`);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
