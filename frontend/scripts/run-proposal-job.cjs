#!/usr/bin/env node
/**
 * Фоновая генерация PDF для одной заявки (отдельный процесс от PM2 house-next).
 * Usage: node scripts/run-proposal-job.cjs <leadId>
 */
const { loadEnvFiles } = require("./load-env-files.cjs");

loadEnvFiles();

const leadId = process.argv[2]?.trim();
if (!leadId) {
  console.error("Usage: node scripts/run-proposal-job.cjs <leadId>");
  process.exit(1);
}

require("tsx/cjs");

async function main() {
  const { PrismaClient } = require("@prisma/client");
  const { generateLeadProposalPdf } = require("../src/lib/proposal/proposal-service.ts");

  const prisma = new PrismaClient();
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        calcData: true,
        createdAt: true,
        proposalStatus: true,
      },
    });

    if (!lead) {
      console.error("[proposal-job] lead not found:", leadId);
      process.exit(1);
    }

    if (lead.proposalStatus !== "PENDING") {
      process.exit(0);
    }

    await generateLeadProposalPdf(lead);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[proposal-job]", err);
  process.exit(1);
});
