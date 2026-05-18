export type ParsedPaymentImportRow = {
  label: string;
  amountRubles: number;
};

function isYearNoise(amount: number, line: string): boolean {
  if (amount < 1900 || amount > 2100) return false;
  return /\d{1,2}[./]\d{1,2}[./]\d{2,4}/.test(line) || /\b20\d{2}\s*г/i.test(line);
}

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

const AMOUNT_CHUNK =
  /\d{4,}|\d{1,3}(?:[\s\u00A0]\d{3})+(?:[.,]\d{1,2})?|\d{1,3}(?:[.,]\d{1,2})|\d{1,3}(?![0-9])/g;

export type ParsePaymentScheduleOptions = {
  skipHeaderOnlyLines?: boolean;
};

function stripEnumerationPrefix(label: string): string {
  return label.replace(/^(?:п\.?\s*)?(?:\d+|[ivxlcdm]+)[.)]\s*/i, "").trim();
}

function looksLikeHeaderLine(line: string): boolean {
  const t = line.trim();
  if (t.length === 0) return true;
  if (/^(?:№|n)[\s.)]*$/iu.test(t)) return true;
  const onlyHead =
    /^(?:№\s*)?(?:наименование|название|этап|сумма|дата|период|остаток|всего)\b/iu.test(t) &&
    !/₽|руб/i.test(t);
  if (onlyHead && !/\d/.test(t)) return true;
  return false;
}

function looksLikeDateOrContractNoiseLine(trimmed: string, amount: number): boolean {
  if (/₽|руб/i.test(trimmed)) return false;
  if (amount >= 10_000) return false;
  if (/\d{1,2}[./]\d{1,2}[./]\d{2,4}/.test(trimmed)) return true;
  if (/(?:заключ|договор|от\s+\d)/i.test(trimmed) && amount < 50_000) return true;
  return false;
}

function looksLikePercentNoiseLine(trimmed: string, amount: number): boolean {
  if (/₽|руб/i.test(trimmed)) return false;
  if (!/%/.test(trimmed)) return false;
  return amount < 500;
}

export function parsePaymentScheduleFromPlainText(
  text: string,
  options?: ParsePaymentScheduleOptions
): ParsedPaymentImportRow[] {
  const skipHead = options?.skipHeaderOnlyLines ?? true;
  const lines = text.split(/\r?\n/);
  const out: ParsedPaymentImportRow[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (skipHead && looksLikeHeaderLine(trimmed)) continue;

    const matches = [...trimmed.matchAll(AMOUNT_CHUNK)];
    if (matches.length === 0) continue;

    let chosen: RegExpMatchArray | null = null;

    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i]!;
      const raw = m[0];
      const n = parseRussianAmountToRubles(raw);
      if (n === null || n <= 0) continue;
      if (isYearNoise(n, trimmed)) continue;
      if (looksLikePercentNoiseLine(trimmed, n)) continue;
      if (looksLikeDateOrContractNoiseLine(trimmed, n)) continue;
      chosen = m;
      break;
    }

    if (!chosen) continue;

    const raw = chosen[0];
    const idx = chosen.index ?? 0;

    let label = trimmed.slice(0, idx).replace(/[:\-–—]\s*$/u, "").trim();
    label = stripEnumerationPrefix(label);
    if (!label) {
      label = "Платёж";
    }

    const amountRubles = parseRussianAmountToRubles(raw);
    if (amountRubles === null || amountRubles <= 0) continue;

    out.push({ label, amountRubles });
  }

  return out;
}

export function withSequentialOrder<T extends { order: number }>(rows: T[]): T[] {
  return rows.map((r, i) => ({ ...r, order: i }));
}
