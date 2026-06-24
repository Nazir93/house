const OPS_ALERT_COOLDOWN_MS = 5 * 60 * 1000;
let lastOpsAlertAt = 0;

/** Структурированный лог API для PM2 / logrotate. */
export function logApiRequest(method: string, path: string, status: number, ms: number): void {
  console.info(`[API] ${method} ${path} ${status} ${ms}ms`);
  if (status >= 500) {
    void notifyOpsAlert(`API ${method} ${path} → ${status}`).catch(() => {});
  }
}

/** Rate-limited алерт в Telegram (cron/ops). */
export async function notifyOpsAlert(message: string): Promise<void> {
  const now = Date.now();
  if (now - lastOpsAlertAt < OPS_ALERT_COOLDOWN_MS) return;
  lastOpsAlertAt = now;

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIds = (process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!token || chatIds.length === 0) return;

  const text = `⚠️ chastdushi ops\n${message}`;
  await Promise.all(
    chatIds.map((chatId) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      })
    )
  );
}
