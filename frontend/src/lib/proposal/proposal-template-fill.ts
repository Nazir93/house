import { readFile } from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFPage } from "pdf-lib";
import { formatProposalAmount } from "@/lib/proposal/proposal-format";
import { readProposalImageBytes } from "@/lib/proposal/proposal-embed-assets";
import type { ProposalDocumentModel, ProposalPriceRow, ProposalTemplateFillData } from "@/lib/proposal/types";

export type { ProposalTemplateFillData };

type Slot = { x: number; y: number; w: number; h: number; size?: number };

const TEMPLATE_REL = path.join("assets", "proposal", "kp-master-template.pdf");
const FONT_REGULAR = path.join("assets", "fonts", "Arial.ttf");
const FONT_BOLD = path.join("assets", "fonts", "Arial-Bold.ttf");

function amountPlain(rub: number): string {
  return formatProposalAmount(rub, false).replace(/\u00a0/g, " ");
}

function rowAmount(rows: ProposalPriceRow[], key: string): number | null {
  const row = rows.find((r) => r.key === key && r.rowKind !== "section");
  return row && row.amountRub > 0 ? row.amountRub : null;
}

function combinedAmount(rows: ProposalPriceRow[], keys: string[]): number | null {
  let sum = 0;
  let any = false;
  for (const key of keys) {
    const v = rowAmount(rows, key);
    if (v != null) {
      sum += v;
      any = true;
    }
  }
  return any ? sum : null;
}

function cover(page: PDFPage, slot: Slot) {
  page.drawRectangle({
    x: slot.x,
    y: slot.y - 3,
    width: slot.w,
    height: slot.h + 6,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });
}

function drawText(page: PDFPage, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, slot: Slot, text: string) {
  if (!text.trim()) return;
  cover(page, slot);
  page.drawText(text, {
    x: slot.x,
    y: slot.y,
    size: slot.size ?? 11,
    font,
    color: rgb(0.12, 0.12, 0.12),
  });
}

function drawAmount(page: PDFPage, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, slot: Slot, rub: number) {
  drawText(page, font, { ...slot, size: slot.size ?? 16 }, amountPlain(rub));
}

export function buildTemplateFillFromModel(model: ProposalDocumentModel): ProposalTemplateFillData {
  const t = model.templateFill;
  const floorSummary = model.summary.find((s) => s.label === "Этажность")?.value ?? "";
  const floorLabel =
    t?.floorLabel ??
    (floorSummary.includes("2") ? "Двухэтажный" : floorSummary.includes("1,5") ? "1,5 этажа" : "Одноэтажный");

  return {
    constructionLocationLine1: t?.constructionLocationLine1 ?? "уточняется",
    constructionLocationLine2: t?.constructionLocationLine2 ?? "на встрече",
    houseDimensions: t?.houseDimensions ?? "по проекту",
    buildDurationLabel: t?.buildDurationLabel ?? "6-7 месяцев",
    floorLabel,
    wallMaterialLabel: t?.wallMaterialLabel ?? model.summary.find((s) => s.label.includes("материал"))?.value ?? "Газоблок",
    livingRoomAreaLabel: t?.livingRoomAreaLabel ?? "—",
    priceStandardRub: model.packageTotalsRub.STANDARD,
    priceComfortRub: model.packageTotalsRub.ENGINEERING,
    priceComfortPlusRub: model.packageTotalsRub.CLIENT_CHOICE,
    priceWithExtrasRub: model.packageTotalsRub.CLIENT_CHOICE,
  };
}

export async function fillMasterProposalTemplate(model: ProposalDocumentModel): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), TEMPLATE_REL);
  const [templateBytes, fontRegularBytes, fontBoldBytes] = await Promise.all([
    readFile(templatePath),
    readFile(path.join(process.cwd(), FONT_REGULAR)),
    readFile(path.join(process.cwd(), FONT_BOLD)),
  ]);

  const pdf = await PDFDocument.load(templateBytes);
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontRegularBytes);
  const fontBold = await pdf.embedFont(fontBoldBytes);
  const fill = buildTemplateFillFromModel(model);
  const area = model.summary.find((s) => s.label === "Площадь")?.value ?? "";
  const bedrooms = model.summary.find((s) => s.label.includes("спален"))?.value ?? "";
  const bathrooms = model.summary.find((s) => s.label.includes("санузлов"))?.value ?? "";
  const dateLabel = new Date(model.createdAtIso).toLocaleDateString("ru-RU");
  const email = model.leadEmail?.trim() || "—";

  const page1 = pdf.getPage(0);
  drawText(page1, font, { x: 743, y: 85, w: 250, h: 18 }, fill.constructionLocationLine1);
  drawText(page1, font, { x: 743, y: 65, w: 250, h: 18 }, fill.constructionLocationLine2);
  drawText(page1, font, { x: 743, y: 282, w: 250, h: 20 }, model.leadName);
  drawText(page1, font, { x: 743, y: 232, w: 280, h: 20 }, model.leadPhone);
  drawText(page1, font, { x: 743, y: 182, w: 250, h: 20 }, email);
  drawText(page1, font, { x: 743, y: 132, w: 160, h: 20 }, dateLabel);

  const page2 = pdf.getPage(1);
  drawText(page2, font, { x: 220, y: 546, w: 200, h: 20, size: 12 }, fill.houseDimensions);
  drawText(page2, font, { x: 220, y: 424, w: 120, h: 20, size: 12 }, area.replace(/\s/g, " "));
  drawText(page2, font, { x: 280, y: 350, w: 160, h: 20, size: 12 }, fill.buildDurationLabel);
  drawAmount(page2, fontBold, { x: 54, y: 243, w: 200, h: 28, size: 22 }, fill.priceStandardRub);
  drawAmount(page2, fontBold, { x: 53, y: 143, w: 220, h: 28, size: 22 }, fill.priceWithExtrasRub);
  drawText(page2, font, { x: 522, y: 596, w: 150, h: 20, size: 12 }, fill.floorLabel);
  drawText(page2, font, { x: 692, y: 596, w: 150, h: 20, size: 12 }, fill.wallMaterialLabel);

  const page3 = pdf.getPage(2);
  cover(page3, { x: 90, y: 618, w: 290, h: 45 });
  drawText(page3, font, { x: 574, y: 192, w: 120, h: 18, size: 11 }, fill.livingRoomAreaLabel);
  drawText(page3, font, { x: 574, y: 132, w: 80, h: 18, size: 11 }, bathrooms.replace("Количество ", ""));
  drawText(page3, font, { x: 574, y: 70, w: 80, h: 18, size: 11 }, bedrooms.replace("Количество ", ""));

  const planBytes = await readProposalImageBytes(model.planImageUrl);
  if (planBytes) {
    const embedded =
      planBytes[0] === 0x89 && planBytes[1] === 0x50
        ? await pdf.embedPng(planBytes)
        : await pdf.embedJpg(planBytes);
    const planW = 620;
    const planH = 470;
    page3.drawImage(embedded, { x: 350, y: 110, width: planW, height: planH });
  }

  const page9 = pdf.getPage(8);
  drawAmount(page9, fontBold, { x: 89, y: 260, w: 140, h: 22, size: 14 }, fill.priceStandardRub);
  drawAmount(page9, fontBold, { x: 405, y: 260, w: 150, h: 22, size: 14 }, fill.priceComfortRub);
  drawAmount(page9, fontBold, { x: 721, y: 260, w: 170, h: 22, size: 14 }, fill.priceComfortPlusRub);

  const page10 = pdf.getPage(9);
  const itemRows = model.rows.filter((r) => r.rowKind !== "section");
  const page10Slots: Array<{ keys: string[]; slot: Slot }> = [
    { keys: ["eng:electric"], slot: { x: 96, y: 587, w: 120, h: 18 } },
    { keys: ["eng:water"], slot: { x: 96, y: 503, w: 120, h: 18 } },
    { keys: ["eng:sewer"], slot: { x: 96, y: 419, w: 120, h: 18 } },
    { keys: ["eng:bio"], slot: { x: 96, y: 335, w: 120, h: 18 } },
    { keys: ["eng:heatedFloor"], slot: { x: 389, y: 419, w: 120, h: 18 } },
    { keys: ["con:interior_plaster"], slot: { x: 389, y: 251, w: 120, h: 18 } },
    { keys: ["eng:boiler"], slot: { x: 389, y: 335, w: 120, h: 18 } },
    { keys: ["con:blind_area", "con:drainage"], slot: { x: 389, y: 167, w: 120, h: 18 } },
  ];
  for (const { keys, slot } of page10Slots) {
    const amount = keys.length === 1 ? rowAmount(itemRows, keys[0]!) : combinedAmount(itemRows, keys);
    if (amount != null) drawAmount(page10, font, slot, amount);
  }

  return pdf.save();
}
