import type { ClientPaymentStatus } from "@prisma/client";

export type ClientPaymentScheduleItem = {
  id: string;
  label: string;
  amountKopeks: number;
  dueDate: Date | null;
  status: ClientPaymentStatus;
  paidAt: Date | null;
  order: number;
};

/** Статус «Ожидает оплаты» — единственный, что попадает в блок «Ближайший платёж». */
export function isAwaitingPayment(status: ClientPaymentStatus): boolean {
  return status === "EXPECTED";
}

export type UpcomingPaymentSummary = {
  totalAmountKopeks: number;
  payments: ClientPaymentScheduleItem[];
};

function sortAwaitingPayments(
  payments: ClientPaymentScheduleItem[]
): ClientPaymentScheduleItem[] {
  return [...payments].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    const ad = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bd = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return ad - bd;
  });
}

/**
 * Сводка для блока «Ближайший платёж»: только EXPECTED.
 * Несколько платежей суммируются; порядок — по order / дате.
 */
export function buildUpcomingPaymentSummary(
  payments: ClientPaymentScheduleItem[]
): UpcomingPaymentSummary | null {
  const awaiting = sortAwaitingPayments(payments.filter((p) => isAwaitingPayment(p.status)));
  if (awaiting.length === 0) return null;

  return {
    totalAmountKopeks: awaiting.reduce((sum, p) => sum + p.amountKopeks, 0),
    payments: awaiting,
  };
}

function sortPaymentsSchedule(payments: ClientPaymentScheduleItem[]): ClientPaymentScheduleItem[] {
  return [...payments].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    const ad = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bd = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return ad - bd;
  });
}

/** Первые N строк графика для главной (п. 10 ТЗ). */
export function pickDashboardPaymentPreview(
  payments: ClientPaymentScheduleItem[],
  limit = 2
): ClientPaymentScheduleItem[] {
  return sortPaymentsSchedule(payments).slice(0, limit);
}
