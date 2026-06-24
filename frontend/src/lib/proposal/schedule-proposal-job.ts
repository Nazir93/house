import { spawn } from "child_process";
import path from "path";

const MAX_CONCURRENT = Number(process.env.PROPOSAL_MAX_WORKERS || 2);

function countRunningProposalJobs(): number {
  try {
    const { execSync } = require("child_process") as typeof import("child_process");
    const out = execSync("pgrep -f run-proposal-job.cjs 2>/dev/null | wc -l", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const n = parseInt(String(out).trim(), 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * Генерация КП в отдельном Node-процессе — Chromium не съедает RAM/CPU у house-next.
 * На сервере подхватывает зависшие PENDING cron (scripts/setup-proposal-cron.sh).
 */
export function scheduleLeadProposalPdf(leadId: string): void {
  const id = leadId?.trim();
  if (!id) return;

  if (countRunningProposalJobs() >= MAX_CONCURRENT) {
    console.info("[proposal] worker limit reached, cron will retry lead", id);
    return;
  }

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
