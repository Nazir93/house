import { prisma } from "@/lib/db";
import { buildProposalModelFromLead } from "@/lib/proposal/proposal-from-lead";
import { renderAndStoreProposalPdf } from "@/lib/proposal/render-proposal-pdf";

type LeadForProposal = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  calcData: unknown;
  createdAt: Date;
};

function trimErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.slice(0, 1200);
}

export async function generateLeadProposalPdf(lead: LeadForProposal): Promise<void> {
  const normalized = await buildProposalModelFromLead(lead);
  if (!normalized.ok) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        proposalStatus: "UNSUPPORTED",
        proposalError: normalized.reason,
      },
    });
    return;
  }

  try {
    const stored = await renderAndStoreProposalPdf(normalized.model);
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        proposalStatus: "READY",
        proposalPath: stored.publicPath,
        proposalFilename: stored.filename,
        proposalError: null,
        proposalReadyAt: new Date(),
      },
    });
  } catch (err) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        proposalStatus: "FAILED",
        proposalError: trimErrorMessage(err),
      },
    });
  }
}

