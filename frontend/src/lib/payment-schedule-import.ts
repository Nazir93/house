export type ParsedPaymentImportRow = {
  label: string;
  amountRubles: number;
};

export function parseRussianAmountToRubles(raw: string): number | null {
  const s0 = raw.replace(/\u00A0/g, " ").trim();
  if (!s0) return null;

  if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})$/.test(s0)) {
    const [a, b] = s0.split(",");
    const n = parseFloat(a!.replace(/\./g, "") + "." + b);
    return Number.isFinite(n) ? roundMoney(n) : null;
  }

  const compact = s0.replace(/\s+/g, "");
  if (/^\d{1,3}(?:\d{3})*(?:,\d{1,2})$/.test(compact)) {
    const idx = compact.lastIndexOf(",");
    const intPart = compact.slice(0, idx);
    const dec = compact.slice(idx + 1);
    const n = parseFloat(intPart + "." + dec);
    return Number.isFinite(n) ? roundMoney(n) : null;
  }

  const digits = s0.replace(/\s+/g, "");
  if (/^\d+$/.test(digits)) {
    const n = parseInt(digits, 10);
    if (!Number.isFinite(n) || n < 1) return null;
    return n;
  }

  if (/^\d+[.,]\d{1,2}$/.test(compact)) {
    const n = parseFloat(compact.replace(",", "."));
    return Number.isFinite(n) ? roundMoney(n) : null;
  }

  return null;
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function normalizeCell(s: string): string {
  return s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeHeader(s: string): string {
  return normalizeCell(s).toLowerCase();
}

function isContentColumnHeader(cell: string): boolean {
  const h = normalizeHeader(cell);
  return h.includes("содержание") && (h.includes("этап") || h.includes("работ"));
}

function isAmountColumnHeader(cell: string): boolean {
  const h = normalizeHeader(cell);
  return h.includes("сумма") && (h.includes("платеж") || h.includes("руб"));
}

function isStageNumberColumnHeader(cell: string): boolean {
  const h = normalizeHeader(cell);
  if (/^№/.test(h)) return true;
  if (h.includes("п/п")) return true;
  if (h.includes("№") && h.includes("этап")) return true;
  return false;
}

function isDateColumnHeader(cell: string): boolean {
  const h = normalizeHeader(cell);
  return h.includes("дата") && h.includes("оплат");
}

function isSignatureColumnHeader(cell: string): boolean {
  const h = normalizeHeader(cell);
  return h.includes("роспис") || (h.includes("подпис") && h.includes("получ"));
}

function isTableColumnHeader(cell: string): boolean {
  return (
    isStageNumberColumnHeader(cell) ||
    isContentColumnHeader(cell) ||
    isAmountColumnHeader(cell) ||
    isDateColumnHeader(cell) ||
    isSignatureColumnHeader(cell)
  );
}

function isItogoLabel(label: string): boolean {
  return /^итого/i.test(normalizeCell(label));
}

function isPreTableNoiseLine(line: string): boolean {
  const t = normalizeCell(line);
  if (!t) return true;
  if (/^приложение\b/i.test(t)) return true;
  if (/^график\s+платеж/i.test(t)) return true;
  if (/^оплата\s+работ/i.test(t)) return true;
  if (/^согласно\s+следующему/i.test(t)) return true;
  if (/^к\s+договору/i.test(t)) return true;
  if (/^(?:договор|заключен|заключён)\b/i.test(t)) return true;
  return false;
}

/** «1 этап», «2 этап» — колонка №, не название платежа. */
function isStageMarkerLine(line: string): boolean {
  const t = normalizeCell(line);
  if (/^\d{1,3}$/.test(t)) return true;
  return /^\d{1,2}\s*этап$/i.test(t) || /^этап\s*\d{1,2}$/i.test(t);
}

function looksLikeAmountLine(line: string): boolean {
  if (isStageMarkerLine(line) || isItogoLabel(line)) return false;
  const n = parseRussianAmountToRubles(line);
  if (n === null || n <= 0) return false;
  return true;
}

function splitTableCells(line: string): string[] {
  if (line.includes("\t")) {
    return line.split("\t").map((c) => normalizeCell(c));
  }
  if (line.includes("|")) {
    return line
      .split("|")
      .map((c) => normalizeCell(c))
      .filter((c) => c.length > 0);
  }
  return [normalizeCell(line)];
}

function rowFromCells(
  cells: string[],
  contentCol: number,
  amountCol: number
): ParsedPaymentImportRow | null {
  const label = normalizeCell(cells[contentCol] ?? "");
  const amountRaw = normalizeCell(cells[amountCol] ?? "");

  if (!label || isItogoLabel(label)) return null;
  if (isStageMarkerLine(label)) return null;
  if (isTableColumnHeader(label)) return null;
  if (isPreTableNoiseLine(label)) return null;

  const amountRubles = parseRussianAmountToRubles(amountRaw);
  if (amountRubles === null || amountRubles <= 0) return null;

  if (amountRubles < 1000 && !/[\s\u00A0,]/.test(amountRaw) && amountRaw.replace(/\D/g, "").length <= 3) {
    return null;
  }

  return { label, amountRubles };
}

type TableColumns = {
  contentCol: number;
  amountCol: number;
  colCount: number;
};

function detectColumnsFromHeaderCells(cells: string[]): TableColumns | null {
  let contentCol = -1;
  let amountCol = -1;
  cells.forEach((cell, i) => {
    if (isContentColumnHeader(cell)) contentCol = i;
    if (isAmountColumnHeader(cell)) amountCol = i;
  });
  if (contentCol < 0 || amountCol < 0) return null;
  return { contentCol, amountCol, colCount: cells.length };
}

function findHeaderBlockEnd(normalized: string[]): number {
  let contentLine = -1;
  let amountLine = -1;
  for (let i = 0; i < normalized.length; i++) {
    if (contentLine < 0 && isContentColumnHeader(normalized[i]!)) contentLine = i;
    if (amountLine < 0 && isAmountColumnHeader(normalized[i]!)) amountLine = i;
  }
  if (contentLine < 0 || amountLine < 0) return -1;

  let blockEnd = Math.max(contentLine, amountLine);
  for (let i = blockEnd + 1; i < normalized.length && i <= blockEnd + 4; i++) {
    if (isDateColumnHeader(normalized[i]!) || isSignatureColumnHeader(normalized[i]!)) {
      blockEnd = i;
    } else if (isTableColumnHeader(normalized[i]!)) {
      blockEnd = i;
    } else {
      break;
    }
  }
  return blockEnd;
}

/** Таблица с табуляцией / | (все колонки в одной строке). */
function parseHorizontalTableRows(lines: string[]): ParsedPaymentImportRow[] | null {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (!line.includes("\t") && !line.includes("|")) continue;
    const headerCells = splitTableCells(line);
    const cols = detectColumnsFromHeaderCells(headerCells);
    if (!cols) continue;

    const out: ParsedPaymentImportRow[] = [];
    for (let r = i + 1; r < lines.length; r++) {
      const dataLine = lines[r]!;
      if (!dataLine.includes("\t") && !dataLine.includes("|")) {
        if (out.length > 0) break;
        continue;
      }
      const cells = splitTableCells(dataLine);
      if (cells.length < Math.max(cols.contentCol, cols.amountCol) + 1) continue;

      const labelProbe = normalizeCell(cells[cols.contentCol] ?? "");
      if (isItogoLabel(labelProbe)) break;

      const row = rowFromCells(cells, cols.contentCol, cols.amountCol);
      if (row) out.push(row);
    }

    if (out.length > 0) return out;
  }
  return null;
}

/**
 * Word: строки подряд — «N этап» / номер, затем содержание, затем сумма
 * (пустые «Дата» и «Роспись» в выгрузке часто пропадают).
 */
function parseVerticalByStageMarkers(normalized: string[]): ParsedPaymentImportRow[] | null {
  const headerEnd = findHeaderBlockEnd(normalized);
  if (headerEnd < 0) return null;

  const out: ParsedPaymentImportRow[] = [];
  let i = headerEnd + 1;

  while (i < normalized.length) {
    const line = normalized[i]!;
    if (isItogoLabel(line)) break;
    if (isTableColumnHeader(line)) {
      i++;
      continue;
    }

    while (i < normalized.length && isStageMarkerLine(normalized[i]!)) i++;
    if (i >= normalized.length || isItogoLabel(normalized[i]!)) break;

    const label = normalized[i]!;
    if (isPreTableNoiseLine(label) && out.length === 0) {
      i++;
      continue;
    }
    if (isTableColumnHeader(label) || isStageMarkerLine(label)) {
      i++;
      continue;
    }
    i++;

    while (i < normalized.length && !looksLikeAmountLine(normalized[i]!)) {
      if (isItogoLabel(normalized[i]!)) return out.length > 0 ? out : null;
      if (isStageMarkerLine(normalized[i]!)) break;
      i++;
    }
    if (i >= normalized.length || isItogoLabel(normalized[i]!)) break;

    const amountRubles = parseRussianAmountToRubles(normalized[i]!)!;
    i++;

    if (isItogoLabel(label) || isStageMarkerLine(label) || isTableColumnHeader(label)) continue;
    if (isPreTableNoiseLine(label)) continue;

    out.push({ label, amountRubles });
  }

  return out.length > 0 ? out : null;
}

/** Word: фиксированный блок колонок (3 колонки: № / содержание / сумма). */
function parseVerticalFixedColumns(normalized: string[]): ParsedPaymentImportRow[] | null {
  const headerEnd = findHeaderBlockEnd(normalized);
  if (headerEnd < 0) return null;

  let contentLine = -1;
  let amountLine = -1;
  let blockStart = headerEnd;
  for (let i = 0; i <= headerEnd; i++) {
    const line = normalized[i]!;
    if (isContentColumnHeader(line)) contentLine = i;
    if (isAmountColumnHeader(line)) amountLine = i;
    if (isStageNumberColumnHeader(line)) blockStart = Math.min(blockStart, i);
  }
  if (contentLine < 0 || amountLine < 0) return null;

  const colCount = headerEnd - blockStart + 1;
  if (colCount > 3) return null;

  const contentCol = contentLine - blockStart;
  const amountCol = amountLine - blockStart;

  const out: ParsedPaymentImportRow[] = [];
  for (let i = headerEnd + 1; i + colCount - 1 < normalized.length; i += colCount) {
    const cells = normalized.slice(i, i + colCount);
    const labelProbe = normalizeCell(cells[contentCol] ?? "");
    if (isItogoLabel(labelProbe)) break;

    const row = rowFromCells(cells, contentCol, amountCol);
    if (row) out.push(row);
  }

  return out.length > 0 ? out : null;
}

/**
 * Word: пустые ячейки «Дата» / «Роспись» — строки идут не всегда блоками по 5.
 * Привязываем сумму к ближайшей строке «Содержание» выше.
 */
function parseVerticalByAmountAnchor(normalized: string[]): ParsedPaymentImportRow[] | null {
  const headerEnd = findHeaderBlockEnd(normalized);
  if (headerEnd < 0) return null;

  let headerStart = headerEnd;
  for (let i = 0; i <= headerEnd; i++) {
    if (isStageNumberColumnHeader(normalized[i]!)) headerStart = Math.min(headerStart, i);
  }

  const out: ParsedPaymentImportRow[] = [];
  for (let i = headerEnd + 1; i < normalized.length; i++) {
    const line = normalized[i]!;
    if (isItogoLabel(line)) break;
    if (isTableColumnHeader(line)) continue;
    if (!looksLikeAmountLine(line)) continue;

    const amountRubles = parseRussianAmountToRubles(line)!;

    let label = "";
    for (let j = i - 1; j > headerStart; j--) {
      const prev = normalized[j]!;
      if (isStageMarkerLine(prev)) continue;
      if (looksLikeAmountLine(prev)) break;
      if (isItogoLabel(prev)) break;
      if (isTableColumnHeader(prev)) continue;
      if (isDateColumnHeader(prev) || isSignatureColumnHeader(prev)) continue;
      if (isPreTableNoiseLine(prev) && out.length === 0) continue;
      label = prev;
      break;
    }

    if (!label || isItogoLabel(label) || isStageMarkerLine(label)) continue;
    out.push({ label, amountRubles });
  }

  return out.length > 0 ? out : null;
}

/**
 * Импорт графика платежей (стандартный шаблон):
 * «Содержание работы по этапу» → название, «Сумма платежа (Рубли)» → сумма.
 */
export function parsePaymentScheduleFromPlainText(text: string): ParsedPaymentImportRow[] {
  const normalized = text
    .split(/\r?\n/)
    .map((l) => normalizeCell(l))
    .filter((l) => l.length > 0);

  const fromHorizontal = parseHorizontalTableRows(
    text.split(/\r?\n/).map((l) => l.replace(/\r/g, ""))
  );
  if (fromHorizontal && fromHorizontal.length > 0) return fromHorizontal;

  const fromMarkers = parseVerticalByStageMarkers(normalized);
  if (fromMarkers && fromMarkers.length > 0) return fromMarkers;

  const fromFixed = parseVerticalFixedColumns(normalized);
  if (fromFixed && fromFixed.length > 0) return fromFixed;

  const fromAnchor = parseVerticalByAmountAnchor(normalized);
  if (fromAnchor && fromAnchor.length > 0) return fromAnchor;

  return [];
}

export function withSequentialOrder<T extends { order: number }>(rows: T[]): T[] {
  return rows.map((r, i) => ({ ...r, order: i }));
}
