import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { parsePaymentScheduleFromPlainText } from "@/lib/payment-schedule-import";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;

async function fileToPlainText(filename: string, buffer: Buffer): Promise<{ text: string; hint?: string }> {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".txt") || lower.endsWith(".csv")) {
    return { text: buffer.toString("utf8") };
  }

  if (lower.endsWith(".docx")) {
    const r = await mammoth.extractRawText({ buffer });
    return { text: r.value };
  }

  if (lower.endsWith(".pdf")) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const r = await parser.getText();
      const text = r.text ?? "";
      const hint = text.trim().length === 0 ? "PDF без текстового слоя" : undefined;
      return { text, hint };
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("UNSUPPORTED_FORMAT");
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Нет файла" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "До 8 МБ" }, { status: 413 });
    }

    const ab = await file.arrayBuffer();
    const buffer = Buffer.from(ab);
    const name = file.name || "upload";

    let text: string;
    let extractHint: string | undefined;
    try {
      const r = await fileToPlainText(name, buffer);
      text = r.text;
      extractHint = r.hint;
    } catch (e) {
      if (e instanceof Error && e.message === "UNSUPPORTED_FORMAT") {
        return NextResponse.json({ error: "Нужен .pdf, .docx, .txt или .csv" }, { status: 415 });
      }
      throw e;
    }

    const rows = parsePaymentScheduleFromPlainText(text);
    const warnings: string[] = [];
    if (extractHint) warnings.push(extractHint);
    if (rows.length === 0 && text.trim().length > 0) {
      warnings.push("Суммы не распознаны");
    }

    return NextResponse.json({
      rows: rows.map((r) => ({ label: r.label, amountRubles: r.amountRubles })),
      ...(warnings.length > 0 ? { warnings } : {}),
    });
  } catch (e) {
    console.error("[ADMIN PAYMENT SCHEDULE IMPORT]", e);
    return NextResponse.json({ error: "Ошибка обработки" }, { status: 500 });
  }
}
