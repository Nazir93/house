/**
 * Отправка алерта в Telegram (cron / health-check). Запуск из frontend:
 * node scripts/vps-health-alert.cjs "сообщение"
 */
const { loadEnvFiles } = require("./load-env-files.cjs");

loadEnvFiles();

async function main() {
  const message = process.argv.slice(2).join(" ").trim();
  if (!message) {
    console.error("Usage: node vps-health-alert.cjs <message>");
    process.exit(1);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIds = (process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) {
    console.error("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы — алерт пропущен");
    process.exit(0);
  }

  const text = `⚠️ VPS chastdushi\n${message}`;
  for (const chatId of chatIds) {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) {
      console.error("Telegram error:", await res.text());
      process.exit(1);
    }
  }
  console.log("OK: alert sent");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
