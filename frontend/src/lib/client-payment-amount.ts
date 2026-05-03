/** Парсинг суммы платежа из тела PUT админки (копейки или рубли). */
export function paymentAmountKopeksFromAdminPayload(p: Record<string, unknown>): number {
  if (p.amountKopeks != null && p.amountKopeks !== "") {
    return Math.max(0, parseInt(String(p.amountKopeks), 10) || 0);
  }
  if (p.amountRubles != null && p.amountRubles !== "") {
    return Math.max(0, Math.round(parseFloat(String(p.amountRubles)) * 100));
  }
  return 0;
}
