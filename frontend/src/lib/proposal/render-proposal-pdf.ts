import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { chromium } from "playwright";
import { renderProposalHtml } from "@/lib/proposal/render-proposal-html";
import type { ProposalDocumentModel } from "@/lib/proposal/types";

export type StoredProposalPdf = {
  storagePath: string;
  publicPath: string;
  filename: string;
};

function safeSegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]/g, "_").replace(/_+/g, "_");
}

export async function renderAndStoreProposalPdf(model: ProposalDocumentModel): Promise<StoredProposalPdf> {
  const html = renderProposalHtml(model);
  const dir = path.join(process.cwd(), "storage", "private", "proposals");
  await mkdir(dir, { recursive: true });

  const stamp = new Date(model.createdAtIso).toISOString().replace(/[:.]/g, "-");
  const filename = safeSegment(`kp-${model.leadId}-${stamp}.pdf`);
  const filePath = path.join(dir, filename);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
  } finally {
    await browser.close();
  }

  return {
    storagePath: filePath,
    publicPath: `/private-uploads/proposals/${filename}`,
    filename,
  };
}

export async function writeProposalErrorSnapshot(leadId: string, reason: string): Promise<string> {
  const dir = path.join(process.cwd(), "storage", "private", "proposals");
  await mkdir(dir, { recursive: true });
  const filename = safeSegment(`kp-${leadId}-error.txt`);
  const filePath = path.join(dir, filename);
  await writeFile(filePath, reason, "utf8");
  return filePath;
}

