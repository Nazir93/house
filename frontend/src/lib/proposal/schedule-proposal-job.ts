import { spawn } from "child_process";
import path from "path";

/**
 * Генерация КП в отдельном Node-процессе — Chromium не съедает RAM/CPU у house-next.
 * На сервере подхватывает зависшие PENDING cron (scripts/setup-proposal-cron.sh).
 */
export function scheduleLeadProposalPdf(leadId: string): void {
  const id = leadId?.trim();
  if (!id) return;

  const script = path.join(process.cwd(), "scripts", "run-proposal-job.cjs");
  try {
    const child = spawn(process.execPath, [script, id], {
      detached: true,
      stdio: "ignore",
      env: process.env,
      cwd: process.cwd(),
    });
    child.unref();
  } catch (err) {
    console.error("[proposal] failed to spawn background job:", err);
  }
}
