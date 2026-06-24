#!/usr/bin/env node
/**
 * Подхват зависших PENDING (если spawn не сработал). Запускается cron каждые 2 мин.
 */
const { spawn } = require("child_process");
const path = require("path");
const { loadEnvFiles } = require("./load-env-files.cjs");
const { canSpawnProposalWorker } = require("./proposal-worker-semaphore.cjs");

loadEnvFiles();

const MAX_PER_RUN = 3;
const STALE_MS = 45 * 1000;

async function main() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  const script = path.join(__dirname, "run-proposal-job.cjs");

  try {
    const cutoff = new Date(Date.now() - STALE_MS);
    const pending = await prisma.lead.findMany({
      where: {
        proposalStatus: "PENDING",
        createdAt: { lt: cutoff },
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: MAX_PER_RUN,
    });

    if (pending.length === 0) {
      process.exit(0);
    }

    for (const row of pending) {
      if (!canSpawnProposalWorker()) break;
      const child = spawn(process.execPath, [script, row.id], {
        detached: true,
        stdio: "ignore",
        env: process.env,
        cwd: path.join(__dirname, ".."),
      });
      child.unref();
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[process-pending-proposals]", err);
  process.exit(1);
});
