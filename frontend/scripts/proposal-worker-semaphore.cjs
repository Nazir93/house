const { execSync } = require("child_process");

const MAX_CONCURRENT = Number(process.env.PROPOSAL_MAX_WORKERS || 2);

function countRunningJobs() {
  try {
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

/** Можно ли запустить ещё один PDF-воркер (лимит параллельных Chromium). */
function canSpawnProposalWorker() {
  return countRunningJobs() < MAX_CONCURRENT;
}

module.exports = { canSpawnProposalWorker, countRunningJobs, MAX_CONCURRENT };
